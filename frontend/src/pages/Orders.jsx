// Import React and hooks
import React, { useState, useEffect } from 'react';
// Import Link and useNavigate
import { Link, useNavigate } from 'react-router-dom';
// Import useAuth hook
import { useAuth } from '../context/AuthContext';
// Import api client
import api from '../api';
// Import lucide icons
import { Package, Clock, MapPin, ChevronRight, ShoppingBag, ArrowRight } from 'lucide-react';

// Orders Page component to display customer order history and statuses
export const Orders = () => {
  // Extract authenticated user
  const { user } = useAuth();
  // Navigation hook
  const navigate = useNavigate();
  // State for customer orders array
  const [orders, setOrders] = useState([]);
  // State for loading state
  const [loading, setLoading] = useState(true);

  // Function to fetch order history from backend API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders');
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders on component mount
  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  // Helper function to return colored status pill based on order status string
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'preparing':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'out for delivery':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  // Redirect guest users to login
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-slate-200 shadow-md">
          <Package className="w-12 h-12 text-orange-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900">Sign in to view orders</h2>
          <p className="text-xs text-slate-500 mt-1">Please log in to review your order history.</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-6 w-full py-2.5 rounded-xl text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header Title */}
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Orders</h1>
          <p className="text-sm text-slate-500 mt-1">Track your past meal orders and live delivery statuses.</p>
        </div>

        {/* Loading skeleton */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl p-6 h-40 animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">No Orders Yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              You haven't placed any food orders yet. Ready for your first delicious meal?
            </p>
            <Link
              to="/menu"
              className="mt-6 inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 transition-colors shadow-sm"
            >
              <span>Explore Menu</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">#{order.order_number}</h4>
                      <p className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{order.created_at}</span>
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Ordered Items List */}
                <div className="py-4 space-y-2">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex justify-between text-xs text-slate-700">
                      <span className="font-medium">
                        {item.quantity}x {item.food_name}
                      </span>
                      <span className="font-semibold text-slate-900">${item.subtotal?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Order Bottom Footer */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate max-w-sm">{order.delivery_address || 'Standard Delivery'}</span>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-xs text-slate-500">Total Billed:</span>
                    <span className="text-base font-black text-orange-600">
                      ${order.total_amount?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
