import React, { useState, useEffect, useCallback } from 'react';
import { Package, MapPin, Phone, CheckCircle, Loader2, PackageOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabase';

export default function DeliveryPanel() {
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [actionLoading, setActionLoading] = useState(null); // tracks which order id is being acted on

  // Get today's midnight in ISO format
  const getTodayMidnight = useCallback(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now.toISOString();
  }, []);

  // Fetch today's earnings
  const fetchEarnings = useCallback(async () => {
    if (!user?.id) return;
    try {
      const todayMidnight = getTodayMidnight();
      const { data, error: earningsError } = await supabase
        .from('orders')
        .select('rider_earnings')
        .eq('rider_id', user.id)
        .eq('status', 'delivered')
        .gte('placed_at', todayMidnight);

      if (earningsError) throw earningsError;

      const total = (data || []).reduce((sum, o) => sum + (o.rider_earnings || 20), 0);
      setTodayEarnings(total);
      setTodayCount((data || []).length);
    } catch (err) {
      console.error('Error fetching earnings:', err);
    }
  }, [user?.id, getTodayMidnight]);

  // Fetch active orders (available + my active)
  const fetchOrders = useCallback(async () => {
    if (!user?.id) return;
    try {
      setError(null);

      // Query 1: Orders ready for pickup (no rider assigned yet)
      const { data: availableOrders, error: err1 } = await supabase
        .from('orders')
        .select('id, customer_name, customer_phone, customer_address, shop_name, total, status, rider_id, rider_earnings, placed_at')
        .eq('status', 'ready')
        .is('rider_id', null)
        .order('placed_at', { ascending: false });

      if (err1) throw err1;

      // Query 2: My active deliveries
      const { data: myOrders, error: err2 } = await supabase
        .from('orders')
        .select('id, customer_name, customer_phone, customer_address, shop_name, total, status, rider_id, rider_earnings, placed_at')
        .eq('rider_id', user.id)
        .in('status', ['accepted', 'picked_up', 'out_for_delivery'])
        .order('placed_at', { ascending: false });

      if (err2) throw err2;

      // Merge & deduplicate by id
      const merged = [...(myOrders || []), ...(availableOrders || [])];
      const unique = Array.from(new Map(merged.map(o => [o.id, o])).values());
      setOrders(unique);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load deliveries. Pull down to retry.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Initial fetch
  useEffect(() => {
    fetchOrders();
    fetchEarnings();
  }, [fetchOrders, fetchEarnings]);

  // Realtime subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('delivery-panel-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          const updated = payload.new;
          const eventType = payload.eventType;

          if (eventType === 'DELETE') {
            setOrders(prev => prev.filter(o => o.id !== payload.old.id));
            return;
          }

          // Determine if this order should be in our list
          const isAvailable = updated.status === 'ready' && !updated.rider_id;
          const isMine = updated.rider_id === user.id &&
            ['accepted', 'picked_up', 'out_for_delivery'].includes(updated.status);

          if (isAvailable || isMine) {
            setOrders(prev => {
              const exists = prev.find(o => o.id === updated.id);
              if (exists) {
                return prev.map(o => o.id === updated.id ? updated : o);
              }
              return [updated, ...prev];
            });
          } else {
            // Order no longer qualifies — remove it from the list
            setOrders(prev => prev.filter(o => o.id !== updated.id));
          }

          // Refresh earnings if a delivery was completed
          if (updated.status === 'delivered' && updated.rider_id === user.id) {
            fetchEarnings();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchEarnings]);

  // --- Action handlers ---

  const acceptDelivery = async (orderId) => {
    setActionLoading(orderId);
    try {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ rider_id: user.id, status: 'accepted' })
        .eq('id', orderId)
        .eq('status', 'ready'); // guard: only accept if still ready

      if (updateError) throw updateError;
    } catch (err) {
      console.error('Error accepting delivery:', err);
      alert('Failed to accept delivery. It may have been taken by another rider.');
      fetchOrders(); // refresh to get latest state
    } finally {
      setActionLoading(null);
    }
  };

  const markPickedUp = async (orderId) => {
    setActionLoading(orderId);
    try {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'out_for_delivery' })
        .eq('id', orderId)
        .eq('rider_id', user.id);

      if (updateError) throw updateError;
    } catch (err) {
      console.error('Error marking picked up:', err);
      alert('Failed to update order status.');
    } finally {
      setActionLoading(null);
    }
  };

  const markDelivered = async (orderId) => {
    setActionLoading(orderId);
    try {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'delivered' })
        .eq('id', orderId)
        .eq('rider_id', user.id);

      if (updateError) throw updateError;
    } catch (err) {
      console.error('Error marking delivered:', err);
      alert('Failed to update order status.');
    } finally {
      setActionLoading(null);
    }
  };

  // --- Helpers ---

  const getStatusBadge = (status) => {
    const map = {
      ready: { label: 'Available', bg: 'bg-blue-100 text-blue-700' },
      accepted: { label: 'Accepted', bg: 'bg-yellow-100 text-yellow-700' },
      picked_up: { label: 'Picked Up', bg: 'bg-orange-100 text-orange-700' },
      out_for_delivery: { label: 'Out for Delivery', bg: 'bg-purple-100 text-purple-700' },
    };
    const info = map[status] || { label: status, bg: 'bg-gray-100 text-gray-600' };
    return (
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${info.bg}`}>
        {info.label}
      </span>
    );
  };

  const formatOrderId = (id) => {
    if (!id) return '';
    return id.substring(0, 8).toUpperCase();
  };

  // --- Render ---

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading deliveries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-slate-50 min-h-screen pb-20">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl shadow-md p-5 mb-6 text-white">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold">Delivery Dashboard</h2>
            <p className="text-teal-100 text-sm">Welcome, {user?.name}</p>
          </div>
          <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
            Online 🟢
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4 bg-white/10 p-3 rounded-xl">
          <div>
            <p className="text-xs text-teal-200">Today's Earnings</p>
            <p className="text-xl font-bold">₹ {todayEarnings}</p>
          </div>
          <div>
            <p className="text-xs text-teal-200">Orders Delivered</p>
            <p className="text-xl font-bold">{todayCount}</p>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3 mb-4 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => { setLoading(true); fetchOrders(); fetchEarnings(); }}
            className="text-red-600 font-semibold underline text-xs ml-2"
          >
            Retry
          </button>
        </div>
      )}

      <h3 className="text-lg font-bold text-gray-800 mb-4">Active Deliveries</h3>

      {/* Empty State */}
      {orders.length === 0 && !error && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <PackageOpen className="w-8 h-8 text-teal-400" />
          </div>
          <p className="text-gray-500 font-medium">No deliveries available</p>
          <p className="text-gray-400 text-sm mt-1">New orders will appear here in real-time</p>
        </div>
      )}

      {/* Order Cards */}
      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="bg-white rounded-2xl shadow-sm p-4 border border-slate-100 relative overflow-hidden">
            {/* Active indicator bar */}
            {order.status !== 'ready' && (
              <div className="absolute top-0 left-0 w-full h-1 bg-teal-500"></div>
            )}

            {/* Header row */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center text-teal-600">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-800 leading-tight">
                    #{formatOrderId(order.id)}
                  </p>
                  <div className="mt-0.5">{getStatusBadge(order.status)}</div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Earning</p>
                <p className="font-bold text-lg text-emerald-600">
                  ₹{order.rider_earnings || 20}
                </p>
                <p className="text-xs text-gray-400">Order: ₹{order.total}</p>
              </div>
            </div>

            {/* Pickup → Delivery route */}
            <div className="pl-4 border-l-2 border-dashed border-gray-200 ml-5 my-3 relative">
              <div className="absolute w-3 h-3 bg-teal-500 rounded-full -left-[7px] top-0 border-2 border-white"></div>
              <div className="absolute w-3 h-3 bg-orange-500 rounded-full -left-[7px] bottom-0 border-2 border-white"></div>

              <div className="mb-4">
                <p className="text-xs text-gray-400 font-semibold uppercase">Pickup From</p>
                <p className="text-sm font-bold text-gray-800">{order.shop_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase">Deliver To</p>
                <p className="text-sm font-bold text-gray-800">{order.customer_name}</p>
                <p className="text-xs text-gray-600">{order.customer_address}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
              {order.status === 'ready' && (
                <button
                  onClick={() => acceptDelivery(order.id)}
                  disabled={actionLoading === order.id}
                  className="w-full bg-teal-500 hover:bg-teal-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {actionLoading === order.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Accept Delivery'
                  )}
                </button>
              )}

              {order.status === 'accepted' && (
                <>
                  <a
                    href={`tel:${order.customer_phone}`}
                    className="flex-1 bg-green-50 text-green-600 flex items-center justify-center gap-2 font-bold py-3 rounded-xl"
                  >
                    <Phone className="w-4 h-4" /> Call
                  </a>
                  <button
                    onClick={() => markPickedUp(order.id)}
                    disabled={actionLoading === order.id}
                    className="flex-[2] bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {actionLoading === order.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "I've Picked Up Order"
                    )}
                  </button>
                </>
              )}

              {(order.status === 'picked_up' || order.status === 'out_for_delivery') && (
                <>
                  <a
                    href={`tel:${order.customer_phone}`}
                    className="flex-1 bg-green-50 text-green-600 flex items-center justify-center gap-2 font-bold py-3 rounded-xl"
                  >
                    <Phone className="w-4 h-4" /> Call
                  </a>
                  <button
                    onClick={() => markDelivered(order.id)}
                    disabled={actionLoading === order.id}
                    className="flex-[2] bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {actionLoading === order.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      'Mark Delivered'
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
