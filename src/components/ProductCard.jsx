import React from 'react';
import { Plus, Minus, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();

  const cartItem = cartItems.find((item) => item.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleAdd = () => {
    addToCart(product);
  };

  const handleIncrement = () => {
    updateQuantity(product.id, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity <= 1) {
      removeFromCart(product.id);
    } else {
      updateQuantity(product.id, quantity - 1);
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-3 flex items-center gap-4 transition-all duration-200 hover:shadow-md ${
        !(product.in_stock ?? product.inStock ?? true) ? 'opacity-60' : ''
      }`}
    >
      {/* Left: Emoji on circle */}
      <div className="w-24 shrink-0 bg-slate-50 flex items-center justify-center overflow-hidden border-r border-slate-100">
        {product.image?.startsWith('http') ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-5xl leading-none">{product.image || '📦'}</span>
        )}
      </div>

      {/* Right: Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-800 text-sm leading-tight truncate">
              {product.name}
            </h3>
            {(product.shop_name || product.shopName) && (
              <p className="text-xs text-gray-500 mt-0.5 truncate">
                {product.shop_name || product.shopName}
              </p>
            )}
          </div>
          {product.rating && (
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium text-gray-600">
                {product.rating}
              </span>
            </div>
          )}
        </div>

        {product.description && (
          <p className="text-xs text-gray-400 mt-1 line-clamp-1">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-teal-600">
              ₹{product.price}
            </span>
            {(product.prep_time || product.prepTime || product.unit) && (
              <span className="text-[10px] text-gray-400">
                {product.prep_time || product.prepTime || product.unit}
              </span>
            )}
          </div>

          {/* Add to Cart / Quantity Stepper */}
          {!(product.in_stock ?? product.inStock ?? true) ? (
            <span className="text-xs text-gray-400 font-medium">
              Out of stock
            </span>
          ) : quantity === 0 ? (
            <button
              onClick={handleAdd}
              className="flex items-center gap-1 bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-200 active:scale-95 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-teal-50 rounded-full px-1 py-0.5">
              <button
                onClick={handleDecrement}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-teal-600 border border-teal-200 transition-all duration-150 active:scale-90 hover:bg-teal-100"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-sm font-bold text-teal-700 w-5 text-center">
                {quantity}
              </span>
              <button
                onClick={handleIncrement}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-teal-500 text-white transition-all duration-150 active:scale-90 hover:bg-teal-600"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
