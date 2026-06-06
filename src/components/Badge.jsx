import React from 'react';

export default function Badge({ count }) {
  if (!count || count <= 0) return null;

  return (
    <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold px-1 shadow-sm animate-in">
      {count > 99 ? '99+' : count}
    </span>
  );
}
