import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import CategoryCard from '../components/CategoryCard';
import SearchBar from '../components/SearchBar';
import InstallBanner from '../components/InstallBanner';

const categories = [
  {
    emoji: '🍛',
    title: 'Food Delivery',
    subtitle: 'Dhabas & Fast Food',
    gradient: 'from-orange-400 to-red-500',
    path: '/category/food',
  },
  {
    emoji: '🛒',
    title: 'Kirana Store',
    subtitle: 'Groceries & Ration',
    gradient: 'from-teal-400 to-emerald-600',
    path: '/category/kirana',
  },
  {
    emoji: '🥬',
    title: 'Fresh Mandi',
    subtitle: 'Milk, Eggs, Veggies',
    gradient: 'from-green-400 to-lime-500',
    path: '/category/mandi',
  },
];

const promos = [
  {
    text: '🎉 Free Delivery on orders above ₹300!',
    gradient: 'from-orange-400 to-pink-500',
  },
  {
    text: '📦 Monthly Ration Kit — ₹1999 only',
    gradient: 'from-teal-400 to-emerald-500',
  },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function HomePage() {
  const navigate = useNavigate();
  const greeting = useMemo(() => getGreeting(), []);

  const handleCategoryClick = (category) => {
    if (category.disabled || !category.path) return;
    navigate(category.path);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 pb-24">
      {/* Greeting Section */}
      <div className="pt-6 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Namaste! 🙏
        </h1>
        <p className="text-gray-500 mt-1">
          {greeting} — What do you need today?
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <SearchBar placeholder="Search for food, groceries, rides..." />
      </div>

      {/* Install Banner */}
      <div className="mb-4">
        <InstallBanner />
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {categories.map((cat) => (
          <div
            key={cat.title}
            className={cat.disabled ? 'opacity-60' : 'cursor-pointer'}
            onClick={() => handleCategoryClick(cat)}
          >
            <CategoryCard
              emoji={cat.emoji}
              title={cat.title}
              subtitle={cat.subtitle}
              gradient={cat.gradient}
              disabled={cat.disabled}
            />
          </div>
        ))}
      </div>

      {/* Promotional Banners */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Offers & Updates
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          {promos.map((promo, index) => (
            <div
              key={index}
              className={`min-w-[280px] rounded-2xl bg-gradient-to-r ${promo.gradient} p-4 text-white shadow-md flex-shrink-0`}
            >
              <p className="text-sm font-semibold leading-relaxed">
                {promo.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
