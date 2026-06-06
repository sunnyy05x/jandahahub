import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, HelpCircle, LogOut, ChevronRight, Star, Shield, ShoppingBag, Car, Wallet, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabase';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ orders: 0, rides: 0, spent: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    
    async function fetchStats() {
      try {
        // Fetch order count
        const { count: orderCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('customer_id', user.id);

        // Fetch ride count
        const { count: rideCount } = await supabase
          .from('ride_bookings')
          .select('*', { count: 'exact', head: true })
          .eq('customer_id', user.id);

        // Fetch total spent
        const { data: deliveredOrders } = await supabase
          .from('orders')
          .select('total')
          .eq('customer_id', user.id)
          .eq('status', 'delivered');

        const totalSpent = (deliveredOrders || []).reduce((sum, o) => sum + (o.total || 0), 0);

        setStats({
          orders: orderCount || 0,
          rides: rideCount || 0,
          spent: totalSpent
        });
      } catch (err) {
        console.error('Error fetching profile stats:', err);
      } finally {
        setLoadingStats(false);
      }
    }

    fetchStats();
  }, [user?.id]);

  const handleLogout = async () => {
    await logout();
  };

  const menuItems = [
    { icon: <MapPin className="w-5 h-5 text-gray-500" />, label: 'My Addresses', action: null },
    { icon: <Star className="w-5 h-5 text-yellow-500" />, label: 'Rate Us', action: null },
    { icon: <Shield className="w-5 h-5 text-teal-600" />, label: 'Privacy Policy', action: null },
    { icon: <HelpCircle className="w-5 h-5 text-blue-500" />, label: 'Help & Support', action: null },
    { icon: <LogOut className="w-5 h-5 text-red-500" />, label: 'Logout', isRed: true, action: handleLogout },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Profile Header Card */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-800 px-4 pt-10 pb-16 text-white relative shadow-md">
        <h1 className="text-xl font-bold mb-6 text-center">My Profile</h1>
        
        <div className="flex items-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-md border-2 border-white/20 overflow-hidden">
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="avatar" className="w-full h-full object-cover rounded-full" />
            ) : (
              <span>{user?.avatar || '👤'}</span>
            )}
          </div>
          <div className="ml-4 flex-1">
            <h2 className="text-xl font-bold">{user?.name || user?.user_metadata?.full_name || 'User'}</h2>
            <p className="text-teal-100 text-sm flex items-center mt-1">
              <Phone className="w-3 h-3 mr-1 opacity-80" /> {user?.email || user?.phone || 'No contact'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 -mt-8 relative z-10 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex justify-between">
          <div className="flex flex-col items-center flex-1 border-r border-gray-100">
            <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center mb-1 text-orange-500">
              <ShoppingBag className="w-5 h-5" />
            </div>
            {loadingStats ? (
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            ) : (
              <span className="font-bold text-gray-800">{stats.orders}</span>
            )}
            <span className="text-xs text-gray-500">Orders</span>
          </div>
          <div className="flex flex-col items-center flex-1 border-r border-gray-100">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mb-1 text-blue-500">
              <Car className="w-5 h-5" />
            </div>
            {loadingStats ? (
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            ) : (
              <span className="font-bold text-gray-800">{stats.rides}</span>
            )}
            <span className="text-xs text-gray-500">Rides</span>
          </div>
          <div className="flex flex-col items-center flex-1">
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center mb-1 text-green-500">
              <Wallet className="w-5 h-5" />
            </div>
            {loadingStats ? (
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            ) : (
              <span className="font-bold text-gray-800">₹{stats.spent}</span>
            )}
            <span className="text-xs text-gray-500">Spent</span>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-4 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {menuItems.map((item, idx) => (
            <button 
              key={idx}
              onClick={item.action || undefined}
              className={`w-full flex items-center justify-between p-4 transition-colors hover:bg-gray-50 ${idx !== menuItems.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <div className="flex items-center">
                <div className="mr-3">{item.icon}</div>
                <span className={`font-medium ${item.isRed ? 'text-red-500' : 'text-gray-800'}`}>
                  {item.label}
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          ))}
        </div>
      </div>

      {/* Version */}
      <div className="text-center pb-8">
        <p className="text-sm font-bold text-gray-400">JandahaHub v1.0.0</p>
        <p className="text-xs text-gray-400 mt-1">Made with ❤️ for Jandaha</p>
      </div>
    </div>
  );
};

export default ProfilePage;
