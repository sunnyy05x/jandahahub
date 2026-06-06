import React, { useState } from 'react';
import { Package, Phone, MapPin, CheckCircle, Truck, Clock, User, ChevronDown, ChevronUp } from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';

const AdminPanel = () => {
  const { orders, updateOrderStatus } = useOrders();
  const { switchRole } = useAuth();
  
  const [showDelivered, setShowDelivered] = useState(false);

  // Group orders
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const confirmedOrders = orders.filter(o => o.status === 'confirmed');
  const transitOrders = orders.filter(o => o.status === 'out_for_delivery');
  const deliveredOrders = orders.filter(o => o.status === 'delivered');

  const activeOrders = [...pendingOrders, ...confirmedOrders, ...transitOrders].sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt));

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold">New Order</span>;
      case 'confirmed': return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-bold">Preparing</span>;
      case 'out_for_delivery': return <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-bold flex items-center"><Truck className="w-3 h-3 mr-1" /> On The Way</span>;
      case 'delivered': return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold">Delivered</span>;
      default: return null;
    }
  };

  const getNextAction = (status, id) => {
    switch (status) {
      case 'pending':
        return (
          <button 
            onClick={() => updateOrderStatus(id, 'confirmed')}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-sm hover:bg-blue-700 transition-colors"
          >
            Confirm Order
          </button>
        );
      case 'confirmed':
        return (
          <button 
            onClick={() => updateOrderStatus(id, 'out_for_delivery')}
            className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl shadow-sm hover:bg-orange-600 transition-colors"
          >
            Mark Out for Delivery
          </button>
        );
      case 'out_for_delivery':
        return (
          <button 
            onClick={() => updateOrderStatus(id, 'delivered')}
            className="w-full bg-green-600 text-white font-bold py-3 rounded-xl shadow-sm hover:bg-green-700 transition-colors flex justify-center items-center"
          >
            <CheckCircle className="w-5 h-5 mr-2" /> Mark Delivered
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      {/* Admin Header */}
      <div className="bg-gray-900 text-white px-4 pt-10 pb-6 sticky top-0 z-20 shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold flex items-center">
            <Package className="w-6 h-6 mr-2 text-teal-400" />
            Rider Panel
          </h1>
          <button 
            onClick={() => switchRole('customer')}
            className="bg-gray-800 border border-gray-700 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-700 transition-colors"
          >
            Exit Admin
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-yellow-500 text-yellow-950 rounded-xl p-3 shadow-inner">
            <p className="text-xs font-bold opacity-80 mb-1">Pending</p>
            <p className="text-2xl font-black">{pendingOrders.length}</p>
          </div>
          <div className="bg-blue-500 text-white rounded-xl p-3 shadow-inner">
            <p className="text-xs font-bold opacity-80 mb-1">In Transit</p>
            <p className="text-2xl font-black">{transitOrders.length}</p>
          </div>
          <div className="bg-green-500 text-white rounded-xl p-3 shadow-inner">
            <p className="text-xs font-bold opacity-80 mb-1">Delivered</p>
            <p className="text-2xl font-black">{deliveredOrders.length}</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-gray-500" />
          Active Deliveries ({activeOrders.length})
        </h2>

        {activeOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-gray-200 border-dashed">
            <p className="text-gray-500">No active deliveries right now. Take a break! ☕</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeOrders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                  {getStatusBadge(order.status)}
                  <span className="text-xs font-mono text-gray-500">#{order.id}</span>
                </div>

                {/* Details */}
                <div className="p-4">
                  <div className="flex items-start mb-3">
                    <User className="w-5 h-5 text-gray-400 mr-3 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-gray-800">{order.customerName}</p>
                      <p className="text-sm text-gray-600">{order.customerPhone}</p>
                    </div>
                  </div>

                  <div className="flex items-start mb-4">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{order.customerAddress}</p>
                    </div>
                  </div>

                  <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 mb-4">
                    <div className="flex items-center mb-2">
                      <Package className="w-4 h-4 text-orange-500 mr-2" />
                      <span className="text-sm font-bold text-orange-800">Pickup from: {order.shopName}</span>
                    </div>
                    <p className="text-xs text-orange-700">{order.items.length} items to collect</p>
                  </div>

                  {/* Financial Row */}
                  <div className="flex justify-between items-end mb-4 p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-xs text-gray-500 font-bold">Collect Cash</p>
                      <p className="text-xl font-black text-gray-800">₹{order.total}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 font-bold">Your Earnings</p>
                      <p className="text-lg font-bold text-green-600">+₹{order.riderEarnings || 20}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <a 
                      href={`tel:${order.customerPhone}`}
                      className="flex items-center justify-center w-full bg-gray-100 text-gray-800 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      <Phone className="w-5 h-5 mr-2" /> Call Customer
                    </a>
                    {getNextAction(order.status, order.id)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delivered Section Toggle */}
        <div className="mt-8">
          <button 
            onClick={() => setShowDelivered(!showDelivered)}
            className="flex items-center text-gray-600 font-medium mb-4 hover:text-gray-900"
          >
            {showDelivered ? <ChevronUp className="w-5 h-5 mr-1" /> : <ChevronDown className="w-5 h-5 mr-1" />}
            Past Deliveries ({deliveredOrders.length})
          </button>

          {showDelivered && (
            <div className="space-y-3 opacity-70">
              {deliveredOrders.map(order => (
                <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-sm">#{order.id} • {order.customerName}</p>
                    <p className="text-xs text-gray-500">Collected ₹{order.total}</p>
                  </div>
                  <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded">Done</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
