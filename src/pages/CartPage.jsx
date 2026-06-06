import React from 'react';
import { ArrowLeft, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';

const CartPage = () => {
  const { cartItems, getCartTotal, getDeliveryFee, getGrandTotal, clearCart, getCartCount } = useCart();
  const navigate = useNavigate();

  const subtotal = getCartTotal();
  const deliveryFee = getDeliveryFee();
  const grandTotal = getGrandTotal();
  const count = getCartCount();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-white sticky top-0 z-10 px-4 py-4 flex items-center border-b border-gray-100">
          <button onClick={() => navigate(-1)} className="mr-3 p-1 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-lg font-bold text-gray-800">My Cart</h1>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="text-7xl mb-4 opacity-80">🛒</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Start adding items to your cart to see them here.</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-teal-600 text-white font-bold py-3 px-8 rounded-full shadow-md hover:bg-teal-700 transition-colors"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white sticky top-0 z-10 px-4 py-4 flex items-center justify-between border-b border-gray-100 shadow-sm">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-3 p-1 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-lg font-bold text-gray-800">My Cart ({count})</h1>
        </div>
        <button 
          onClick={clearCart}
          className="flex items-center text-red-500 text-sm font-medium px-2 py-1 rounded-md hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Clear All
        </button>
      </div>

      <div className="p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          {cartItems.map((item, index) => (
            <div key={item.id}>
              <CartItem item={item} />
              {index < cartItems.length - 1 && <div className="h-px bg-gray-100 mx-4"></div>}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">Bill Details</h3>
          
          <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
            <span>Item Total</span>
            <span className="font-medium text-gray-800">₹{subtotal}</span>
          </div>
          
          <div className="flex justify-between items-center mb-4 text-sm text-gray-600">
            <span>Delivery Fee</span>
            {deliveryFee === 0 ? (
              <span className="font-bold text-green-500">✅ FREE</span>
            ) : (
              <span className="font-medium text-gray-800">₹{deliveryFee}</span>
            )}
          </div>
          
          <div className="h-px bg-gray-200 mb-4 border-dashed border-t"></div>
          
          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-800 text-lg">Grand Total</span>
            <span className="font-bold text-teal-600 text-xl">₹{grandTotal}</span>
          </div>
          
          {subtotal < 300 && (
            <div className="mt-4 bg-teal-50 text-teal-700 text-xs p-2 rounded-lg flex items-center justify-center">
              <span>Add ₹{300 - subtotal} more to get <strong className="font-bold">FREE Delivery!</strong></span>
            </div>
          )}
        </div>

        <button 
          onClick={() => navigate('/checkout')}
          className="w-full bg-teal-600 text-white font-bold text-lg py-4 rounded-2xl shadow-md hover:bg-teal-700 transition-colors flex items-center justify-center"
        >
          Proceed to Checkout — ₹{grandTotal}
          <ArrowRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    </div>
  );
};

export default CartPage;
