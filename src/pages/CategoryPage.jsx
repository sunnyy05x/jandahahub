import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { supabase } from '../config/supabase';

const categoryConfig = {
  food: {
    title: '🍛 Food Delivery',
    subcategories: [
      { label: 'All', key: 'all' },
      { label: 'Local Dhabas', key: 'dhaba' },
      { label: 'Bakery & Fast Food', key: 'bakery' },
    ],
  },
  kirana: {
    title: '🛒 Kirana Store',
    subcategories: null,
  },
  mandi: {
    title: '🥬 Fresh Mandi',
    subcategories: null,
  },
};

export default function CategoryPage() {
  const { categoryId: category } = useParams();
  const navigate = useNavigate();
  const { cartItems } = useCart();
  
  const config = categoryConfig[category];
  const [activeTab, setActiveTab] = useState(
    config?.subcategories ? config.subcategories[0].key : null
  );

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      if (!config) return;
      setLoading(true);
      try {
        let query = supabase.from('products').select('*').eq('category', category).order('created_at', { ascending: false });
        
        if (config.subcategories && activeTab && activeTab !== 'all') {
          // use ilike for case-insensitive matching
          query = query.ilike('subcategory', activeTab);
        }

        const { data, error } = await query;
        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        console.error("Error fetching products:", err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [category, activeTab, config]);

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">🔍</p>
          <h2 className="text-xl font-bold text-gray-800">Category Not Found</h2>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2 bg-teal-500 text-white rounded-full font-semibold"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white shadow-sm px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">{config.title}</h1>
      </div>

      {/* Subcategory Tabs (food only) */}
      {config.subcategories && (
        <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
          {config.subcategories.map((sub) => (
            <button
              key={sub.key}
              onClick={() => setActiveTab(sub.key)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                activeTab === sub.key
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {sub.label}
            </button>
          ))}
        </div>
      )}

      {/* Product List */}
      <div className="px-4 py-2 space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
          </div>
        ) : products.length > 0 ? (
          products.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-gray-500">No items available right now.</p>
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-20 left-0 right-0 mx-4 z-20">
          <button
            onClick={() => navigate('/cart')}
            className="w-full flex items-center justify-between bg-teal-500 text-white rounded-full py-3.5 px-6 shadow-lg active:scale-[0.98] transition-transform"
          >
            <span className="font-semibold">
              View Cart ({cartItemCount} {cartItemCount === 1 ? 'item' : 'items'})
            </span>
            <span className="flex items-center gap-1 font-bold">
              ₹{cartTotal}
              <ArrowRight className="w-5 h-5" />
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
