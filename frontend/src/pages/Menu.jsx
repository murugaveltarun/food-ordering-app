// Import React hooks
import React, { useState, useEffect } from 'react';
// Import useSearchParams to read URL filter params
import { useSearchParams } from 'react-router-dom';
// Import api client
import api from '../api';
// Import FoodCard component
import { FoodCard } from '../components/FoodCard';
// Import lucide icons
import { Search, SlidersHorizontal, Tag, RefreshCw } from 'lucide-react';

// Menu Page component allowing customers to browse dishes by category and search
export const Menu = () => {
  // Query parameters from URL
  const [searchParams, setSearchParams] = useSearchParams();
  // State for all food items from backend
  const [foods, setFoods] = useState([]);
  // State for distinct categories
  const [categories, setCategories] = useState(['All']);
  // State for selected category
  const [selectedCategory, setSelectedCategory] = useState('All');
  // State for text search input
  const [searchTerm, setSearchTerm] = useState('');
  // State to filter discounted dishes only
  const [onlyDiscounts, setOnlyDiscounts] = useState(searchParams.get('filter') === 'discount');
  // State for loading state
  const [loading, setLoading] = useState(true);

  // Function to load all food items from backend API
  const fetchFoods = async () => {
    try {
      setLoading(true);
      const res = await api.get('/food');
      if (res.data.success) {
        setFoods(res.data.items);
      }
    } catch (err) {
      console.error('Failed to load menu items:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to load distinct categories from backend API
  const fetchCategories = async () => {
    try {
      const res = await api.get('/food/categories');
      if (res.data.success) {
        setCategories(['All', ...res.data.categories]);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  // Hook to fetch initial data on component mount
  useEffect(() => {
    fetchFoods();
    fetchCategories();
  }, []);

  // Filter foods by selected category, search keyword, and discount toggle
  const filteredFoods = foods.filter((item) => {
    // Check category match
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    // Check search term match
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    // Check discount filter
    const matchesDiscount = !onlyDiscounts || (item.discount_percent && item.discount_percent > 0);

    return matchesCategory && matchesSearch && matchesDiscount;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Our Delicious Menu</h1>
            <p className="text-sm text-slate-500 mt-1">Handcrafted with passion. Pick your favorite dishes below.</p>
          </div>

          {/* Search bar and discount toggle */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search food by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm"
              />
            </div>

            {/* Discount Filter Button */}
            <button
              onClick={() => setOnlyDiscounts(!onlyDiscounts)}
              className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all border shadow-sm ${
                onlyDiscounts
                  ? 'bg-red-500 text-white border-red-500'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-orange-400'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Offers Only</span>
            </button>
          </div>
        </div>

        {/* Category Pills Navigation */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
                selectedCategory === cat
                  ? 'bg-orange-500 text-white shadow-orange-500/25 shadow-md'
                  : 'bg-white text-slate-600 hover:text-orange-500 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Food Items Grid or Empty State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : filteredFoods.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">No Food Items Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              We couldn't find any dish matching your filter. Try clearing your search query.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
                setOnlyDiscounts(false);
              }}
              className="mt-6 px-4 py-2 rounded-xl text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 transition-colors inline-flex items-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredFoods.map((food) => (
              <FoodCard key={food.id} food={food} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
