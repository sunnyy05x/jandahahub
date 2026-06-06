import React, { useState } from 'react';
import { Package, ChevronDown, ChevronUp, MapPin, Phone, User, CheckCircle } from 'lucide-react';

const OrderCard = ({ order }) => {
  const [expanded, setExpanded] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'out_for_delivery': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'confirmed': return 'Confirmed';
      case 'out_for_delivery': return 'Out for Delivery';
      case 'delivered': return 'Delivered';
      default: return 'Unknown';
    }
  };

  const statusList = ['pending', 'confirmed', 'out_for_delivery', 'delivered'];
  const currentIndex = statusList.indexOf(order.status);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 mb-3 border border-gray-100">
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="text-xs text-gray-500 font-medium">#{order.id}</span>
          <h3 className="font-semibold text-gray-800 mt-1">{order.shopName}</h3>
          <p className="text-xs text-gray-500">{new Date(order.placedAt).toLocaleString()}</p>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
          {getStatusText(order.status)}
        </div>
      </div>

      <div className="flex justify-between items-center py-2 border-t border-b border-gray-50 mb-3">
        <div>
          <p className="text-sm text-gray-600">Total Amount</p>
          <p className="font-bold text-teal-600">₹{order.total}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Payment</p>
          <p className="text-sm font-medium">COD</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="relative flex justify-between items-center mb-4 px-2">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full z-0"></div>
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-teal-500 rounded-full z-0 transition-all duration-500"
          style={{ width: `${(currentIndex / (statusList.length - 1)) * 100}%` }}
        ></div>
        
        {statusList.map((s, i) => (
          <div key={s} className="relative z-10 flex flex-col items-center">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors duration-300 ${i <= currentIndex ? 'bg-teal-500 text-white' : 'bg-gray-300'}`}>
              {i <= currentIndex && <CheckCircle className="w-3 h-3" />}
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-center w-full text-sm text-teal-600 font-medium py-1"
      >
        {expanded ? (
          <><ChevronUp className="w-4 h-4 mr-1" /> Hide Details</>
        ) : (
          <><ChevronDown className="w-4 h-4 mr-1" /> View Details</>
        )}
      </button>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-100 animate-fade-in">
          <h4 className="text-sm font-semibold mb-2">Items</h4>
          <ul className="mb-4">
            {order.items.map((item, idx) => (
              <li key={idx} className="flex justify-between text-sm py-1 text-gray-700">
                <span>{item.qty} × {item.name}</span>
                <span>₹{item.price * item.qty}</span>
              </li>
            ))}
          </ul>
          
          <div className="bg-gray-50 p-3 rounded-xl text-sm">
            <div className="flex items-start mb-2">
              <User className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
              <span>{order.customerName}</span>
            </div>
            <div className="flex items-start mb-2">
              <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
              <span>{order.customerAddress}</span>
            </div>
            <div className="flex items-start">
              <Phone className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
              <span>{order.customerPhone}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderCard;
