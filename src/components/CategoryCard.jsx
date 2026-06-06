import React from 'react';

export default function CategoryCard({ emoji, title, subtitle, gradient, disabled }) {
  return (
    <div
      className={`bg-gradient-to-br ${gradient} min-h-[120px] w-full rounded-2xl p-4 flex flex-col justify-center items-center text-center text-white shadow-sm hover:shadow-md active:scale-95 transition-all duration-200 cursor-pointer ${disabled ? 'cursor-not-allowed' : ''}`}
    >
      <span className="text-4xl mb-2 drop-shadow-sm">{emoji}</span>
      <h3 className="text-base font-bold leading-tight">{title}</h3>
      {subtitle && (
        <p className="text-xs mt-1 opacity-90 leading-snug">{subtitle}</p>
      )}
    </div>
  );
}
