// Import React hooks for cart state and context management
import React, { createContext, useContext, useState, useEffect } from 'react';
// Import api client
import api from '../api';
// Import auth context to know when user logs in or out
import { useAuth } from './AuthContext';

// Create Cart Context instance
const CartContext = createContext();

// CartProvider component to handle cart state globally
export const CartProvider = ({ children }) => {
  // Current user from AuthContext
  const { user } = useAuth();
  // State for cart items array
  const [cartItems, setCartItems] = useState([]);
  // State for total cart amount
  const [totalAmount, setTotalAmount] = useState(0);
  // State for loading status
  const [loading, setLoading] = useState(false);

  // Function to fetch active user's cart from backend
  const fetchCart = async () => {
    // If not logged in, empty cart
    if (!user) {
      setCartItems([]);
      setTotalAmount(0);
      return;
    }

    try {
      setLoading(true);
      // Fetch cart items from API
      const res = await api.get('/cart');
      if (res.data.success) {
        setCartItems(res.data.items);
        setTotalAmount(res.data.total_amount);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch cart whenever authenticated user changes
  useEffect(() => {
    fetchCart();
  }, [user]);

  // Function to add a food item to user's cart
  const addToCart = async (foodId, quantity = 1) => {
    try {
      // Post item to backend cart
      const res = await api.post('/cart', { food_id: foodId, quantity });
      // Refresh cart data
      await fetchCart();
      return { success: true, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add item to cart.';
      return { success: false, message: msg };
    }
  };

  // Function to update quantity of an existing cart item
  const updateQuantity = async (itemId, quantity) => {
    try {
      // Put updated quantity to backend
      await api.put(`/cart/${itemId}`, { quantity });
      // Refresh cart
      await fetchCart();
      return { success: true };
    } catch (err) {
      return { success: false, message: 'Failed to update quantity.' };
    }
  };

  // Function to delete an item from the cart
  const removeFromCart = async (itemId) => {
    try {
      // Delete item request
      await api.delete(`/cart/${itemId}`);
      // Refresh cart
      await fetchCart();
      return { success: true };
    } catch (err) {
      return { success: false, message: 'Failed to remove item.' };
    }
  };

  // Function to clear all items from the cart
  const clearCart = async () => {
    try {
      // Clear cart request
      await api.delete('/cart/clear');
      setCartItems([]);
      setTotalAmount(0);
      return { success: true };
    } catch (err) {
      return { success: false };
    }
  };

  // Calculate total number of individual dishes in cart
  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Cart context value object
  const value = {
    cartItems,
    totalAmount,
    totalCount,
    loading,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };

  // Render provider
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook to access cart from any component
export const useCart = () => {
  return useContext(CartContext);
};
