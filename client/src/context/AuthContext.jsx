import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('medibook_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from local storage and verify with backend
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('medibook_token');
      if (storedToken) {
        try {
          const res = await authApi.getMe();
          setUser(res.data.user);
          setToken(storedToken);
        } catch (err) {
          localStorage.removeItem('medibook_token');
          localStorage.removeItem('medibook_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authApi.login({ email, password });
      const { user: loggedInUser, token: authToken } = res.data;

      localStorage.setItem('medibook_token', authToken);
      localStorage.setItem('medibook_user', JSON.stringify(loggedInUser));

      setUser(loggedInUser);
      setToken(authToken);

      toast.success(`Welcome back, ${loggedInUser.name}!`);
      return loggedInUser;
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check credentials.');
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const res = await authApi.register(userData);
      const { user: newUser, token: authToken } = res.data;

      localStorage.setItem('medibook_token', authToken);
      localStorage.setItem('medibook_user', JSON.stringify(newUser));

      setUser(newUser);
      setToken(authToken);

      toast.success('Registration successful! Welcome to MediBook.');
      return newUser;
    } catch (err) {
      toast.error(err.message || 'Registration failed');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('medibook_token');
    localStorage.removeItem('medibook_user');
    setUser(null);
    setToken(null);
    toast.success('You have been logged out.');
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await authApi.updateProfile(profileData);
      setUser(res.data);
      localStorage.setItem('medibook_user', JSON.stringify(res.data));
      toast.success('Profile updated successfully!');
      return res.data;
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
      throw err;
    }
  };

  const toggleSMSConsent = async (consent) => {
    try {
      const res = await authApi.updateSMSConsent(consent);
      setUser((prev) => ({ ...prev, smsConsent: res.data.smsConsent }));
      toast.success(res.message);
      return res.data;
    } catch (err) {
      toast.error(err.message || 'Failed to update SMS preference');
      throw err;
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    toggleSMSConsent,
    isAuthenticated: !!token && !!user,
    isPatient: user?.role === 'patient',
    isDoctor: user?.role === 'doctor',
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
