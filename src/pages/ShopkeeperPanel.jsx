import React, { useState, useEffect, useCallback } from 'react';
import { Package, CheckCircle, Clock, Loader2, AlertCircle, Phone, MapPin, Store, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabase';

// ── Helpers ──────────────────────────────────────────────────────────────────

const ACTIVE_STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'accepted', 'picked_up', 'out_for_delivery'];

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

function statusColor(status) {
  switch (status) {
    case 'pending':
    case 'confirmed':
      return 'bg-yellow-100 text-yellow-700';
    case 'preparing':
      return 'bg-orange-100 text-orange-700';
    case 'ready':
      return 'bg-green-100 text-green-700';
    case 'accepted':
    case 'picked_up':
    case 'out_for_delivery':
      return 'bg-blue-100 text-blue-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

function borderColor(status) {
  switch (status) {
    case 'pending':
    case 'confirmed':
      return 'border-yellow-400';
    case 'preparing':
      return 'border-orange-500';
    case 'ready':
      return 'border-green-500';
    default:
      return 'border-blue-500';
  }
}

// ── Component ────────────────────────────────────────────────────────────────

export default function ShopkeeperPanel() {
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // ── Fetch active orders ───────────────────────────────────────────────────

  const fetchOrders = useCallback(async () => {
    try {
      setError(null);
      const { data, error: fetchErr } = await supabase
        .from('orders')
        .select('*')
        .in('status', ACTIVE_STATUSES)
        .order('placed_at', { ascending: false });

      if (fetchErr) throw fetchErr;
      setOrders(data || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Initial fetch + Realtime subscription ─────────────────────────────────

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel('shopkeeper-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          const { eventType, new: newRow, old: oldRow } = payload;

          setOrders((prev) => {
            if (eventType === 'INSERT') {
              // Only add if it's an active order and not already present
              if (ACTIVE_STATUSES.includes(newRow.status)) {
                const exists = prev.some((o) => o.id === newRow.id);
                return exists ? prev : [newRow, ...prev];
              }
              return prev;
            }

            if (eventType === 'UPDATE') {
              // If the order moved to a terminal status, remove it
              if (!ACTIVE_STATUSES.includes(newRow.status)) {
                return prev.filter((o) => o.id !== newRow.id);
              }
              // Otherwise update in place
              return prev.map((o) => (o.id === newRow.id ? newRow : o));
            }

            if (eventType === 'DELETE') {
              return prev.filter((o) => o.id !== (oldRow?.id ?? newRow?.id));
            }

            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders]);

  // ── Order actions ─────────────────────────────────────────────────────────

  const updateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      const { error: updateErr } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (updateErr) throw updateErr;

      // Optimistic local update (Realtime will also push the change)
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error('Failed to update order:', err);
      setError(`Failed to update order: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Derived stats ─────────────────────────────────────────────────────────

  const pendingCount = orders.filter((o) => o.status === 'pending' || o.status === 'confirmed').length;
  const preparingCount = orders.filter((o) => o.status === 'preparing').length;
  const readyCount = orders.filter((o) => o.status === 'ready').length;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-4 bg-slate-50 min-h-screen pb-24">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Shop Dashboard</h2>
            <p className="text-gray-500 text-sm mt-0.5">Welcome back, {user?.name || 'Shopkeeper'}</p>
          </div>
          <button
            onClick={() => { setLoading(true); fetchOrders(); }}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
            title="Refresh orders"
          >
            <RefreshCw className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-yellow-700">{pendingCount}</p>
          <p className="text-xs text-yellow-600 font-medium mt-0.5">Pending</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-orange-700">{preparingCount}</p>
          <p className="text-xs text-orange-600 font-medium mt-0.5">Preparing</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-green-700">{readyCount}</p>
          <p className="text-xs text-green-600 font-medium mt-0.5">Ready</p>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-700 font-medium">Something went wrong</p>
            <p className="text-xs text-red-500 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Section title */}
      <h3 className="text-lg font-bold text-gray-800 mb-4">Current Orders</h3>

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-10 h-10 text-teal-500 animate-spin mb-3" />
          <p className="text-gray-400 text-sm">Loading orders…</p>
        </div>
      ) : orders.length === 0 ? (
        /* Empty state */
        <div className="text-center py-16">
          <Package className="w-14 h-14 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No active orders right now</p>
          <p className="text-gray-400 text-sm mt-1">New orders will appear here in real-time</p>
        </div>
      ) : (
        /* Order list */
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className={`bg-white rounded-2xl shadow-sm p-4 border-l-4 ${borderColor(order.status)}`}
            >
              {/* Order header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="font-bold text-gray-800 text-sm">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </span>
                  {order.shop_name && (
                    <span className="ml-2 text-xs text-gray-400 inline-flex items-center gap-1">
                      <Store className="w-3 h-3" /> {order.shop_name}
                    </span>
                  )}
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor(order.status)}`}>
                  {order.status.toUpperCase()}
                </span>
              </div>

              {/* Customer info */}
              <div className="bg-slate-50 rounded-xl p-3 mb-3 space-y-1.5">
                <p className="text-sm font-medium text-gray-700">{order.customer_name || 'Customer'}</p>
                {order.customer_phone && (
                  <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> {order.customer_phone}
                  </p>
                )}
                {order.customer_address && (
                  <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> {order.customer_address}
                  </p>
                )}
              </div>

              {/* Items */}
              <ul className="text-sm text-gray-600 mb-3 space-y-1">
                {(Array.isArray(order.items) ? order.items : []).map((item, idx) => (
                  <li key={idx} className="flex justify-between">
                    <span>• {item.quantity || item.qty || 1}× {item.name}</span>
                    <span className="text-gray-400">₹{(item.price * (item.quantity || item.qty || 1)).toFixed(0)}</span>
                  </li>
                ))}
              </ul>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-800">₹{Number(order.total || 0).toFixed(0)}</span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {timeAgo(order.placed_at)}
                  </span>
                </div>

                {order.status === 'pending' || order.status === 'confirmed' ? (
                  <button
                    onClick={() => updateStatus(order.id, 'preparing')}
                    disabled={updatingId === order.id}
                    className="bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white text-sm font-bold py-2 px-4 rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    {updatingId === order.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : null}
                    Accept Order
                  </button>
                ) : order.status === 'preparing' ? (
                  <button
                    onClick={() => updateStatus(order.id, 'ready')}
                    disabled={updatingId === order.id}
                    className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-sm font-bold py-2 px-4 rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    {updatingId === order.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : null}
                    Mark Ready
                  </button>
                ) : (
                  <span className="text-sm font-bold text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Waiting for Rider
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
