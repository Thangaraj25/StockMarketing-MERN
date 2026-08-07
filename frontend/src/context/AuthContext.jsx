import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('shopez_token') || null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Listen for window auth-error events dispatched by API interceptors
  useEffect(() => {
    const handleAuthError = (event) => {
      setAuthError(event.detail || 'There was an error with your authentication. To log in, click the link below.');
      setUser(null);
      setToken(null);
      localStorage.removeItem('shopez_token');
    };

    window.addEventListener('auth-error', handleAuthError);
    return () => window.removeEventListener('auth-error', handleAuthError);
  }, []);

  const clearAuthError = () => {
    setAuthError(null);
  };

  // Fetch Current Logged-In User Profile on mount or token change
  const fetchProfile = async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const response = await API.get('/auth/me');
      setUser(response.data);
      setAuthError(null);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setAuthError('There was an error with your authentication. To log in, click the link below.');
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [token]);

  // Login handler
  const login = async (email, password) => {
    setAuthError(null);
    const response = await API.post('/auth/login', { email, password });
    const { token: jwtToken, user: userData } = response.data;
    localStorage.setItem('shopez_token', jwtToken);
    setToken(jwtToken);
    setUser(userData);
    return response.data;
  };

  // Register handler
  const register = async (name, email, password, role = 'USER') => {
    setAuthError(null);
    const response = await API.post('/auth/register', { name, email, password, role });
    const { token: jwtToken, user: userData } = response.data;
    localStorage.setItem('shopez_token', jwtToken);
    setToken(jwtToken);
    setUser(userData);
    return response.data;
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('shopez_token');
    setToken(null);
    setUser(null);
  };

  const updateBalanceState = (newBalance) => {
    if (user) {
      setUser(prev => ({ ...prev, balance: newBalance }));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      authError,
      clearAuthError,
      login,
      register,
      logout,
      refreshProfile: fetchProfile,
      updateBalanceState,
      isAdmin: user?.role === 'ADMIN'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
