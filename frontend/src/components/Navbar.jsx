// Import React and useState
import React, { useState } from 'react';
// Import Link, useNavigate, and useLocation from react-router-dom
import { Link, useNavigate, useLocation } from 'react-router-dom';
// Import useAuth for user state
import { useAuth } from '../context/AuthContext';
// Import useCart for cart count badge
import { useCart } from '../context/CartContext';
// Import lucide icons
import { 
  UtensilsCrossed, 
  ShoppingCart, 
  User, 
  LogOut, 
  LogIn, 
  ShieldCheck, 
  Layers, 
  Users, 
  ClipboardList,
  Menu as MenuIcon,
  X
} from 'lucide-react';

// Navigation bar component with responsive styling and user/admin controls
export const Navbar = () => {
  // Extract auth data and logout method
  const { user, isAdmin, logout } = useAuth();
  // Extract cart total count
  const { totalCount } = useCart();
  // Navigation hook
  const navigate = useNavigate();
  // Location hook to highlight active tab
  const location = useLocation();
  // State for mobile menu toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle logout and redirect to login page
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Helper function to check if route is currently active
  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo and Brand Title */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-800">
              Foodie<span className="text-orange-500">Bite</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {/* Featured Page Link */}
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/') ? 'text-orange-600 bg-orange-50 font-semibold' : 'text-slate-600 hover:text-orange-500 hover:bg-slate-50'
              }`}
            >
              Featured
            </Link>

            {/* Menu Page Link */}
            <Link
              to="/menu"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/menu') ? 'text-orange-600 bg-orange-50 font-semibold' : 'text-slate-600 hover:text-orange-500 hover:bg-slate-50'
              }`}
            >
              Explore Menu
            </Link>

            {/* Orders Link (User only) */}
            {user && (
              <Link
                to="/orders"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/orders') ? 'text-orange-600 bg-orange-50 font-semibold' : 'text-slate-600 hover:text-orange-500 hover:bg-slate-50'
                }`}
              >
                My Orders
              </Link>
            )}

            {/* Admin Portal Navigation Links */}
            {isAdmin && (
              <div className="flex items-center ml-2 pl-2 border-l border-slate-200 space-x-1">
                <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-700 mr-1">
                  Admin
                </span>
                <Link
                  to="/admin"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/admin') ? 'text-purple-700 bg-purple-50 font-semibold' : 'text-slate-600 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/stock"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/admin/stock') ? 'text-purple-700 bg-purple-50 font-semibold' : 'text-slate-600 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  Stock & Discount
                </Link>
                <Link
                  to="/admin/users"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/admin/users') ? 'text-purple-700 bg-purple-50 font-semibold' : 'text-slate-600 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  Users
                </Link>
              </div>
            )}
          </nav>

          {/* Right Header Controls (Cart & Authentication) */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Cart Button */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-xl text-slate-700 hover:text-orange-600 hover:bg-orange-50 transition-colors"
              title="View Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm animate-pulse">
                  {totalCount}
                </span>
              )}
            </Link>

            {/* User Profile / Login Button */}
            {user ? (
              <div className="flex items-center space-x-3 pl-2 border-l border-slate-200">
                <div className="text-right">
                  <p className="text-xs font-semibold text-slate-900 leading-tight">{user.name}</p>
                  <p className="text-[11px] text-slate-400 capitalize">{user.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-slate-200"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-orange-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-xl shadow-sm transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu hamburger button */}
          <div className="flex md:hidden items-center space-x-2">
            <Link to="/cart" className="relative p-2 text-slate-700">
              <ShoppingCart className="w-5 h-5" />
              {totalCount > 0 && (
                <span className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {totalCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown panel */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 space-y-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-orange-50"
            >
              Featured
            </Link>
            <Link
              to="/menu"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-orange-50"
            >
              Explore Menu
            </Link>
            {user && (
              <Link
                to="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-orange-50"
              >
                My Orders
              </Link>
            )}
            {isAdmin && (
              <div className="pt-2 border-t border-slate-100 space-y-1">
                <span className="block px-3 text-xs font-bold uppercase text-purple-600">Admin Portal</span>
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-1.5 rounded-md text-sm text-purple-700 hover:bg-purple-50"
                >
                  Analytics Dashboard
                </Link>
                <Link
                  to="/admin/stock"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-1.5 rounded-md text-sm text-purple-700 hover:bg-purple-50"
                >
                  Stock & Discount Management
                </Link>
                <Link
                  to="/admin/users"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-1.5 rounded-md text-sm text-purple-700 hover:bg-purple-50"
                >
                  User Management
                </Link>
              </div>
            )}
            <div className="pt-3 border-t border-slate-200">
              {user ? (
                <div className="flex items-center justify-between px-3">
                  <span className="text-sm font-medium text-slate-700">{user.name}</span>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-sm font-medium text-red-600"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex space-x-2 px-3">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 text-sm font-medium text-white bg-orange-500 rounded-lg"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
