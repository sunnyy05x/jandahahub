import React from 'react';
import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="relative w-full">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-full shadow-sm text-sm text-gray-700 placeholder-gray-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
      />
    </div>
  );
}
