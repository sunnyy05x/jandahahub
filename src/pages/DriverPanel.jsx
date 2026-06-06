import React, { useState } from 'react';
import { MapPin, Navigation, User, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DriverPanel() {
  const { user } = useAuth();
  
  const [rides, setRides] = useState([
    { id: 'RIDE-501', passenger: 'Ramesh Singh', phone: '9876543211', from: 'Jandaha Bus Stand', to: 'Hajipur Station', status: 'available', price: 80, time: '5 mins ago' },
    { id: 'RIDE-502', passenger: 'Sita Devi', phone: '9876543212', from: 'Ward 5', to: 'Mahua', status: 'accepted', price: 40, time: '10 mins ago' },
  ]);

  const acceptRide = (id) => {
    setRides(rides.map(r => r.id === id ? { ...r, status: 'accepted' } : r));
  };

  const completeRide = (id) => {
    setRides(rides.map(r => r.id === id ? { ...r, status: 'completed' } : r));
  };

  return (
    <div className="p-4 bg-slate-50 min-h-screen pb-20">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-md p-5 mb-6 text-white">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold">Driver Dashboard</h2>
            <p className="text-blue-100 text-sm">Welcome, {user?.name}</p>
          </div>
          <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
            Online 🟢
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4 bg-white/10 p-3 rounded-xl">
          <div>
            <p className="text-xs text-blue-200">Today's Earnings</p>
            <p className="text-xl font-bold">₹ 420</p>
          </div>
          <div>
            <p className="text-xs text-blue-200">Rides Completed</p>
            <p className="text-xl font-bold">6</p>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-800 mb-4">Available Ride Requests</h3>
      
      <div className="space-y-4">
        {rides.filter(r => r.status !== 'completed').map(ride => (
          <div key={ride.id} className="bg-white rounded-2xl shadow-sm p-4 border border-slate-100 relative overflow-hidden">
            {ride.status === 'accepted' && (
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
            )}
            
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-800 leading-tight">{ride.passenger}</p>
                  <p className="text-xs text-gray-500">{ride.time}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-teal-600">₹{ride.price}</p>
              </div>
            </div>
            
            <div className="pl-4 border-l-2 border-dashed border-gray-200 ml-5 my-3 relative">
              <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-0 border-2 border-white"></div>
              <div className="absolute w-3 h-3 bg-red-500 rounded-full -left-[7px] bottom-0 border-2 border-white"></div>
              
              <div className="mb-3">
                <p className="text-xs text-gray-400 font-semibold uppercase">Pickup</p>
                <p className="text-sm font-medium text-gray-700">{ride.from}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase">Dropoff</p>
                <p className="text-sm font-medium text-gray-700">{ride.to}</p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
              {ride.status === 'available' ? (
                <button onClick={() => acceptRide(ride.id)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors">
                  Accept Ride
                </button>
              ) : (
                <>
                  <a href={`tel:${ride.phone}`} className="flex-1 bg-green-50 text-green-600 flex items-center justify-center gap-2 font-bold py-3 rounded-xl">
                    <Phone className="w-4 h-4" /> Call
                  </a>
                  <button onClick={() => completeRide(ride.id)} className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors">
                    Complete Ride
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
