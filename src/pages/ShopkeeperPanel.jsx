import React, { useState } from 'react';
import { Package, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ShopkeeperPanel() {
  const { user } = useAuth();
  
  // Mock orders for the shopkeeper
  const [orders, setOrders] = useState([
    { id: 'ORD-1001', items: [{ name: 'Veg Thali', qty: 2 }], total: 160, status: 'pending', time: '10 mins ago' },
    { id: 'ORD-1002', items: [{ name: 'Paneer Butter Masala', qty: 1 }, { name: 'Roti', qty: 4 }], total: 170, status: 'preparing', time: '2 mins ago' },
  ]);

  const acceptOrder = (id) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: 'preparing' } : o));
  };

  const markReady = (id) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: 'ready' } : o));
  };

  return (
    <div className="p-4 bg-slate-50 min-h-screen">
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800">Shop Dashboard</h2>
        <p className="text-gray-500 text-sm">Welcome back, {user?.name}</p>
      </div>

      <h3 className="text-lg font-bold text-gray-800 mb-4">Current Orders</h3>
      
      {orders.length === 0 ? (
        <div className="text-center py-10">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No active orders right now.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm p-4 border-l-4 border-orange-500">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-gray-800">{order.id}</span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  order.status === 'preparing' ? 'bg-orange-100 text-orange-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {order.status.toUpperCase()}
                </span>
              </div>
              
              <ul className="text-sm text-gray-600 mb-4 space-y-1">
                {order.items.map((item, idx) => (
                  <li key={idx}>• {item.qty}x {item.name}</li>
                ))}
              </ul>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center text-xs text-gray-400">
                  <Clock className="w-4 h-4 mr-1" />
                  {order.time}
                </div>
                
                {order.status === 'pending' && (
                  <button onClick={() => acceptOrder(order.id)} className="bg-teal-500 hover:bg-teal-600 text-white text-sm font-bold py-2 px-4 rounded-xl transition-colors">
                    Accept Order
                  </button>
                )}
                {order.status === 'preparing' && (
                  <button onClick={() => markReady(order.id)} className="bg-green-500 hover:bg-green-600 text-white text-sm font-bold py-2 px-4 rounded-xl transition-colors">
                    Mark Ready
                  </button>
                )}
                {order.status === 'ready' && (
                  <span className="text-sm font-bold text-green-600 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" /> Waiting for Rider
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
