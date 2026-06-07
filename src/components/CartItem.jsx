import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart();

  const handleIncrement = () => {
    updateQuantity(item.id, item.quantity + 1);
  };

  const handleDecrement = () => {
    if (item.quantity <= 1) {
      removeFromCart(item.id);
    } else {
      updateQuantity(item.id, item.quantity - 1);
    }
  };

  const lineTotal = item.price * item.quantity;

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100">
        {item.image?.startsWith('http') ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl">{item.image || '📦'}</span>
        )}
      </div>

      {/* Name + Price */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-gray-800 truncate">
          {item.name}
        </h4>
        <p className="text-xs text-gray-500 mt-0.5">
          ₹{item.price} × {item.quantity} ={' '}
          <span className="font-semibold text-teal-600">₹{lineTotal}</span>
        </p>
      </div>

      {/* Quantity stepper */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleDecrement}
          className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 transition-all duration-150 active:scale-90"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className="text-sm font-bold text-gray-700 w-5 text-center">
          {item.quantity}
        </span>
        <button
          onClick={handleIncrement}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-teal-500 text-white hover:bg-teal-600 transition-all duration-150 active:scale-90"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Remove button */}
      <button
        onClick={() => removeFromCart(item.id)}
        className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-red-400 hover:bg-red-50 hover:text-red-500 transition-all duration-150"
        aria-label={`Remove ${item.name}`}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
