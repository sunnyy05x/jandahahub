import React from 'react';

export default function CategoryCard({ icon, title, subtitle, gradient, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`${gradient} min-h-[120px] w-full rounded-2xl p-4 flex flex-col justify-center items-center text-center text-white shadow hover:shadow-lg active:scale-95 transition-all duration-200 cursor-pointer`}
    >
      <span className="text-4xl mb-2 drop-shadow-sm">{icon}</span>
      <h3 className="text-base font-bold leading-tight">{title}</h3>
      {subtitle && (
        <p className="text-xs mt-1 opacity-90 leading-snug">{subtitle}</p>
      )}
    </button>
  );
}
