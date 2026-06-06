import React from 'react';
import { MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { currentRole: role, switchRole: setRole } = useAuth();

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

        {/* Right: Role switcher */}
        <div className="flex items-center bg-white/20 rounded-full p-0.5 backdrop-blur-sm">
          <button
            onClick={() => setRole('customer')}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 ${
              role === 'customer'
                ? 'bg-white text-teal-600 shadow-sm'
                : 'text-white/90 hover:text-white'
            }`}
          >
            Customer
          </button>
          <button
            onClick={() => setRole('admin')}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 ${
              role === 'admin'
                ? 'bg-white text-teal-600 shadow-sm'
                : 'text-white/90 hover:text-white'
            }`}
          >
            Admin
          </button>
        </div>
      </div>
    </header>
  );
}
