import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        setUser(parsed);

        // Verify session validity with backend
        if (parsed.token) {
          api.get('/auth/me')
            .then((res) => {
              if (res.data?.success) {
                const freshData = { ...res.data.data, token: parsed.token };
                setUser(freshData);
                localStorage.setItem('userInfo', JSON.stringify(freshData));
              }
            })
            .catch((err) => {
              if (err.response?.status === 401) {
                console.warn('[AUTH] Stale session detected, logging out');
                setUser(null);
                localStorage.removeItem('userInfo');
              }
            });
        }
      } catch {
        localStorage.removeItem('userInfo');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        setUser(res.data.data);
        localStorage.setItem('userInfo', JSON.stringify(res.data.data));
        return { success: true, data: res.data.data };
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (name, email, phone, password) => {
    try {
      const res = await api.post('/auth/register', { name, email, phone, password });
      if (res.data.success) {
        setUser(res.data.data);
        localStorage.setItem('userInfo', JSON.stringify(res.data.data));
        return { success: true, data: res.data.data };
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  const loginWithToken = async (token) => {
    try {
      // Store token temporarily to allow api to use it for the /me request
      localStorage.setItem('userInfo', JSON.stringify({ token }));
      const res = await api.get('/auth/me');
      if (res.data.success) {
        const userData = { ...res.data.data, token };
        setUser(userData);
        localStorage.setItem('userInfo', JSON.stringify(userData));
        return { success: true, data: userData };
      }
    } catch (error) {
      localStorage.removeItem('userInfo');
      return { success: false, message: 'Failed to authenticate with Google' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
  };

  const updateSession = (updatedUser) => {
    const newUser = { ...user, ...updatedUser };
    setUser(newUser);
    localStorage.setItem('userInfo', JSON.stringify(newUser));
  };

  const value = {
    user,
    loading,
    login,
    register,
    loginWithToken,
    logout,
    updateSession
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
