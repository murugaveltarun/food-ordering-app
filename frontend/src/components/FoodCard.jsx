// Import React and useState
import React, { useState } from 'react';
// Import useCart hook to trigger add to cart
import { useCart } from '../context/CartContext';
// Import useAuth to prompt login if guest clicks add to cart
import { useAuth } from '../context/AuthContext';
// Import useNavigate to redirect guests to login
import { useNavigate } from 'react-router-dom';
// Import lucide icons
import { Plus, ShoppingCart, Tag, Check, AlertCircle } from 'lucide-react';

// FoodCard component to render an appetizing menu item card
export const FoodCard = ({ food }) => {
  // Extract addToCart method from CartContext
  const { addToCart } = useCart();
  // Extract user authentication state
  const { user } = useAuth();
  // Navigation hook
  const navigate = useNavigate();
  // State to manage button loading spinner
  const [adding, setAdding] = useState(false);
  // State to show temporary green checkmark after adding
  const [added, setAdded] = useState(false);

  // Handle adding this food item to the shopping cart
  const handleAdd = async () => {
    // Redirect unauthenticated guests to login
    if (!user) {
      navigate('/login');
      return;
    }

    // Do nothing if out of stock
    if (food.stock <= 0) return;

    setAdding(true);
    // Call addToCart from context
    const res = await addToCart(food.id, 1);
    setAdding(false);

    if (res.success) {
      setAdded(true);
      // Revert checkmark after 1.5 seconds
      setTimeout(() => setAdded(false), 1500);
    }
  };

  // Determine stock availability badge
  const isOutOfStock = food.stock <= 0;
  const isLowStock = food.stock > 0 && food.stock <= 8;

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group">
      {/* Food Photo Container */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img
          src={food.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'}
          alt={food.name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600';
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Discount Badge */}
        {food.discount_percent > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center space-x-1">
            <Tag className="w-3 h-3" />
            <span>{food.discount_percent}% OFF</span>
          </div>
        )}

        {/* Category Pill */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
          {food.category}
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-red-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-lg">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Card Details Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Food Title */}
          <h3 className="font-bold text-base text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1">
            {food.name}
          </h3>

          {/* Short Description */}
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {food.description || 'Prepared fresh with high quality ingredients.'}
          </p>
        </div>

        {/* Pricing and Action Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            {/* Price section with discount calculation */}
            <div className="flex items-baseline space-x-2">
              <span className="text-lg font-black text-slate-900">
                ${food.final_price?.toFixed(2)}
              </span>
              {food.discount_percent > 0 && (
                <span className="text-xs text-slate-400 line-through">
                  ${food.price?.toFixed(2)}
                </span>
              )}
            </div>

            {/* Inventory Stock Indicator */}
            {isLowStock ? (
              <span className="text-[11px] text-amber-600 font-medium flex items-center mt-0.5">
                <AlertCircle className="w-3 h-3 mr-0.5 inline" /> Only {food.stock} left!
              </span>
            ) : (
              <span className="text-[11px] text-emerald-600 font-medium mt-0.5 block">
                In Stock ({food.stock})
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAdd}
            disabled={isOutOfStock || adding}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : added
                ? 'bg-emerald-500 text-white'
                : 'bg-orange-500 hover:bg-orange-600 text-white hover:shadow-orange-500/25 active:scale-95'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
