"use client";

import type { ReactNode } from 'react';
import React, { createContext, useState, useContext, useEffect } from 'react';

interface AuthContextType {
  isAdmin: boolean;
  login: () => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for persisted auth state
    try {
      const storedIsAdmin = localStorage.getItem('isAdmin');
      if (storedIsAdmin === 'true') {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error("Failed to access localStorage:", error);
    }
    setLoading(false);
  }, []);

  const login = () => {
    setIsAdmin(true);
    try {
      localStorage.setItem('isAdmin', 'true');
    } catch (error) {
      console.error("Failed to access localStorage:", error);
    }
  };

  const logout = () => {
    setIsAdmin(false);
    try {
      localStorage.removeItem('isAdmin');
    } catch (error) {
      console.error("Failed to access localStorage:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAdmin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
