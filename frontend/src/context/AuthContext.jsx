import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      // ✅ Read token from 'token' key, fallback to 'auth_user' for OAuth sessions
      let token = localStorage.getItem('token');

      if (!token) {
        const authUser = localStorage.getItem('auth_user');
        if (authUser) {
          try {
            const parsed = JSON.parse(authUser);
            if (parsed?.token) {
              token = parsed.token;
              // Normalize: save it under 'token' key going forward
              localStorage.setItem('token', token);
            }
          } catch (e) {
            console.error('Failed to parse auth_user', e);
          }
        }
      }

      if (token) {
        const response = await api.get('/auth/me');
        setUser(response.data.user);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('auth_user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    const { token, user: userData } = response.data;
    localStorage.setItem('token', token);
    setUser(userData);
    return userData;
  };

  const signup = async (data) => {
    const response = await authService.signup(data);
    const { token, user: userData } = response.data;
    localStorage.setItem('token', token);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('auth_user');
    setUser(null);
    window.location.href = '/login';
  };

  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff';
  const isUser = user?.role === 'user';

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, logout, checkAuth, isAdmin, isStaff, isUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);