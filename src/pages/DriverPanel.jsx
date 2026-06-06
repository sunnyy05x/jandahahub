import React, { useState, useEffect, useCallback } from 'react';
import { Car, Navigation, MapPin, IndianRupee, Loader2, AlertCircle, Phone, CheckCircle, RefreshCw, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabase';

export default function DriverPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'myRides'
  const [requests, setRequests] = useState([]);
  const [myRides, setMyRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Bidding Modal State
  const [isBidding, setIsBidding] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const { updateProfile } = useAuth();
  const [bidForm, setBidForm] = useState({ vehicle_name: 'Auto Rickshaw', vehicle_number: '', bid_price: '', phone: user?.phone || '' });
  const [submittingBid, setSubmittingBid] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. Fetch available requests (status = 'searching')
      const { data: reqData, error: reqErr } = await supabase
        .from('ride_bookings')
        .select('*')
        .eq('status', 'searching')
        .order('created_at', { ascending: false });

      if (reqErr) throw reqErr;
      setRequests(reqData || []);

      // 2. Fetch my accepted rides
      const { data: myData, error: myErr } = await supabase
        .from('ride_bookings')
        .select('*')
        .eq('driver_id', user.id)
        .in('status', ['accepted', 'in_progress'])
        .order('created_at', { ascending: false });

      if (myErr) throw myErr;
      setMyRides(myData || []);

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();

    // Listen for new ride requests
    const channel = supabase.channel('driver-panel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ride_bookings' }, fetchData)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [fetchData]);

  const openBidModal = (ride) => {
    setSelectedRide(ride);
    setBidForm({ vehicle_name: 'Auto Rickshaw', vehicle_number: '', bid_price: ride.price || '', phone: user?.phone || '' });
    setIsBidding(true);
  };

  const submitBid = async (e) => {
    e.preventDefault();
    if (!bidForm.vehicle_number || !bidForm.bid_price || !bidForm.phone) return alert('Please fill all fields');
    
    setSubmittingBid(true);
    try {
      if (bidForm.phone !== user?.phone) {
        await updateProfile({ phone: bidForm.phone });
      }

      const { error } = await supabase.from('ride_bids').insert([{
        booking_id: selectedRide.id,
        driver_id: user.id,
        driver_name: user.name || 'Driver',
        vehicle_name: bidForm.vehicle_name,
        vehicle_number: bidForm.vehicle_number.toUpperCase(),
        bid_price: Number(bidForm.bid_price),
        status: 'pending'
      }]);

      if (error) throw error;
      alert('Offer sent! Waiting for customer to accept...');
      setIsBidding(false);
    } catch (err) {
      console.error(err);
      alert('Failed to send offer.');
    } finally {
      setSubmittingBid(false);
    }
  };

  const updateRideStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase.from('ride_bookings').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 bg-slate-50 min-h-screen pb-24">
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Driver Dashboard</h2>
            <p className="text-gray-500 text-sm mt-0.5">{user?.name}</p>
          </div>
          <button onClick={fetchData} className="p-2 rounded-xl bg-slate-100">
            <RefreshCw className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex gap-4 mt-6 border-b border-gray-100">
          <button 
            onClick={() => setActiveTab('requests')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'requests' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            Available Requests
          </button>
          <button 
            onClick={() => setActiveTab('myRides')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'myRides' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            My Active Rides ({myRides.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-10 h-10 text-blue-500 animate-spin" /></div>
      ) : activeTab === 'requests' ? (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="text-center py-16 text-gray-400">No ride requests nearby.</div>
          ) : requests.map(r => (
            <div key={r.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-3">
                <span className="font-bold text-gray-800">Customer Request</span>
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-bold uppercase animate-pulse">Searching</span>
              </div>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="flex flex-col items-center">
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                  <div className="w-0.5 h-6 bg-gray-200 my-1"></div>
                  <MapPin className="w-3 h-3 text-orange-500" />
                </div>
                <div className="flex flex-col justify-between h-full space-y-4">
                  <span className="text-sm font-medium text-gray-800">{r.from_location}</span>
                  <span className="text-sm font-medium text-gray-800">{r.to_location}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500">Suggested Fare</p>
                  <p className="font-bold text-lg text-teal-600">₹{r.price}</p>
                </div>
                <button onClick={() => openBidModal(r)} className="bg-blue-600 text-white font-bold px-5 py-2 rounded-xl">
                  Offer Fare
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {myRides.length === 0 ? (
            <div className="text-center py-16 text-gray-400">You have no active rides.</div>
          ) : myRides.map(r => (
            <div key={r.id} className="bg-blue-50 rounded-2xl p-4 shadow-sm border border-blue-200">
              <div className="flex justify-between items-start mb-3">
                <span className="font-bold text-gray-800 text-sm">Active Ride</span>
                <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full font-bold uppercase">{r.status}</span>
              </div>

              <div className="bg-white rounded-xl p-3 mb-3">
                <p className="text-sm font-bold text-gray-800">{r.customer_name}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><Phone className="w-3 h-3"/> {r.customer_phone}</p>
              </div>

              <div className="flex items-center gap-3 mb-4 text-sm font-medium">
                <Navigation className="w-4 h-4 text-blue-500" />
                <span>{r.from_location} ➔ {r.to_location}</span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-blue-100">
                <span className="font-black text-xl text-teal-600">₹{r.price}</span>
                {r.status === 'accepted' ? (
                  <button onClick={() => updateRideStatus(r.id, 'in_progress')} className="bg-blue-600 text-white font-bold px-4 py-2 rounded-xl text-sm">
                    Start Ride
                  </button>
                ) : (
                  <button onClick={() => updateRideStatus(r.id, 'completed')} className="bg-green-600 text-white font-bold px-4 py-2 rounded-xl text-sm">
                    Mark Completed
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bid Modal */}
      {isBidding && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl relative animate-in slide-in-from-bottom-10">
            <button onClick={() => setIsBidding(false)} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full">
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Send Offer</h3>
            
            <form onSubmit={submitBid} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Vehicle Type</label>
                <select value={bidForm.vehicle_name} onChange={e => setBidForm({...bidForm, vehicle_name: e.target.value})} className="w-full mt-1 p-3 bg-slate-50 border-transparent rounded-xl">
                  <option value="Auto Rickshaw">Auto Rickshaw</option>
                  <option value="Cab / Taxi">Cab / Taxi</option>
                  <option value="Bike">Bike</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Vehicle Number</label>
                <input required type="text" value={bidForm.vehicle_number} onChange={e => setBidForm({...bidForm, vehicle_number: e.target.value})} placeholder="e.g. BR 31 X 1234" className="w-full mt-1 p-3 bg-slate-50 border-transparent rounded-xl uppercase" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Your Price (₹)</label>
                <input required type="number" value={bidForm.bid_price} onChange={e => setBidForm({...bidForm, bid_price: e.target.value})} className="w-full mt-1 p-3 bg-slate-50 border-transparent rounded-xl font-bold text-lg" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Your Phone Number</label>
                <input required type="tel" value={bidForm.phone} onChange={e => setBidForm({...bidForm, phone: e.target.value})} placeholder="e.g. 9876543210" className="w-full mt-1 p-3 bg-slate-50 border-transparent rounded-xl" />
              </div>
              <button type="submit" disabled={submittingBid} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center mt-2">
                {submittingBid ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Offer to Customer'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
