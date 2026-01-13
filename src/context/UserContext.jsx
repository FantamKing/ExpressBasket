import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from '../utils/axios';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Session validation function
  const validateSession = useCallback(async () => {
    const token = localStorage.getItem('userToken');
    if (!token || !user) return;

    try {
      const response = await axios.get('/user/validate-session', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.data.valid) {
        // Session is invalid
        setSessionExpired(true);
        localStorage.removeItem('userToken');
        setUser(null);
      }
    } catch (error) {
      if (error.response?.status === 401 && error.response?.data?.code === 'SESSION_EXPIRED') {
        // Session expired - logged in from another location
        setSessionExpired(true);
        localStorage.removeItem('userToken');
        setUser(null);
      }
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (token) {
      // Verify token and get user data
      axios.get('/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(response => {
          setUser(response.data.user);
        })
        .catch(() => {
          localStorage.removeItem('userToken');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  // Periodic session validation (every 30 seconds)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      validateSession();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [user, validateSession]);

  const login = async (email, password) => {
    try {
      setSessionExpired(false); // Clear any previous session expired state
      const response = await axios.post('/login', { email, password });
      const { token } = response.data;
      localStorage.setItem('userToken', token);

      // Fetch full user profile to get all fields including walletBalance and loyaltyBadge
      const profileResponse = await axios.get('/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(profileResponse.data.user);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const signup = async (userData) => {
    try {
      await axios.post('/signup', userData);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Signup failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('userToken');
    setUser(null);
    setSessionExpired(false);
  };

  const clearSessionExpired = () => {
    setSessionExpired(false);
  };

  const updateProfile = async (updatedData) => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await axios.put('/user/profile', updatedData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Update failed' };
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    updateProfile,
    sessionExpired,
    clearSessionExpired
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};