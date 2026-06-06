import React from 'react';
import { User, Phone, MapPin, Settings, HelpCircle, LogOut, ChevronRight, Star, Shield, Smartphone, Download, ShoppingBag, Car, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import InstallBanner from '../components/InstallBanner';

const ProfilePage = () => {
  const { user } = useAuth();

  const menuItems = [
    { icon: <MapPin className="w-5 h-5 text-gray-500" />, label: 'My Addresses' },
    { icon: <Star className="w-5 h-5 text-yellow-500" />, label: 'Rate Us' },
    { icon: <Shield className="w-5 h-5 text-teal-600" />, label: 'Privacy Policy' },
    { icon: <HelpCircle className="w-5 h-5 text-blue-500" />, label: 'Help & Support' },
    { icon: <LogOut className="w-5 h-5 text-red-500" />, label: 'Logout', isRed: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Profile Header Card */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-800 px-4 pt-10 pb-16 text-white relative shadow-md">
        <h1 className="text-xl font-bold mb-6 text-center">My Profile</h1>
        
        <div className="flex items-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-md border-2 border-white/20">
            {user?.avatar || '👤'}
          </div>
          <div className="ml-4 flex-1">
            <h2 className="text-xl font-bold">{user?.name || 'Guest User'}</h2>
            <p className="text-teal-100 text-sm flex items-center mt-1">
              <Phone className="w-3 h-3 mr-1 opacity-80" /> {user?.phone || 'Add phone'}
            </p>
          </div>
          <button className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full text-sm font-medium transition-colors">
            Edit
          </button>
        </div>
      </div>

      {/* Quick Stats (Overlapping header) */}
      <div className="px-4 -mt-8 relative z-10 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex justify-between">
          <div className="flex flex-col items-center flex-1 border-r border-gray-100">
            <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center mb-1 text-orange-500">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="font-bold text-gray-800">12</span>
            <span className="text-xs text-gray-500">Orders</span>
          </div>
          <div className="flex flex-col items-center flex-1 border-r border-gray-100">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mb-1 text-blue-500">
              <Car className="w-5 h-5" />
            </div>
            <span className="font-bold text-gray-800">3</span>
            <span className="text-xs text-gray-500">Rides</span>
          </div>
          <div className="flex flex-col items-center flex-1">
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center mb-1 text-green-500">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="font-bold text-gray-800">₹450</span>
            <span className="text-xs text-gray-500">Saved</span>
          </div>
        </div>
      </div>

      <InstallBanner />

      {/* Menu Items */}
      <div className="px-4 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {menuItems.map((item, idx) => (
            <button 
              key={idx}
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
