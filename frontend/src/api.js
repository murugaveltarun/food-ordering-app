// Import axios library for making HTTP requests
import axios from 'axios';

// Parameterized backend API URL from environment variables or default to localhost:5000
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api';

// Create a pre-configured Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios request interceptor to automatically attach JWT token from localStorage to headers
api.interceptors.request.use(
  (config) => {
    // Retrieve stored JWT token
    const token = localStorage.getItem('token');
    // If token exists, append Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Handle request errors
    return Promise.reject(error);
  }
);

// Export the configured api client instance
export default api;
