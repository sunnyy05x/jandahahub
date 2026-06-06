import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, ClipboardList, ShoppingCart, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import Badge from './Badge';

const tabs = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/orders', label: 'My Orders', icon: ClipboardList },
  { path: '/cart', label: 'Cart', icon: ShoppingCart },
  { path: '/profile', label: 'Profile', icon: User },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems } = useCart();

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-white border-t border-gray-200 shadow-lg pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center max-w-lg mx-auto">
        {tabs.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;

          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center py-2 px-3 flex-1 transition-all duration-200 ${
                isActive
                  ? 'text-teal-600'
                  : 'text-gray-400 hover:text-gray-500'
              }`}
            >
              <span className="relative">
                <Icon
                  className={`w-6 h-6 transition-all duration-200 ${
                    isActive ? 'fill-teal-600/20 stroke-teal-600' : ''
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {label === 'Cart' && <Badge count={cartCount} />}
              </span>
              <span
                className={`text-xs font-medium mt-1 transition-all duration-200 ${
                  isActive ? 'text-teal-600' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
