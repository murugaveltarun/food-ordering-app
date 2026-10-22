// Import React hooks for managing state and context
import React, { createContext, useContext, useState, useEffect } from 'react';
// Import api client
import api from '../api';

// Create the Auth Context instance
const AuthContext = createContext();

// AuthProvider component to wrap application and share authentication state
export const AuthProvider = ({ children }) => {
  // State to store currently authenticated user object
  const [user, setUser] = useState(null);
  // State to store JWT token string
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  // State to handle initial authentication check loading
  const [loading, setLoading] = useState(true);

  // Hook to restore user session on initial application load
  useEffect(() => {
    // Check if token exists in localStorage
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      try {
        // Restore user state from stored JSON string
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch (e) {
        // Clear corrupted storage data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    // Finish loading check
    setLoading(false);
  }, []);

  // Function to log in user with email and password
  const login = async (email, password) => {
    try {
      // Send login credentials to backend
      const response = await api.post('/auth/login', { email, password });
      const { token: receivedToken, user: receivedUser } = response.data;

      // Save token and user details to localStorage
      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user', JSON.stringify(receivedUser));

      // Update state
      setToken(receivedToken);
      setUser(receivedUser);

      return { success: true, user: receivedUser };
    } catch (error) {
      // Return error message from backend
      const message = error.response?.data?.message || 'Login failed. Please check credentials.';
      return { success: false, message };
    }
  };

  // Function to register a new user or admin account
  const register = async (name, email, password, role = 'user') => {
    try {
      // Send registration data to backend
      const response = await api.post('/auth/register', { name, email, password, role });
      const { token: receivedToken, user: receivedUser } = response.data;

      // Automatically store token and user session upon successful registration
      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user', JSON.stringify(receivedUser));

      // Update state
      setToken(receivedToken);
      setUser(receivedUser);

      return { success: true, user: receivedUser };
    } catch (error) {
      // Return error message from backend
      const message = error.response?.data?.message || 'Registration failed. Try again.';
      return { success: false, message };
    }
  };

  // Function to log out the current user and clear stored credentials
  const logout = () => {
    // Remove stored authentication data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Clear state
    setUser(null);
    setToken(null);
  };

  // Context value object containing state and auth handler methods
  const value = {
    user,
    token,
    loading,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
  };

  // Render provider with child components
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to easily access auth state from any component
export const useAuth = () => {
  return useContext(AuthContext);
};
