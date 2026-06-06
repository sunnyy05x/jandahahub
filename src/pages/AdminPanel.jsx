import React, { useState } from 'react';
import { Users, ShoppingBag, Bike, Settings, Shield, Activity, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';

export default function AdminPanel() {
  const { user } = useAuth();
  const { orders } = useOrders();
  const [activeTab, setActiveTab] = useState('overview');

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const deliveredOrders = orders.filter(o => o.status === 'delivered');

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
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

        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'overview' ? 'bg-white text-red-600' : 'bg-white/20 hover:bg-white/30'}`}
          >
            <Activity className="w-4 h-4 inline mr-2" /> Overview
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'users' ? 'bg-white text-red-600' : 'bg-white/20 hover:bg-white/30'}`}
          >
            <Users className="w-4 h-4 inline mr-2" /> Manage Users
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'orders' ? 'bg-white text-red-600' : 'bg-white/20 hover:bg-white/30'}`}
          >
            <Package className="w-4 h-4 inline mr-2" /> All Orders
          </button>
        </div>
      </div>

      <div className="p-4 -mt-4 relative z-10">
        
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <ShoppingBag className="w-6 h-6 text-orange-500 mb-2" />
                <p className="text-xs text-gray-500 font-bold uppercase">Total Orders</p>
                <p className="text-2xl font-black text-gray-800">{orders.length}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <Package className="w-6 h-6 text-yellow-500 mb-2" />
                <p className="text-xs text-gray-500 font-bold uppercase">Pending</p>
                <p className="text-2xl font-black text-gray-800">{pendingOrders.length}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <Bike className="w-6 h-6 text-blue-500 mb-2" />
                <p className="text-xs text-gray-500 font-bold uppercase">Active Rides</p>
                <p className="text-2xl font-black text-gray-800">12</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <Users className="w-6 h-6 text-teal-500 mb-2" />
                <p className="text-xs text-gray-500 font-bold uppercase">Total Users</p>
                <p className="text-2xl font-black text-gray-800">145</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-gray-800 mb-3">System Health</h3>
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-sm text-gray-600">Database Connection</span>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">Online</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-sm text-gray-600">Payment Gateway</span>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">Online</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">SMS OTP Service</span>
                <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-lg">Degraded</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-gray-800 mb-4">User Roles Directory</h3>
            <div className="space-y-3">
              {[
                { name: 'Amit Kumar', role: 'Customer', phone: '9876543210' },
                { name: 'Sharma Ji', role: 'Shopkeeper', phone: '9876543211' },
                { name: 'Raju Driver', role: 'Cab/Rapido', phone: '9876543212' },
                { name: 'Vikas Delivery', role: 'Deliveryman', phone: '9876543213' },
              ].map((u, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <div>
                    <p className="font-bold text-sm text-gray-800">{u.name}</p>
                    <p className="text-xs text-gray-500">{u.phone}</p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-200 text-gray-700 px-2 py-1 rounded">
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 bg-slate-100 text-slate-700 font-bold py-3 rounded-xl text-sm">
              + Add New User Manually
            </button>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-3">
            {orders.map(order => (
              <div key={order.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-gray-800">{order.id}</span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-1">Customer: <span className="font-semibold">{order.customerName}</span></p>
                <p className="text-xs text-gray-600 mb-2">Shop: <span className="font-semibold">{order.shopName}</span></p>
                <div className="flex justify-between items-center pt-2 border-t border-gray-50 mt-2">
                  <span className="text-sm font-bold text-teal-600">₹{order.total}</span>
                  <span className="text-xs text-gray-400">{new Date(order.placedAt).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
