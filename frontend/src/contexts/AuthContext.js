import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

// Create the AuthContext
const AuthContext = createContext(null);

// AuthProvider component to manage authentication state and functions
export const AuthProvider = ({ children }) => {
  // State for the current user and loading state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Function to check the user's authentication status
  const checkAuthStatus = async () => {
    try {
      const response = await api.get('/check-auth');
      if (response.data.authenticated) {
        // Set the user if authenticated
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      } else {
        // Clear user data if not authenticated
        localStorage.removeItem('user');
        setUser(null);
      }
    } catch (error) {
      // Clear user data in case of an error
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      // Set loading to false after checking auth status
      setLoading(false);
    }
  };

  // Function to log in the user
  const login = async (username, password) => {
    try {
      const response = await api.post('/login', { username, password });
      const userData = response.data.user;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      // Throw an error if login fails
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  // Function to register a new user
  const register = async (username, email, password) => {
    try {
      const response = await api.post('/register', { username, email, password });
      console.log('Registration response:', response.data); // Debug log

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      return response.data;
    } catch (error) {
      console.error('Registration error:', error); // Log registration errors
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  };

  // Function to log out the user
  const logout = async () => {
    try {
      await api.get('/logout');
      setUser(null);
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };


  // Provide the authentication context value
  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to access the authentication context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};