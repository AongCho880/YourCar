"use client";

import type { ReactNode } from 'react';
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { sendLoginNotification } from '@/ai/flows/send-login-notification-flow';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User & { emailVerified?: boolean } | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateAdminEmail: (newEmail: string) => Promise<boolean>;
  updateAdminPassword: (newPassword: string) => Promise<boolean>;
  sendAdminPasswordResetEmail: (email: string) => Promise<boolean>;
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
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setLoading(false);

      // If session is null and event is SIGNED_OUT, just clear user (no toast, no redirect)
      if (!session && event === "SIGNED_OUT" && pathname !== "/") {
        // No toast, no redirect
      }
    });

    // Initial check
    const checkUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if ((error || !data.user) && pathname !== "/") {
          setUser(null);
          // No toast, no redirect
        } else {
          setUser(data.user);
        }
      } catch (err) {
        if (pathname !== "/") {
          setUser(null);
          // No toast, no redirect
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkUser();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router, pathname]);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (error) {
      toast({ variant: "destructive", title: "Login Failed", description: error.message });
      setLoading(false);
      return false;
    }

    if (data.user) {
      try {
        const loginTimestamp = new Date().toISOString();
        sendLoginNotification({
          adminEmail: data.user.email!,
          loginTimestamp: loginTimestamp,
        }).then(notificationContent => {
          console.log('Login Notification Email Content Generated:');
          console.log(`Intended Recipient: ${data.user.email}`);
          console.log(`Subject: ${notificationContent.emailSubject}`);
          console.log(`Body: ${notificationContent.emailBody}`);
          console.warn(
            `[Action Required] An email notification for this login should be sent. ` +
            `Integrate an email sending service to dispatch this email using the content above.`
          );
        }).catch(notificationError => {
          console.error('Failed to generate login notification content in background:', notificationError);
        });
      } catch (e) {
        console.error('Error initiating login notification generation:', e);
      }
    }

    setLoading(false);
    return true;
  };

  const logout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ variant: "destructive", title: "Logout Failed", description: error.message });
    }
    setUser(null);
    router.push('/admin');
    setLoading(false);
  };

  const updateAdminEmail = async (newEmail: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) {
      toast({ variant: "destructive", title: "Update Email Failed", description: error.message });
      return false;
    }
    toast({ title: "Verification Email Sent", description: `A verification email has been sent to ${newEmail}. Please verify to update your email address.` });
    return true;
  };

  const updateAdminPassword = async (newPassword: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast({ variant: "destructive", title: "Update Password Failed", description: error.message });
      return false;
    }
    toast({ title: "Password Updated", description: "Your password has been successfully updated." });
    return true;
  };

  const sendAdminPasswordResetEmail = async (email: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/update-password`,
    });
    if (error) {
      toast({ variant: "destructive", title: "Request Failed", description: "Could not process the request. Please try again or contact support if the issue persists." });
      return false;
    }
    toast({ title: "Password Reset Email Sent", description: "If an account exists for this email, a password reset link has been sent. Please check your inbox (and spam folder)." });
    return true;
  };

  const sendAdminEmailVerification = async (): Promise<boolean> => {
    if (!user || !user.email) {
      toast({ variant: "destructive", title: "Verification Failed", description: "No user is currently logged in." });
      return false;
    }

    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email,
    });

    if (error) {
      toast({ variant: "destructive", title: "Verification Failed", description: error.message });
      return false;
    }

    toast({ title: "Verification Email Sent", description: `A verification email has been sent to ${user.email}. Please check your inbox (and spam folder).` });
    return true;
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      updateAdminEmail,
      updateAdminPassword,
      sendAdminPasswordResetEmail,
      sendAdminEmailVerification
    }}>
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

