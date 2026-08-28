import React, { createContext, useState, useContext, useEffect } from 'react';
import { authClient } from '@/api/authClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Initialize user from cached token/user if present for 0ms initial load
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem('auth_user_cache');
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      if (token && cached) {
        return JSON.parse(cached);
      }
    } catch (e) {}
    return null;
  });

  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const token = authClient.getToken();
      if (!token) {
        setUser(null);
        localStorage.removeItem('auth_user_cache');
        return;
      }
      const currentUser = await authClient.getMe();
      if (currentUser) {
        setUser(currentUser);
        localStorage.setItem('auth_user_cache', JSON.stringify(currentUser));
      } else {
        setUser(null);
        localStorage.removeItem('auth_user_cache');
      }
    } catch (e) {
      // Keep existing user state if network glitch
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const login = async (email, password) => {
    const data = await authClient.login(email, password);
    setUser(data.user);
    localStorage.setItem('auth_user_cache', JSON.stringify(data.user));
    setIsLoadingAuth(false);
    return data;
  };

  const register = async (name, email, password) => {
    const data = await authClient.register(name, email, password);
    setUser(data.user);
    localStorage.setItem('auth_user_cache', JSON.stringify(data.user));
    setIsLoadingAuth(false);
    return data;
  };

  const loginAsGuest = () => {
    const guest = authClient.loginAsGuest();
    setUser(guest);
    setIsLoadingAuth(false);
    return guest;
  };

  const logout = () => {
    authClient.logout();
    setUser(null);
    localStorage.removeItem('auth_user_cache');
    window.location.href = '/login';
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  const useCredit = async () => {
    const res = await authClient.useCredit();
    if (res.success && user) {
      const updated = {
        ...user,
        dailyCredits: res.remaining,
        role: res.isPremium ? 'premium' : user.role,
      };
      setUser(updated);
      localStorage.setItem('auth_user_cache', JSON.stringify(updated));
    }
    return res;
  };

  const redeemCode = async (code) => {
    const res = await authClient.redeemCode(code);
    if (res.user) {
      setUser(res.user);
      localStorage.setItem('auth_user_cache', JSON.stringify(res.user));
    }
    return res;
  };

  const isPremium = user?.role === 'premium' || user?.role === 'admin';
  const credits = isPremium ? 999 : (user?.dailyCredits ?? 5);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isPremium,
        credits,
        isLoadingAuth,
        authChecked: !isLoadingAuth,
        login,
        register,
        loginAsGuest,
        logout,
        navigateToLogin,
        useCredit,
        redeemCode,
        refreshUser: checkUser,
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