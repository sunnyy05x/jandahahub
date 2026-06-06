import React, { useState } from 'react';
import { Package, MapPin, Phone, CheckCircle, Navigation } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DeliveryPanel() {
  const { user } = useAuth();
  
  const [deliveries, setDeliveries] = useState([
    { id: 'DEL-801', shopName: 'Sharma Ji Ka Dhaba', shopAddress: 'Main Market, Jandaha', customerName: 'Vikas Kumar', customerAddress: 'Ward 8, Near SBI Branch', phone: '9876543220', status: 'available', distance: '1.2 km', earnings: 25 },
    { id: 'DEL-802', shopName: 'Gupta Kirana Store', shopAddress: 'Gandhi Chowk, Jandaha', customerName: 'Anita Devi', customerAddress: 'Ward 3', phone: '9876543221', status: 'picked_up', distance: '0.8 km', earnings: 15 },
  ]);

  const acceptDelivery = (id) => {
    setDeliveries(deliveries.map(d => d.id === id ? { ...d, status: 'accepted' } : d));
  };

  const markPickedUp = (id) => {
    setDeliveries(deliveries.map(d => d.id === id ? { ...d, status: 'picked_up' } : d));
  };

  const markDelivered = (id) => {
    setDeliveries(deliveries.map(d => d.id === id ? { ...d, status: 'delivered' } : d));
  };

  return (
    <div className="p-4 bg-slate-50 min-h-screen pb-20">
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
            <p className="text-xl font-bold">₹ 150</p>
          </div>
          <div>
            <p className="text-xs text-teal-200">Orders Delivered</p>
            <p className="text-xl font-bold">4</p>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-800 mb-4">Active Deliveries</h3>
      
      <div className="space-y-4">
        {deliveries.filter(d => d.status !== 'delivered').map(delivery => (
          <div key={delivery.id} className="bg-white rounded-2xl shadow-sm p-4 border border-slate-100 relative overflow-hidden">
            {delivery.status !== 'available' && (
              <div className="absolute top-0 left-0 w-full h-1 bg-teal-500"></div>
            )}
            
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center text-teal-600">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-800 leading-tight">Order #{delivery.id.split('-')[1]}</p>
                  <p className="text-xs text-teal-600 font-semibold">{delivery.distance} away</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Est. Earning</p>
                <p className="font-bold text-lg text-emerald-600">₹{delivery.earnings}</p>
              </div>
            </div>
            
            <div className="pl-4 border-l-2 border-dashed border-gray-200 ml-5 my-3 relative">
              <div className="absolute w-3 h-3 bg-teal-500 rounded-full -left-[7px] top-0 border-2 border-white"></div>
              <div className="absolute w-3 h-3 bg-orange-500 rounded-full -left-[7px] bottom-0 border-2 border-white"></div>
              
              <div className="mb-4">
                <p className="text-xs text-gray-400 font-semibold uppercase">Pickup From</p>
                <p className="text-sm font-bold text-gray-800">{delivery.shopName}</p>
                <p className="text-xs text-gray-600">{delivery.shopAddress}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase">Deliver To</p>
                <p className="text-sm font-bold text-gray-800">{delivery.customerName}</p>
                <p className="text-xs text-gray-600">{delivery.customerAddress}</p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
              {delivery.status === 'available' && (
                <button onClick={() => acceptDelivery(delivery.id)} className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-xl transition-colors">
                  Accept Delivery
                </button>
              )}
              {delivery.status === 'accepted' && (
                <button onClick={() => markPickedUp(delivery.id)} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors">
                  I've Picked Up Order
                </button>
              )}
              {delivery.status === 'picked_up' && (
                <>
                  <a href={`tel:${delivery.phone}`} className="flex-1 bg-green-50 text-green-600 flex items-center justify-center gap-2 font-bold py-3 rounded-xl">
                    <Phone className="w-4 h-4" /> Call
                  </a>
                  <button onClick={() => markDelivered(delivery.id)} className="flex-[2] bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition-colors">
                    Mark Delivered
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
