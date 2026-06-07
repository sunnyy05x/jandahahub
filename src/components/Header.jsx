import React from 'react';
import { MapPin, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { isAuthenticated, user, currentRole, logout } = useAuth();

  const roleLabels = {
    customer: 'Customer',
    restaurant: 'Restaurant',
    grocery: 'Grocery',
    essentials: 'Essentials',
    driver: 'Driver',
    delivery: 'Delivery',
    admin: 'Admin'
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-md">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: App name + location */}
        <div className="flex flex-col">
          <h1 className="text-xl font-bold tracking-tight leading-none">
            JandahaHub
          </h1>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 opacity-80" />
            <span className="text-[11px] opacity-80 font-medium">
              Jandaha, Vaishali
            </span>
          </div>
        </div>

        {/* Right: User info + Logout */}
        {isAuthenticated && user ? (
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-xs font-semibold truncate max-w-[120px]">
                {user.name || user?.user_metadata?.full_name || 'User'}
              </span>
              <span className="text-[10px] opacity-80 uppercase tracking-wide">
                {roleLabels[currentRole] || currentRole}
              </span>
            </div>
            <button
              onClick={logout}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
