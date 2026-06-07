import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, ShoppingBag, Bike, Shield, Activity, Package,
  Loader2, Trash2, ToggleLeft, ToggleRight, IndianRupee, ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabase';

// ── helpers ──────────────────────────────────────────────────────────────────

const ROLE_COLORS = {
  customer:   { bg: 'bg-teal-100',    text: 'text-teal-700' },
  restaurant: { bg: 'bg-orange-100',  text: 'text-orange-700' },
  grocery:    { bg: 'bg-green-100',   text: 'text-green-700' },
  essentials: { bg: 'bg-yellow-100',  text: 'text-yellow-700' },
  driver:     { bg: 'bg-blue-100',    text: 'text-blue-700' },
  delivery:   { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  admin:      { bg: 'bg-red-100',     text: 'text-red-700' },
};

const STATUS_COLORS = {
  pending:          { bg: 'bg-yellow-100',  text: 'text-yellow-700' },
  confirmed:        { bg: 'bg-blue-100',    text: 'text-blue-700' },
  preparing:        { bg: 'bg-indigo-100',  text: 'text-indigo-700' },
  ready:            { bg: 'bg-purple-100',  text: 'text-purple-700' },
  accepted:         { bg: 'bg-sky-100',     text: 'text-sky-700' },
  picked_up:        { bg: 'bg-cyan-100',    text: 'text-cyan-700' },
  out_for_delivery: { bg: 'bg-orange-100',  text: 'text-orange-700' },
  delivered:        { bg: 'bg-green-100',   text: 'text-green-700' },
  cancelled:        { bg: 'bg-red-100',     text: 'text-red-700' },
};

const ROLES = ['customer', 'restaurant', 'grocery', 'essentials', 'driver', 'delivery', 'admin'];

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ── Stat Card (reusable) ────────────────────────────────────────────────────

function StatCard({ icon: Icon, iconColor, label, value, loading }) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
      <Icon className={`w-6 h-6 ${iconColor} mb-2`} />
      <p className="text-xs text-gray-500 font-bold uppercase">{label}</p>
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin text-gray-400 mt-1" />
      ) : (
        <p className="text-2xl font-black text-gray-800">{value}</p>
      )}
    </div>
  );
}

// ── OVERVIEW TAB ────────────────────────────────────────────────────────────

function OverviewTab({ currentRole, switchRole }) {
  const [stats, setStats] = useState({ totalOrders: 0, pendingOrders: 0, totalUsers: 0, totalBookings: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const [ordersRes, pendingRes, usersRes, bookingsRes, revenueRes] = await Promise.all([
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('ride_bookings').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('total').eq('status', 'delivered'),
      ]);

      const revenue = (revenueRes.data || []).reduce((sum, o) => sum + (Number(o.total) || 0), 0);

      setStats({
        totalOrders: ordersRes.count ?? 0,
        pendingOrders: pendingRes.count ?? 0,
        totalUsers: usersRes.count ?? 0,
        totalBookings: bookingsRes.count ?? 0,
        revenue,
      });
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    const channel = supabase
      .channel('admin-overview')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ride_bookings' }, fetchStats)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchStats]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <button onClick={() => switchRole('customer')} className={`p-3 rounded-xl border-2 font-bold flex flex-col items-center justify-center transition-all ${currentRole === 'customer' ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
          <span className="text-2xl mb-1">👤</span> Customer
        </button>
        <button onClick={() => switchRole('restaurant')} className={`p-3 rounded-xl border-2 font-bold flex flex-col items-center justify-center transition-all ${currentRole === 'restaurant' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
          <span className="text-2xl mb-1">👨‍🍳</span> Restaurant
        </button>
        <button onClick={() => switchRole('grocery')} className={`p-3 rounded-xl border-2 font-bold flex flex-col items-center justify-center transition-all ${currentRole === 'grocery' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
          <span className="text-2xl mb-1">🛒</span> Grocery
        </button>
        <button onClick={() => switchRole('essentials')} className={`p-3 rounded-xl border-2 font-bold flex flex-col items-center justify-center transition-all ${currentRole === 'essentials' ? 'border-yellow-500 bg-yellow-50 text-yellow-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
          <span className="text-2xl mb-1">🥚</span> Essentials
        </button>
        <button onClick={() => switchRole('driver')} className={`p-3 rounded-xl border-2 font-bold flex flex-col items-center justify-center transition-all ${currentRole === 'driver' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
          <span className="text-2xl mb-1">🛺</span> Driver
        </button>
        <button onClick={() => switchRole('delivery')} className={`p-3 rounded-xl border-2 font-bold flex flex-col items-center justify-center transition-all ${currentRole === 'delivery' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
          <span className="text-2xl mb-1">🛵</span> Delivery
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard icon={ShoppingBag} iconColor="text-orange-500" label="Total Orders" value={stats.totalOrders} loading={loading} />
        <StatCard icon={Package} iconColor="text-yellow-500" label="Pending" value={stats.pendingOrders} loading={loading} />
        <StatCard icon={Bike} iconColor="text-blue-500" label="Ride Bookings" value={stats.totalBookings} loading={loading} />
        <StatCard icon={Users} iconColor="text-teal-500" label="Total Users" value={stats.totalUsers} loading={loading} />
      </div>

      {/* Revenue card */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
          <IndianRupee className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <p className="text-xs text-gray-500 font-bold uppercase">Revenue (Delivered)</p>
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-gray-400 mt-1" />
          ) : (
            <p className="text-2xl font-black text-green-600">₹{stats.revenue.toLocaleString('en-IN')}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── USERS TAB ───────────────────────────────────────────────────────────────

function UsersTab() {
  const { user, switchRole } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();

    const channel = supabase
      .channel('admin-users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchUsers)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchUsers]);

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    try {
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
      if (error) throw error;

      // If the admin is changing their own role, instantly update the UI!
      if (user && userId === user.id) {
        switchRole(newRole);
      }
    } catch (err) {
      console.error('Error updating role:', err);
      alert('Failed to update role.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
      <h3 className="font-bold text-gray-800 mb-4">All Users ({users.length})</h3>
      <div className="space-y-3">
        {users.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">No users found.</p>
        )}
        {users.map((u) => {
          const roleStyle = ROLE_COLORS[u.role] || ROLE_COLORS.customer;
          return (
            <div key={u.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm text-gray-800 truncate">{u.name || 'Unnamed'}</p>
                <p className="text-xs text-gray-500">{u.phone || '—'}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(u.created_at)}</p>
              </div>
              <div className="relative flex-shrink-0">
                {updatingId === u.id ? (
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                ) : (
                  <div className="relative">
                    <select
                      value={u.role || 'customer'}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className={`appearance-none text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 pr-6 rounded-lg cursor-pointer border-0 focus:ring-2 focus:ring-red-300 ${roleStyle.bg} ${roleStyle.text}`}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── ORDERS TAB ──────────────────────────────────────────────────────────────

function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('orders').select('*').order('placed_at', { ascending: false });
      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel('admin-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchOrders]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-10">No orders found.</p>
      )}
      {orders.map((order) => {
        const statusStyle = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
        return (
          <div key={order.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-gray-800 font-mono text-sm">#{order.id?.substring(0, 8)}</span>
              <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-lg ${statusStyle.bg} ${statusStyle.text}`}>
                {order.status?.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-xs text-gray-600 mb-0.5">
              Customer: <span className="font-semibold">{order.customer_name || '—'}</span>
            </p>
            <p className="text-xs text-gray-600 mb-2">
              Shop: <span className="font-semibold">{order.shop_name || '—'}</span>
            </p>
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <span className="text-sm font-bold text-teal-600">₹{Number(order.total || 0).toLocaleString('en-IN')}</span>
              <span className="text-xs text-gray-400">{formatDate(order.placed_at)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── PRODUCTS TAB ────────────────────────────────────────────────────────────

function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();

    const channel = supabase
      .channel('admin-products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchProducts)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchProducts]);

  const toggleStock = async (product) => {
    setTogglingId(product.id);
    try {
      const { error } = await supabase
        .from('products')
        .update({ in_stock: !product.in_stock })
        .eq('id', product.id);
      if (error) throw error;
    } catch (err) {
      console.error('Error toggling stock:', err);
      alert('Failed to update stock status.');
    } finally {
      setTogglingId(null);
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product? This cannot be undone.')) return;
    setDeletingId(productId);
    try {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) throw error;
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  const CATEGORY_COLORS = {
    food:       'bg-amber-100 text-amber-700',
    grocery:    'bg-green-100 text-green-700',
    essentials: 'bg-violet-100 text-violet-700',
  };

  return (
    <div className="space-y-3">
      {products.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-10">No products found.</p>
      )}
      {products.map((p) => (
        <div key={p.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                {p.image?.startsWith('http') ? (
                  <div className="w-8 h-8 rounded-md overflow-hidden shrink-0 border border-slate-200">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  p.image && <span className="text-lg">{p.image}</span>
                )}
                <h4 className="font-bold text-sm text-gray-800 truncate">{p.name}</h4>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${CATEGORY_COLORS[p.category] || 'bg-gray-100 text-gray-600'}`}>
                  {p.category}
                </span>
                {p.subcategory && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-500">
                    {p.subcategory}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">Shop: <span className="font-semibold text-gray-700">{p.shop_name || '—'}</span></p>
              <p className="text-sm font-bold text-teal-600 mt-1">₹{Number(p.price || 0).toLocaleString('en-IN')}{p.unit ? `/${p.unit}` : ''}</p>
            </div>

            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              {/* Stock toggle */}
              <button
                onClick={() => toggleStock(p)}
                disabled={togglingId === p.id}
                className="flex items-center gap-1.5"
                title={p.in_stock ? 'In Stock — click to mark out' : 'Out of Stock — click to mark in'}
              >
                {togglingId === p.id ? (
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                ) : p.in_stock ? (
                  <>
                    <ToggleRight className="w-7 h-7 text-green-500" />
                    <span className="text-[10px] font-bold text-green-600">IN STOCK</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-7 h-7 text-gray-400" />
                    <span className="text-[10px] font-bold text-gray-400">OUT</span>
                  </>
                )}
              </button>

              {/* Delete button */}
              <button
                onClick={() => deleteProduct(p.id)}
                disabled={deletingId === p.id}
                className="p-2 rounded-xl bg-red-50 hover:bg-red-100 transition-colors"
                title="Delete product"
              >
                {deletingId === p.id ? (
                  <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                ) : (
                  <Trash2 className="w-4 h-4 text-red-500" />
                )}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── MAIN ADMIN PANEL ────────────────────────────────────────────────────────

const TABS = [
  { key: 'overview', label: 'Overview',  icon: Activity },
  { key: 'users',    label: 'Users',     icon: Users },
  { key: 'orders',   label: 'Orders',    icon: Package },
  { key: 'products', label: 'Products',  icon: ShoppingBag },
];

export default function AdminPanel() {
  const { user, currentRole, switchRole } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white p-5 pb-8 rounded-b-3xl shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6" />
            <h1 className="text-xl font-bold tracking-tight">Admin Console</h1>
          </div>
          <div className="text-sm font-medium bg-black/20 px-3 py-1 rounded-full">
            {user?.name}
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {TABS.map(({ key, label, icon: TabIcon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${
                activeTab === key ? 'bg-white text-red-600' : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              <TabIcon className="w-4 h-4 inline mr-1.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 -mt-4 relative z-10">
        {activeTab === 'overview' && <OverviewTab currentRole={currentRole} switchRole={switchRole} />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'orders' && <OrdersTab />}
        {activeTab === 'products' && <ProductsTab />}
      </div>
    </div>
  );
}
