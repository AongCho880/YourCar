
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  isAdmin: boolean;
  loading: boolean;
  login: (user: string, pass: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "password"; // In a real app, this would be handled securely on a backend
const LOCAL_STORAGE_KEY = "yourCarAdminLoggedIn";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedIsAdmin = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedIsAdmin === 'true') {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error("Could not access localStorage:", error);
      // Handle cases where localStorage is not available or access is denied
    }
    setLoading(false);
  }, []);

  const login = async (user: string, pass: string): Promise<boolean> => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500)); 
    if (user === ADMIN_USERNAME && pass === ADMIN_PASSWORD) {
      setIsAdmin(true);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, 'true');
      } catch (error) {
        console.error("Could not set localStorage item:", error);
      }
      setLoading(false);
      return true;
    }
    setIsAdmin(false);
    setLoading(false);
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (error) {
      console.error("Could not remove localStorage item:", error);
    }
    router.push('/admin'); // Redirect to login page on logout
  };

  return (
    <AuthContext.Provider value={{ isAdmin, loading, login, logout }}>
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
