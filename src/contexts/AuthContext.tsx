
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  sendEmailVerification,
  verifyBeforeUpdateEmail,
  updatePassword as firebaseUpdatePassword,
  type User 
} from 'firebase/auth';
import { auth } from '@/lib/firebaseConfig'; // Ensure auth is exported from firebaseConfig
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateAdminEmail: (newEmail: string) => Promise<boolean>;
  updateAdminPassword: (newPassword: string) => Promise<boolean>;
  sendAdminEmailVerification: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    if (!auth) {
      console.error("Firebase Auth is not initialized. Check your Firebase configuration.");
      setLoading(false);
      // Potentially redirect to an error page or show a global error message
      if (!pathname.startsWith('/admin')) { // Avoid redirect loops if already on admin page
        // router.push('/config-error'); // Example error route
      }
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, pathname]);

  const login = async (email: string, pass: string): Promise<boolean> => {
    if (!auth) {
      toast({ variant: "destructive", title: "Login Failed", description: "Authentication service not available." });
      return false;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      // onAuthStateChanged will handle setting the user and redirecting
      // No need to setLoading(false) here, onAuthStateChanged does it.
      // No need to router.push here if admin layout handles it based on user state
      return true;
    } catch (error: any) {
      console.error("Firebase login error:", error);
      const errorMessage = error.message || "Invalid credentials or network error.";
      toast({ variant: "destructive", title: "Login Failed", description: errorMessage });
      setUser(null);
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    if (!auth) {
      toast({ variant: "destructive", title: "Logout Failed", description: "Authentication service not available." });
      return;
    }
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      setUser(null);
      // onAuthStateChanged will set user to null.
      // Redirecting from here ensures a clean state.
      router.push('/admin'); 
    } catch (error: any) {
      console.error("Firebase logout error:", error);
      toast({ variant: "destructive", title: "Logout Failed", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const updateAdminEmail = async (newEmail: string): Promise<boolean> => {
    if (!auth || !auth.currentUser) {
      toast({ variant: "destructive", title: "Error", description: "No user logged in or auth service unavailable." });
      return false;
    }
    try {
      await verifyBeforeUpdateEmail(auth.currentUser, newEmail);
      toast({ title: "Verification Email Sent", description: `A verification email has been sent to ${newEmail}. Please verify to update your email address.` });
      // Note: auth.currentUser.email won't update immediately. It updates after verification.
      return true;
    } catch (error: any) {
      console.error("Update email error:", error);
      if (error.code === 'auth/requires-recent-login') {
        toast({
          variant: "destructive",
          title: "Action Requires Recent Login",
          description: "This action is sensitive and requires a recent login. Please log out and log back in to continue.",
          duration: 6000, // Give user a bit more time to read
        });
      } else {
        toast({ variant: "destructive", title: "Update Email Failed", description: error.message });
      }
      return false;
    }
  };
  
  const updateAdminPassword = async (newPassword: string): Promise<boolean> => {
    if (!auth || !auth.currentUser) {
      toast({ variant: "destructive", title: "Error", description: "No user logged in or auth service unavailable." });
      return false;
    }
    try {
      await firebaseUpdatePassword(auth.currentUser, newPassword);
      toast({ title: "Password Updated", description: "Your password has been successfully updated." });
      return true;
    } catch (error: any) {
      console.error("Update password error:", error);
      if (error.code === 'auth/requires-recent-login') {
         toast({
          variant: "destructive",
          title: "Action Requires Recent Login",
          description: "Changing your password requires a recent login. Please log out and log back in to continue.",
          duration: 6000,
        });
      } else {
        toast({ variant: "destructive", title: "Update Password Failed", description: error.message });
      }
      return false;
    }
  };

  const sendAdminEmailVerification = async (): Promise<boolean> => {
    if (!auth || !auth.currentUser) {
      toast({ variant: "destructive", title: "Error", description: "No user logged in or auth service unavailable." });
      return false;
    }
    if (auth.currentUser.emailVerified) {
       toast({ title: "Email Already Verified", description: "Your email address is already verified." });
       return true;
    }
    try {
      await sendEmailVerification(auth.currentUser);
      toast({ title: "Verification Email Sent", description: `A new verification email has been sent to ${auth.currentUser.email}.` });
      return true;
    } catch (error: any) {
      console.error("Send verification email error:", error);
      toast({ variant: "destructive", title: "Verification Failed", description: error.message });
      return false;
    }
  };


  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateAdminEmail, updateAdminPassword, sendAdminEmailVerification }}>
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
