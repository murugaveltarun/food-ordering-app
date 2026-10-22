// Import React and hooks
import React, { useState, useEffect } from 'react';
// Import Link for admin navigation
import { Link } from 'react-router-dom';
// Import api client
import api from '../../api';
// Import lucide icons
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  Package, 
  Clock, 
  ArrowRight,
  CheckCircle,
  Tag
} from 'lucide-react';

// AdminDashboard component for high-level business analytics, order tracking, and stock alerts
export const AdminDashboard = () => {
  // State for analytics data object
  const [data, setData] = useState(null);
  // State for loading status
  const [loading, setLoading] = useState(true);
  // State for status update in-flight
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Function to load analytical metrics from backend API
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/analytics');
      if (res.data.success) {
        setData(res.data.analytics);
      }
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch metrics on mount
  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Function to update status of an order directly from the dashboard
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);
      // Call update order status endpoint
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      // Re-fetch analytics to update list
      await fetchAnalytics();
    } catch (err) {
      alert('Failed to update order status.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4 max-w-7xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white rounded-3xl h-32 border border-slate-200 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const {
    total_revenue,
    total_orders,
    total_users,
    low_stock_count,
    low_stock_items,
    top_items,
    recent_orders,
  } = data || {};

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-purple-600 text-xs font-bold uppercase tracking-wider">
              <span>Admin Control Center</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">Analytics Dashboard</h1>
            <p className="text-xs text-slate-500 mt-1">Live metrics across sales, customers, stock, and orders.</p>
          </div>

          <div className="flex space-x-3">
            <Link
              to="/admin/stock"
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-sm flex items-center space-x-1.5"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Manage Stock & Discounts</span>
            </Link>
            <Link
              to="/admin/users"
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-colors shadow-sm flex items-center space-x-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Manage Users</span>
            </Link>
          </div>
        </div>

        {/* 4 Analytics Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Revenue Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Revenue</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">${total_revenue?.toFixed(2)}</h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">All processed orders</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          {/* Total Orders Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Orders</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{total_orders}</h3>
              <p className="text-[11px] text-blue-600 font-semibold mt-1">Orders placed</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>

          {/* Total Users Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Registered Users</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{total_users}</h3>
              <p className="text-[11px] text-purple-600 font-semibold mt-1">Active customers</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Low Stock Alerts Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Low Stock Alerts</p>
              <h3 className="text-2xl font-black text-red-600 mt-1">{low_stock_count}</h3>
              <p className="text-[11px] text-slate-400 font-semibold mt-1">Items ≤ 10 stock</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Low Stock Warning Banner if items exist */}
        {low_stock_count > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 text-amber-800 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Inventory Warning: The following items are running low on stock!</span>
              </div>
              <Link
                to="/admin/stock"
                className="text-xs font-bold text-amber-900 underline hover:text-amber-700"
              >
                Restock Now &rarr;
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {low_stock_items?.map((item) => (
                <span
                  key={item.id}
                  className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-xs font-semibold text-amber-900 shadow-xs flex items-center space-x-1.5"
                >
                  <span>{item.name}</span>
                  <span className="bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded text-[10px]">
                    {item.stock} left
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Grid: Top Selling Items & Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Top Selling Food Items Column */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <h3 className="text-base font-bold text-slate-900">Top Selling Dishes</h3>
            </div>

            {top_items?.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No sales data yet.</p>
            ) : (
              <div className="space-y-3 pt-2">
                {top_items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-black text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-slate-900 block">
                        {item.quantity_sold} sold
                      </span>
                      <span className="text-[11px] text-slate-400">${item.total_revenue}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Orders Management Column */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">Recent Customer Orders</h3>
              </div>
              <span className="text-xs font-semibold text-slate-400">Latest 5 Orders</span>
            </div>

            {recent_orders?.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No orders placed yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {recent_orders?.map((order) => (
                  <div key={order.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-xs text-slate-900">#{order.order_number}</span>
                        <span className="text-[11px] text-slate-400">&bull; {order.created_at}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        <strong className="text-slate-800">{order.customer_name}</strong> ({order.customer_email})
                      </p>
                      <p className="text-xs font-black text-purple-700 mt-1">
                        ${order.total_amount?.toFixed(2)}
                      </p>
                    </div>

                    {/* Live Order Status Selector */}
                    <div className="flex items-center space-x-2">
                      <label className="text-[11px] font-semibold text-slate-400">Status:</label>
                      <select
                        disabled={updatingOrderId === order.id}
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="text-xs font-bold py-1.5 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
