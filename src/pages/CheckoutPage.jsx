import React, { useState } from 'react';
import { ArrowLeft, MapPin, Phone, User, CheckCircle, Banknote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';

const CheckoutPage = () => {
  const { cartItems, getCartTotal, getDeliveryFee, getGrandTotal, clearCart } = useCart();
  const { placeOrder } = useOrders();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    landmark: ''
  });

  const [isSuccess, setIsSuccess] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState(null);

  // If cart is empty and not on success screen, go back
  if (cartItems.length === 0 && !isSuccess) {
    navigate('/');
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = () => {
    // Basic validation
    if (!formData.name || !formData.phone || !formData.address) {
      alert("Please fill in all mandatory fields.");
      return;
    }

    // Since we support multiple shops, we might want to place one combined order 
    // or take the shopName from the first item. For simplicity, taking the first item's shopName
    // or a generic "Multiple Shops" if items are from different shops.
    const shopNames = [...new Set(cartItems.map(item => item.shopName))];
    const combinedShopName = shopNames.length > 1 ? "Multiple Shops" : shopNames[0] || "JandahaHub Store";

    const orderData = {
      items: [...cartItems],
      address: `${formData.address}${formData.landmark ? `, Near ${formData.landmark}` : ''}`,
      phone: formData.phone,
      name: formData.name,
      shopName: combinedShopName
    };

    const newOrder = placeOrder(orderData);
    setPlacedOrderId(newOrder.id);
    clearCart();
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-scale-in">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Placed!</h1>
        <p className="text-gray-600 mb-2">Your order <span className="font-bold text-gray-800">#{placedOrderId}</span> has been confirmed.</p>
        <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-xl mb-8 flex items-center mt-4">
          <Banknote className="w-5 h-5 mr-2 shrink-0" />
          <p className="text-sm font-medium">Please pay <span className="font-bold text-lg">₹{getGrandTotal()}</span> cash on delivery.</p>
        </div>
        
        <button 
          onClick={() => navigate('/orders')}
          className="w-full bg-teal-600 text-white font-bold py-4 rounded-xl shadow-md hover:bg-teal-700 transition-colors mb-4"
        >
          View My Orders
        </button>
        <button 
          onClick={() => navigate('/')}
          className="w-full bg-white text-teal-600 border border-teal-600 font-bold py-4 rounded-xl hover:bg-teal-50 transition-colors"
        >
          Back to Home
        </button>
        
        {/* Simple CSS Confetti */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i}
              className="absolute w-2 h-2 rounded-full animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-10px`,
                backgroundColor: ['#0D9488', '#F97316', '#FACC15', '#3B82F6', '#EF4444'][Math.floor(Math.random() * 5)],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white sticky top-0 z-10 px-4 py-4 flex items-center border-b border-gray-100 shadow-sm">
        <button onClick={() => navigate(-1)} className="mr-3 p-1 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="text-lg font-bold text-gray-800">Checkout</h1>
      </div>

      <div className="p-4">
        {/* Delivery Address Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-teal-600" />
            Delivery Details
          </h2>
          
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-gray-50 text-sm transition-colors"
                placeholder="Full Name *"
                required
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-gray-50 text-sm transition-colors"
                placeholder="Phone Number *"
                required
              />
            </div>
            
            <div className="relative">
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="2"
                className="block w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-gray-50 text-sm transition-colors"
                placeholder="Complete Address (Ward, Village, etc.) *"
                required
              />
            </div>
            
            <div className="relative">
              <input
                type="text"
                name="landmark"
                value={formData.landmark}
                onChange={handleChange}
                className="block w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-gray-50 text-sm transition-colors"
                placeholder="Landmark (Optional)"
              />
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <h2 className="font-bold text-gray-800 mb-3 text-sm">Order Summary ({cartItems.length} items)</h2>
          <div className="space-y-2 mb-3">
            {cartItems.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-600 truncate mr-2">{item.qty} × {item.name}</span>
                <span className="font-medium text-gray-800">₹{item.price * item.qty}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-green-50 rounded-2xl shadow-sm border-2 border-green-500 p-4 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-green-500 text-white rounded-bl-xl px-3 py-1 text-xs font-bold flex items-center">
            <CheckCircle className="w-3 h-3 mr-1" /> Selected
          </div>
          <h2 className="font-bold text-green-800 mb-1 flex items-center text-lg">
            <Banknote className="w-6 h-6 mr-2 text-green-600" />
            Cash on Delivery
          </h2>
          <p className="text-green-700 text-sm font-medium">Pay ₹{getGrandTotal()} cash when your order arrives.</p>
        </div>

        <button 
          onClick={handlePlaceOrder}
          className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold text-lg py-4 rounded-2xl shadow-lg hover:from-teal-600 hover:to-emerald-700 transition-all active:scale-[0.98] flex items-center justify-center"
        >
          Place Order — ₹{getGrandTotal()}
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;
