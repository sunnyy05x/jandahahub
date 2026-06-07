import React from 'react';

export default function CategoryCard({ emoji, title, subtitle, gradient, disabled, image }) {
  if (image) {
    return (
      <div
        className={`relative min-h-[140px] w-full rounded-2xl overflow-hidden shadow-sm hover:shadow-md active:scale-95 transition-all duration-200 ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
      >
        <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-4 flex flex-col justify-end text-white">
          <h3 className="text-lg font-bold leading-tight drop-shadow-md">{title}</h3>
          {subtitle && (
            <p className="text-xs mt-1 opacity-90 leading-snug drop-shadow-md">{subtitle}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-gradient-to-br ${gradient} min-h-[120px] w-full rounded-2xl p-4 flex flex-col justify-center items-center text-center text-white shadow-sm hover:shadow-md active:scale-95 transition-all duration-200 cursor-pointer ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
    >
      <span className="text-4xl mb-2 drop-shadow-sm">{emoji}</span>
      <h3 className="text-base font-bold leading-tight">{title}</h3>
      {subtitle && (
        <p className="text-xs mt-1 opacity-90 leading-snug">{subtitle}</p>
      )}
    </div>
  );
}
