import React, { useState, useEffect, useCallback } from 'react';
import { User, Phone, Loader2, Car, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabase';

export default function DriverPanel() {
  const { user } = useAuth();

  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [todayCompletedCount, setTodayCompletedCount] = useState(0);
  const [actionLoading, setActionLoading] = useState(null); // track which ride id is being acted on

  // Helper: get today's midnight in ISO
  const getTodayMidnight = useCallback(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now.toISOString();
  }, []);

  // Fetch today's earnings (completed rides by this driver today)
  const fetchTodayEarnings = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data, error: earningsError } = await supabase
        .from('ride_bookings')
        .select('price')
        .eq('driver_id', user.id)
        .eq('status', 'completed')
        .gte('created_at', getTodayMidnight());

      if (earningsError) throw earningsError;

      const total = (data || []).reduce((sum, r) => sum + (Number(r.price) || 0), 0);
      setTodayEarnings(total);
      setTodayCompletedCount((data || []).length);
    } catch (err) {
      console.error('Error fetching earnings:', err);
    }
  }, [user?.id, getTodayMidnight]);

  // Fetch rides: available (requested) + my active rides (accepted/in_progress)
  const fetchRides = useCallback(async () => {
    if (!user?.id) return;
    try {
      setError(null);

      // Query 1: all requested rides (available for any driver)
      const { data: availableRides, error: availableError } = await supabase
        .from('ride_bookings')
        .select('id, customer_name, customer_phone, from_location, to_location, vehicle_type, price, seats, status, created_at')
        .eq('status', 'requested')
        .order('created_at', { ascending: false });

      if (availableError) throw availableError;

      // Query 2: my active rides (accepted or in_progress)
      const { data: myRides, error: myError } = await supabase
        .from('ride_bookings')
        .select('id, customer_name, customer_phone, from_location, to_location, vehicle_type, price, seats, status, created_at')
        .eq('driver_id', user.id)
        .in('status', ['accepted', 'in_progress'])
        .order('created_at', { ascending: false });

      if (myError) throw myError;

      // Merge and deduplicate by id
      const combined = [...(myRides || []), ...(availableRides || [])];
      const uniqueMap = new Map();
      combined.forEach((r) => uniqueMap.set(r.id, r));
      setRides(Array.from(uniqueMap.values()));
    } catch (err) {
      console.error('Error fetching rides:', err);
      setError('Failed to load rides. Pull down to retry.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Initial data load
  useEffect(() => {
    fetchRides();
    fetchTodayEarnings();
  }, [fetchRides, fetchTodayEarnings]);

  // Supabase Realtime subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('driver-ride-bookings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ride_bookings' },
        (payload) => {
          const record = payload.new;
          const oldRecord = payload.old;

          if (payload.eventType === 'INSERT') {
            // A new booking appeared — if it's requested, add it
            if (record.status === 'requested') {
              setRides((prev) => {
                if (prev.find((r) => r.id === record.id)) return prev;
                return [record, ...prev];
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            setRides((prev) => {
              // If the ride is now completed or cancelled, remove it from the list
              if (record.status === 'completed' || record.status === 'cancelled') {
                return prev.filter((r) => r.id !== record.id);
              }
              // If it was requested and another driver accepted it, remove it (unless it's us)
              if (record.status === 'accepted' && record.driver_id !== user.id) {
                return prev.filter((r) => r.id !== record.id);
              }
              // Otherwise update the ride in-place, or add it if it's ours
              const exists = prev.find((r) => r.id === record.id);
              if (exists) {
                return prev.map((r) => (r.id === record.id ? { ...r, ...record } : r));
              }
              // If it's our newly accepted ride, add it
              if (record.driver_id === user.id) {
                return [record, ...prev];
              }
              return prev;
            });

            // Refresh earnings when a ride is completed
            if (record.status === 'completed' && record.driver_id === user.id) {
              fetchTodayEarnings();
            }
          } else if (payload.eventType === 'DELETE') {
            setRides((prev) => prev.filter((r) => r.id !== (oldRecord?.id || record?.id)));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchTodayEarnings]);

  // Accept a ride
  const acceptRide = async (rideId) => {
    if (!user?.id) return;
    setActionLoading(rideId);
    try {
      const { error: updateError } = await supabase
        .from('ride_bookings')
        .update({ status: 'accepted', driver_id: user.id })
        .eq('id', rideId)
        .eq('status', 'requested'); // guard: only accept if still requested

      if (updateError) throw updateError;
    } catch (err) {
      console.error('Error accepting ride:', err);
      alert('Failed to accept ride. It may have already been taken.');
      fetchRides(); // refresh to get latest state
    } finally {
      setActionLoading(null);
    }
  };

  // Complete a ride
  const completeRide = async (rideId) => {
    if (!user?.id) return;
    setActionLoading(rideId);
    try {
      const { error: updateError } = await supabase
        .from('ride_bookings')
        .update({ status: 'completed' })
        .eq('id', rideId)
        .eq('driver_id', user.id); // guard: only the assigned driver can complete

      if (updateError) throw updateError;
    } catch (err) {
      console.error('Error completing ride:', err);
      alert('Failed to complete ride. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  // Format time ago
  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-gray-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const activeRides = rides.filter((r) => r.status === 'accepted' || r.status === 'in_progress');
  const availableRides = rides.filter((r) => r.status === 'requested');

  return (
    <div className="p-4 bg-slate-50 min-h-screen pb-20">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-md p-5 mb-6 text-white">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold">Driver Dashboard</h2>
            <p className="text-blue-100 text-sm">Welcome, {user?.name || 'Driver'}</p>
          </div>
          <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
            Online 🟢
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4 bg-white/10 p-3 rounded-xl">
          <div>
            <p className="text-xs text-blue-200">Today's Earnings</p>
            <p className="text-xl font-bold">₹ {todayEarnings.toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-xs text-blue-200">Rides Completed</p>
            <p className="text-xl font-bold">{todayCompletedCount}</p>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={() => { setLoading(true); fetchRides(); fetchTodayEarnings(); }}
            className="ml-auto text-sm font-semibold text-red-600 underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* My Active Rides */}
      {activeRides.length > 0 && (
        <>
          <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Car className="w-5 h-5 text-blue-600" />
            My Active Rides
          </h3>
          <div className="space-y-4 mb-6">
            {activeRides.map((ride) => (
              <RideCard
                key={ride.id}
                ride={ride}
                isActive
                actionLoading={actionLoading}
                onComplete={completeRide}
                timeAgo={timeAgo}
              />
            ))}
          </div>
        </>
      )}

      {/* Available Ride Requests */}
      <h3 className="text-lg font-bold text-gray-800 mb-3">Available Ride Requests</h3>

      {availableRides.length === 0 && activeRides.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-100 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Car className="w-8 h-8 text-blue-400" />
          </div>
          <p className="text-gray-500 font-medium">No ride requests right now</p>
          <p className="text-gray-400 text-sm mt-1">New requests will appear here automatically</p>
        </div>
      )}

      {availableRides.length === 0 && activeRides.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 text-center">
          <p className="text-gray-400 text-sm">No new requests at the moment</p>
        </div>
      )}

      {availableRides.length > 0 && (
        <div className="space-y-4">
          {availableRides.map((ride) => (
            <RideCard
              key={ride.id}
              ride={ride}
              isActive={false}
              actionLoading={actionLoading}
              onAccept={acceptRide}
              timeAgo={timeAgo}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Extracted ride card component for clarity
function RideCard({ ride, isActive, actionLoading, onAccept, onComplete, timeAgo }) {
  const isProcessing = actionLoading === ride.id;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 border border-slate-100 relative overflow-hidden">
      {isActive && (
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-500" />
      )}

      {/* Header: Customer info + Price */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
            <User className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-gray-800 leading-tight">{ride.customer_name || 'Passenger'}</p>
            <p className="text-xs text-gray-500">{timeAgo(ride.created_at)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg text-teal-600">₹{Number(ride.price || 0).toLocaleString('en-IN')}</p>
          {ride.vehicle_type && (
            <p className="text-xs text-gray-400 capitalize">{ride.vehicle_type}</p>
          )}
        </div>
      </div>

      {/* Route: Pickup → Dropoff */}
      <div className="pl-4 border-l-2 border-dashed border-gray-200 ml-5 my-3 relative">
        <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-0 border-2 border-white" />
        <div className="absolute w-3 h-3 bg-red-500 rounded-full -left-[7px] bottom-0 border-2 border-white" />

        <div className="mb-3">
          <p className="text-xs text-gray-400 font-semibold uppercase">Pickup</p>
          <p className="text-sm font-medium text-gray-700">{ride.from_location}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 font-semibold uppercase">Dropoff</p>
          <p className="text-sm font-medium text-gray-700">{ride.to_location}</p>
        </div>
      </div>

      {/* Seats info */}
      {ride.seats && (
        <div className="mt-2 mb-1">
          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
            {ride.seats} {ride.seats === 1 ? 'seat' : 'seats'}
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
        {!isActive ? (
          <button
            onClick={() => onAccept?.(ride.id)}
            disabled={isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Accepting...
              </>
            ) : (
              'Accept Ride'
            )}
          </button>
        ) : (
          <>
            <a
              href={`tel:${ride.customer_phone}`}
              className="flex-1 bg-green-50 text-green-600 flex items-center justify-center gap-2 font-bold py-3 rounded-xl hover:bg-green-100 transition-colors"
            >
              <Phone className="w-4 h-4" />
              Call
            </a>
            <button
              onClick={() => onComplete?.(ride.id)}
              disabled={isProcessing}
              className="flex-[2] bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Completing...
                </>
              ) : (
                'Complete Ride'
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
