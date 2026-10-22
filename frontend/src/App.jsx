// Import React
import React from 'react';
// Import routing components from react-router-dom
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// Import authentication and shopping cart providers
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
// Import shared navigation bar
import { Navbar } from './components/Navbar';
// Import customer portal pages
import { Featured } from './pages/Featured';
import { Menu } from './pages/Menu';
import { Cart } from './pages/Cart';
import { Orders } from './pages/Orders';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
// Import administrator portal pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { StockManagement } from './pages/admin/StockManagement';
import { UserManagement } from './pages/admin/UserManagement';

// ProtectedRoute component to guard routes meant strictly for administrators
const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();

  // Show minimal loader while verifying token session
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-xs text-slate-400">Loading session...</div>;
  }

  // Redirect to login if user is unauthenticated or not an admin
  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Main App component configuring providers, navigation, and application route structure
export default function App() {
  return (
    // Wrap entire application in authentication context provider
    <AuthProvider>
      {/* Wrap in shopping cart context provider */}
      <CartProvider>
        {/* Router provider for page transitions */}
        <Router>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
            {/* Sticky navigation header */}
            <Navbar />

            {/* Application route switch */}
            <main className="flex-1">
              <Routes>
                {/* Customer Public & Ordering Routes */}
                <Route path="/" element={<Featured />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/orders" element={<Orders />} />

                {/* Authentication Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Administrator Protected Routes */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/stock"
                  element={
                    <AdminRoute>
                      <StockManagement />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <AdminRoute>
                      <UserManagement />
                    </AdminRoute>
                  }
                />

                {/* Catch-all fallback route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
              <p>&copy; {new Date().getFullYear()} FoodieBite &bull; Delicious Food, Delivered Fast.</p>
            </footer>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
