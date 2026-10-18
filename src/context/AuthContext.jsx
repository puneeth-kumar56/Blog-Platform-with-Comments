import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api.js';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('devscribe_token'));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hydrate user on initial load if token exists
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('devscribe_token');
      if (storedToken) {
        try {
          const res = await authApi.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            setToken(storedToken);
          } else {
            logout();
          }
        } catch (err) {
          console.warn('[AuthContext] Session invalid or expired. Logging out.');
          logout();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authApi.login({ email, password });
      if (res.success && res.token && res.user) {
        localStorage.setItem('devscribe_token', res.token);
        setToken(res.token);
        setUser(res.user);
        setIsLoading(false);
        return true;
      }
      setError(res.message || 'Login failed.');
      setIsLoading(false);
      return false;
    } catch (err) {
      setError(err.message || 'Login failed.');
      setIsLoading(false);
      return false;
    }
  };

  const register = async (name, email, password, bio) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authApi.register({ name, email, password, bio });
      if (res.success && res.token && res.user) {
        localStorage.setItem('devscribe_token', res.token);
        setToken(res.token);
        setUser(res.user);
        setIsLoading(false);
        return true;
      }
      setError(res.message || 'Registration failed.');
      setIsLoading(false);
      return false;
    } catch (err) {
      setError(err.message || 'Registration failed.');
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('devscribe_token');
    setToken(null);
    setUser(null);
    setError(null);
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await authApi.getMe();
      if (res.success && res.user) {
        setUser(res.user);
      }
    } catch (err) {
      console.error('[AuthContext] Failed to refresh user profile:', err);
    }
  };

  const clearError = () => setError(null);

  const loginDemo = async (account) => {
    const emailMap = {
      alex: 'alex@example.com',
      sarah: 'sarah@example.com',
      marcus: 'marcus@example.com',
    };
    return login(emailMap[account], 'Password123!');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        error,
        login,
        register,
        logout,
        refreshUser,
        clearError,
        loginDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
