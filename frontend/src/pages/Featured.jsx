// Import React hooks
import React, { useState, useEffect } from 'react';
// Import Link for navigation and useNavigate
import { Link, useNavigate } from 'react-router-dom';
// Import api client
import api from '../api';
// Import FoodCard component
import { FoodCard } from '../components/FoodCard';
// Import cart and auth context hooks
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
// Import lucide icons
import {
  Flame,
  Sparkles,
  ArrowRight,
  Bike,
  ChefHat,
  ShieldCheck,
  Percent,
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
  AlertCircle,
  Tag
} from 'lucide-react';

// Featured Page component displaying hot specials, hero carousel, and highlights
export const Featured = () => {
  // State to store featured food items
  const [featuredItems, setFeaturedItems] = useState([]);
  // State for loading state
  const [loading, setLoading] = useState(true);
  // Carousel active index state
  const [activeSlide, setActiveSlide] = useState(0);
  // Add to cart loading / success state for hero carousel
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Cart & Auth context
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Hook to fetch featured food items from API
  useEffect(() => {
    // Function to call /food/featured endpoint
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/food/featured');
        if (res.data.success) {
          setFeaturedItems(res.data.items);
        }
      } catch (err) {
        console.error('Failed to load featured items:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  // Automatic slide rotation every 4.5 seconds
  useEffect(() => {
    if (featuredItems.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % featuredItems.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [featuredItems.length]);

  // Navigate to previous slide
  const prevSlide = () => {
    if (featuredItems.length === 0) return;
    setActiveSlide((prev) => (prev - 1 + featuredItems.length) % featuredItems.length);
  };

  // Navigate to next slide
  const nextSlide = () => {
    if (featuredItems.length === 0) return;
    setActiveSlide((prev) => (prev + 1) % featuredItems.length);
  };

  // Handle add to cart directly from carousel
  const handleCarouselAddToCart = async (item) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (item.stock <= 0) return;

    setAddingToCart(true);
    const res = await addToCart(item.id, 1);
    setAddingToCart(false);

    if (res.success) {
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 1600);
    }
  };

  const currentItem = featuredItems[activeSlide] || null;

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      
      {/* Hero Section Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-zinc-900 to-orange-950 text-white py-14 sm:py-20">
        {/* Glow backdrop decoration */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-orange-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Hero Text Column */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-orange-500/20 border border-orange-500/30 px-3.5 py-1.5 rounded-full text-orange-300 text-xs font-semibold tracking-wide uppercase backdrop-blur">
                <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
                <span>Special Discounts Available Today</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                Crave It? <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">
                  We Deliver It Fresh.
                </span>
              </h1>

              <p className="text-slate-300 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Explore hand-crafted burgers, artisan woodfired pizzas, and gourmet treats. Order directly with instant email notification without any checkout hassle.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
                <Link
                  to="/menu"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-500/30 flex items-center justify-center space-x-2 hover:scale-[1.02] transition-all"
                >
                  <span>Explore Full Menu</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/menu?filter=discount"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur border border-white/10 transition-colors flex items-center justify-center space-x-2"
                >
                  <Percent className="w-4 h-4 text-orange-400" />
                  <span>View Discounts</span>
                </Link>
              </div>
            </div>

            {/* Right Hero Carousel Card */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="relative w-full max-w-lg">
                {/* Carousel Card Container */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/15 bg-zinc-900/90 backdrop-blur group">
                  
                  {loading || !currentItem ? (
                    <div className="h-96 flex items-center justify-center bg-zinc-900">
                      <div className="animate-pulse text-sm text-slate-400">Loading specials...</div>
                    </div>
                  ) : (
                    <>
                      {/* Dish Image */}
                      <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-zinc-950">
                        <img
                          key={currentItem.id}
                          src={currentItem.image_url || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800'}
                          alt={currentItem.name}
                          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                        />

                        {/* Top Badges Overlay */}
                        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                          {/* Urgency / Stock badge */}
                          {currentItem.stock <= 0 ? (
                            <span className="bg-red-600 text-white text-xs font-black uppercase px-3 py-1.5 rounded-full shadow-lg tracking-wider flex items-center space-x-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Out of Stock</span>
                            </span>
                          ) : currentItem.stock <= 10 ? (
                            <span className="bg-amber-500 text-slate-950 text-xs font-black uppercase px-3 py-1.5 rounded-full shadow-lg tracking-wider flex items-center space-x-1 animate-pulse">
                              <Flame className="w-3.5 h-3.5" />
                              <span>Selling Fast! Only {currentItem.stock} Left</span>
                            </span>
                          ) : (
                            <span className="bg-orange-500/90 backdrop-blur text-white text-xs font-bold uppercase px-3 py-1.5 rounded-full shadow-md tracking-wider flex items-center space-x-1">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Chef's Daily Special</span>
                            </span>
                          )}

                          {/* Discount pill */}
                          {currentItem.discount_percent > 0 && (
                            <span className="bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-md flex items-center space-x-1">
                              <Tag className="w-3 h-3" />
                              <span>{currentItem.discount_percent}% OFF</span>
                            </span>
                          )}
                        </div>

                        {/* Out of Stock Dark Overlay */}
                        {currentItem.stock <= 0 && (
                          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-4">
                            <span className="bg-red-600 text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-2xl">
                              Temporarily Sold Out
                            </span>
                            <p className="text-xs text-slate-300 mt-2 max-w-xs">
                              This popular dish is currently out of stock. Check back soon or explore other specials!
                            </p>
                          </div>
                        )}

                        {/* Slide Navigation Buttons */}
                        {featuredItems.length > 1 && (
                          <>
                            <button
                              onClick={prevSlide}
                              aria-label="Previous Featured Item"
                              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur flex items-center justify-center transition-all opacity-80 group-hover:opacity-100"
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                              onClick={nextSlide}
                              aria-label="Next Featured Item"
                              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur flex items-center justify-center transition-all opacity-80 group-hover:opacity-100"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>

                      {/* Card Content & Order Action */}
                      <div className="p-5 bg-gradient-to-b from-zinc-900 to-zinc-950">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 text-xs font-medium text-orange-400">
                              <span>{currentItem.category}</span>
                              <span>&bull;</span>
                              <span className="text-slate-400">
                                {currentItem.stock > 0 ? `Stock: ${currentItem.stock} available` : 'Out of Stock'}
                              </span>
                            </div>
                            <h3 className="text-lg font-bold text-white mt-1 line-clamp-1">
                              {currentItem.name}
                            </h3>
                            <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                              {currentItem.description || 'Made fresh upon order with farm-fresh ingredients.'}
                            </p>
                          </div>

                          {/* Price Display */}
                          <div className="text-right shrink-0">
                            <div className="text-xl font-black text-orange-400">
                              ${currentItem.final_price?.toFixed(2)}
                            </div>
                            {currentItem.discount_percent > 0 && (
                              <div className="text-xs text-slate-500 line-through">
                                ${currentItem.price?.toFixed(2)}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Demand Banner & Add to Cart button */}
                        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                          <div className="text-[11px] text-amber-300/90 font-medium flex items-center space-x-1">
                            <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>
                              {currentItem.stock <= 0
                                ? 'Unavailable for ordering right now'
                                : currentItem.stock <= 8
                                ? `Limited batch! Only ${currentItem.stock} portions left today`
                                : '🔥 High demand: Order before lunch rush!'}
                            </span>
                          </div>

                          <button
                            onClick={() => handleCarouselAddToCart(currentItem)}
                            disabled={currentItem.stock <= 0 || addingToCart}
                            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md shrink-0 ${
                              currentItem.stock <= 0
                                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                                : addedSuccess
                                ? 'bg-emerald-500 text-white'
                                : 'bg-orange-500 hover:bg-orange-600 text-white hover:scale-105 active:scale-95 shadow-orange-500/20'
                            }`}
                          >
                            {currentItem.stock <= 0 ? (
                              <span>Sold Out</span>
                            ) : addedSuccess ? (
                              <>
                                <Check className="w-4 h-4" />
                                <span>Added</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4" />
                                <span>Order Now</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Carousel Dot Indicators */}
                        {featuredItems.length > 1 && (
                          <div className="flex items-center justify-center space-x-1.5 mt-3 pt-2">
                            {featuredItems.map((_, idx) => (
                              <button
                                key={idx}
                                onClick={() => setActiveSlide(idx)}
                                aria-label={`Go to slide ${idx + 1}`}
                                className={`h-1.5 rounded-full transition-all ${
                                  idx === activeSlide ? 'w-6 bg-orange-500' : 'w-2 bg-white/20 hover:bg-white/40'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Highlights Row: Updated to 3 Food-Delivery Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Card 1: 30-Min Fast Delivery */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-md hover:shadow-lg transition-shadow flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <Bike className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">30-Min Lightning Delivery</h4>
              <p className="text-xs text-slate-500 mt-0.5">Piping hot meals straight to your doorstep</p>
            </div>
          </div>

          {/* Card 2: Freshly Cooked To Order */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-md hover:shadow-lg transition-shadow flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">Freshly Cooked To Order</h4>
              <p className="text-xs text-slate-500 mt-0.5">Crafted by master chefs with 100% farm produce</p>
            </div>
          </div>

          {/* Card 3: Safe & Contactless Drop-off */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-md hover:shadow-lg transition-shadow flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">Safe Contactless Drop-off</h4>
              <p className="text-xs text-slate-500 mt-0.5">Hygienic sealed packaging &amp; live order tracking</p>
            </div>
          </div>

        </div>
      </section>

      {/* Featured Items Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center space-x-2 text-orange-600 text-xs font-bold tracking-wider uppercase mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Handpicked For You</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Today's Featured Specials
            </h2>
          </div>
          <Link
            to="/menu"
            className="text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center space-x-1 mt-2 sm:mt-0"
          >
            <span>View All Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Loading state skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredItems.map((food) => (
              <FoodCard key={food.id} food={food} />
            ))}
          </div>
        )}
      </section>

    </div>
  );
};
