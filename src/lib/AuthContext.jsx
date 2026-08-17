import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    // Directly check if the user is authenticated via the SDK.
    // The SDK client already bootstraps the token from localStorage/URL
    // in base44Client.js, so base44.auth.me() will have the correct header.
    base44.auth.me()
      .then((currentUser) => {
        setUser(currentUser);
      })
      .catch(() => {
        // Not logged in or token invalid - that's fine, just show as logged out
        setUser(null);
      })
      .finally(() => {
        setIsLoadingAuth(false);
      });
  }, []);

  const logout = () => {
    setUser(null);
    try { localStorage.removeItem('base44_access_token'); } catch(e) {}
    try { localStorage.removeItem('token'); } catch(e) {}
    try { if (base44?.auth?.setToken) base44.auth.setToken(null); } catch(e) {}
    window.location.href = '/login';
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoadingAuth,
      isLoadingPublicSettings: false,
      authError: null,
      appPublicSettings: null,
      authChecked: !isLoadingAuth,
      logout,
      navigateToLogin,
      checkUserAuth: () => {},
      checkAppState: () => {},
    }}>
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