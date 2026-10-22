// Import React and hooks
import React, { useState } from 'react';
// Import Link and useNavigate
import { Link, useNavigate } from 'react-router-dom';
// Import useCart hook
import { useCart } from '../context/CartContext';
// Import useAuth hook
import { useAuth } from '../context/AuthContext';
// Import api client
import api from '../api';
// Import lucide icons
import { 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShoppingBag, 
  Mail, 
  MapPin, 
  Phone, 
  CheckCircle,
  AlertCircle 
} from 'lucide-react';

// Cart Page component for reviewing order items, entering delivery info, and placing order
export const Cart = () => {
  // Extract cart state and helper actions
  const { cartItems, totalAmount, updateQuantity, removeFromCart, clearCart } = useCart();
  // Extract logged in user profile
  const { user } = useAuth();
  // Navigation hook
  const navigate = useNavigate();

  // State for delivery address input
  const [deliveryAddress, setDeliveryAddress] = useState('');
  // State for phone number input
  const [phone, setPhone] = useState('');
  // State for submitting loading spinner
  const [submitting, setSubmitting] = useState(false);
  // State for error message banner
  const [errorMsg, setErrorMsg] = useState('');
  // State for successful order modal
  const [placedOrder, setPlacedOrder] = useState(null);

  // Handle checkout and order creation without payment
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Require address
    if (!deliveryAddress.trim()) {
      setErrorMsg('Please enter your delivery address.');
      return;
    }

    try {
      setSubmitting(true);
      // Call create order endpoint
      const response = await api.post('/orders', {
        delivery_address: deliveryAddress.trim(),
        phone: phone.trim(),
      });

      if (response.data.success) {
        // Set completed order data to display confirmation screen
        setPlacedOrder(response.data.order);
        // Clear local cart
        await clearCart();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to place order. Please try again.';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // If user is not logged in, prompt sign in
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-slate-200 shadow-md">
          <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Sign in to view your cart</h2>
          <p className="text-xs text-slate-500 mt-2">
            Please log in or create an account to start placing delicious food orders.
          </p>
          <div className="mt-6 flex space-x-3">
            <Link
              to="/login"
              className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 text-center transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 text-center transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If order was just placed, show confirmation screen
  if (placedOrder) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-lg w-full text-center border border-slate-200 shadow-xl space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              Order Confirmed!
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2">
              Thank You, {user.name}!
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Your order <span className="font-bold text-slate-900">#{placedOrder.order_number}</span> has been received.
            </p>
          </div>

          {/* Email Confirmation Notice Box */}
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-start space-x-3 text-left">
            <div className="p-2 rounded-xl bg-orange-100 text-orange-600 shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-orange-950 uppercase">Email Confirmation Sent</h4>
              <p className="text-xs text-orange-800 mt-0.5 leading-relaxed">
                A receipt and order summary has been emailed directly to <strong>{user.email}</strong>.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
            <button
              onClick={() => navigate('/orders')}
              className="flex-1 py-3 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-md"
            >
              View Order History
            </button>
            <button
              onClick={() => navigate('/menu')}
              className="flex-1 py-3 rounded-xl text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 transition-colors"
            >
              Order More Food
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If cart is empty
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center border border-slate-200 shadow-sm">
          <div className="w-20 h-20 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Your Cart is Empty</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Looks like you haven't added anything to your cart yet. Check out our menu!
          </p>
          <Link
            to="/menu"
            className="mt-6 inline-flex items-center space-x-2 px-6 py-3 rounded-2xl text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-md shadow-orange-500/20 transition-all"
          >
            <span>Browse Full Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Shopping Cart</h1>
          <p className="text-sm text-slate-500 mt-1">Review your meal selection and confirm delivery details.</p>
        </div>

        {/* Error Alert if any */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {cartItems.length} {cartItems.length === 1 ? 'Dish' : 'Dishes'} Selected
                </span>
                <button
                  onClick={clearCart}
                  className="text-xs font-medium text-red-500 hover:text-red-700 hover:underline"
                >
                  Clear Cart
                </button>
              </div>

              {/* Cart Items Iteration */}
              <div className="divide-y divide-slate-100">
                {cartItems.map((item) => {
                  const food = item.food;
                  if (!food) return null;
                  const itemSubtotal = (food.final_price * item.quantity).toFixed(2);

                  return (
                    <div key={item.id} className="py-4 flex items-center space-x-4">
                      {/* Food Photo */}
                      <img
                        src={food.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'}
                        alt={food.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200';
                        }}
                        className="w-16 h-16 rounded-xl object-cover bg-slate-100 shrink-0"
                      />

                      {/* Food Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-slate-900 truncate">{food.name}</h4>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="text-xs font-semibold text-orange-600">
                            ${food.final_price?.toFixed(2)}
                          </span>
                          {food.discount_percent > 0 && (
                            <span className="text-[11px] text-slate-400 line-through">
                              ${food.price?.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Stepper Controls */}
                      <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl p-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-lg bg-white text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors shadow-xs"
                          title="Decrease Quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-lg bg-white text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors shadow-xs"
                          title="Increase Quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Line Item Subtotal */}
                      <div className="text-right w-20">
                        <span className="text-sm font-extrabold text-slate-900">${itemSubtotal}</span>
                      </div>

                      {/* Delete Item Button */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Checkout Form & Order Summary */}
          <div className="lg:col-span-5 space-y-6">
            <form onSubmit={handlePlaceOrder} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-slate-900">Delivery Details</h3>

              {/* Delivery Address Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-orange-500" />
                  <span>Delivery Address *</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Room 402, Hostel Block B, Campus Road"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
                />
              </div>

              {/* Phone Number Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                  <Phone className="w-3.5 h-3.5 text-orange-500" />
                  <span>Contact Phone Number</span>
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +1 234 567 890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>

              {/* Order Bill Summary */}
              <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-800">${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Delivery Fee</span>
                  <span className="font-bold text-emerald-600">FREE</span>
                </div>
                <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-slate-900">Grand Total</span>
                  <span className="text-xl font-black text-orange-600">${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Notice that no payment is required */}
              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 flex items-center space-x-2.5 text-slate-600 text-[11px]">
                <Mail className="w-4 h-4 text-orange-500 shrink-0" />
                <span>No payment required. An order confirmation will be dispatched to <strong>{user.email}</strong>.</span>
              </div>

              {/* Confirm Order Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider text-white bg-orange-500 hover:bg-orange-600 active:scale-[0.99] transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center space-x-2 disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span>Placing Order...</span>
                ) : (
                  <>
                    <span>Place Order (Send Email)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};
