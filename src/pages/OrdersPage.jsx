import React, { useState } from 'react';
import { ClipboardList, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import OrderCard from '../components/OrderCard';

const OrdersPage = () => {
  const { getCustomerOrders } = useOrders();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All'); // 'All' | 'Active' | 'Completed'

  const allOrders = getCustomerOrders();
  
  // Sort by newest first
  const sortedOrders = [...allOrders].sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt));
  
  const filteredOrders = sortedOrders.filter(order => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Active') return ['pending', 'confirmed', 'out_for_delivery'].includes(order.status);
    if (activeTab === 'Completed') return order.status === 'delivered';
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white sticky top-0 z-10 px-4 py-4 border-b border-gray-100 shadow-sm flex items-center">
        <ClipboardList className="w-6 h-6 text-teal-600 mr-2" />
        <h1 className="text-lg font-bold text-gray-800">My Orders</h1>
      </div>

      <div className="bg-white px-4 py-3 mb-4 shadow-sm">
        <div className="flex space-x-2">
          {['All', 'Active', 'Completed'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab 
                  ? 'bg-teal-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center mt-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">No orders found</h2>
            <p className="text-gray-500 mb-6 text-sm">
              {activeTab === 'All' 
                ? "You haven't placed any orders yet." 
                : `You don't have any ${activeTab.toLowerCase()} orders.`}
            </p>
            <button 
              onClick={() => navigate('/')}
              className="bg-teal-600 text-white font-bold py-3 px-8 rounded-xl shadow-sm hover:bg-teal-700 transition-colors w-full"
            >
              Start Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
