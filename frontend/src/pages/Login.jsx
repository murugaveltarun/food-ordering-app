// Import React and hooks
import React, { useState } from 'react';
// Import Link and useNavigate
import { Link, useNavigate } from 'react-router-dom';
// Import useAuth hook
import { useAuth } from '../context/AuthContext';
// Import lucide icons
import { LogIn, Lock, Mail, AlertCircle, Sparkles, User, ShieldCheck } from 'lucide-react';

// Login Page component with quick-fill demo buttons for easy college presentation
export const Login = () => {
  // Extract login function from AuthContext
  const { login } = useAuth();
  // Navigation hook
  const navigate = useNavigate();

  // State for email input
  const [email, setEmail] = useState('');
  // State for password input
  const [password, setPassword] = useState('');
  // State for error banner
  const [errorMsg, setErrorMsg] = useState('');
  // State for loading state
  const [loading, setLoading] = useState(false);

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    // Call login API via context
    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      // Redirect admin to admin dashboard, regular user to featured page
      if (res.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      setErrorMsg(res.message);
    }
  };

  // Helper function to quick-fill credentials for demonstration
  const handleQuickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/25 mb-3">
          <LogIn className="w-7 h-7" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
        <p className="text-xs text-slate-500 mt-1">Sign in to your account to order delicious meals</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-slate-200 sm:px-10 space-y-6">
          
          {/* Error Message Alert */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-orange-500 hover:bg-orange-600 active:scale-[0.99] transition-all shadow-md shadow-orange-500/25 flex items-center justify-center space-x-2 disabled:bg-slate-300"
            >
              {loading ? <span>Signing In...</span> : <span>Sign In</span>}
            </button>
          </form>

          {/* Quick Demo Credentials for Reviewers */}
          <div className="pt-4 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center">
              Quick Demo Fill
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('user@food.com', 'user123')}
                className="p-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors border border-orange-200"
              >
                <User className="w-3.5 h-3.5 text-orange-500" />
                <span>Fill Customer</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('admin@food.com', 'admin123')}
                className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors border border-purple-200"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                <span>Fill Admin</span>
              </button>
            </div>
          </div>

          {/* Sign up navigation link */}
          <div className="text-center text-xs text-slate-500 pt-2">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-orange-600 hover:text-orange-700 hover:underline">
              Create an account
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};
