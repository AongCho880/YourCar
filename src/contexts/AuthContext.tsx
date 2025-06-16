
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
import { sendLoginNotification } from '@/ai/flows/send-login-notification-flow';

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
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      
      if (userCredential.user && userCredential.user.email) {
        try {
          const loginTimestamp = new Date().toISOString();
          // Intentionally not awaiting this for faster login response to user.
          // Notification generation can happen in the background.
          sendLoginNotification({
            adminEmail: userCredential.user.email,
            loginTimestamp: loginTimestamp,
          }).then(notificationContent => {
            console.log('Login Notification Email Content Generated:');
            console.log(`Intended Recipient: ${userCredential.user.email}`);
            console.log(`Subject: ${notificationContent.emailSubject}`);
            console.log(`Body: ${notificationContent.emailBody}`);
            console.warn(
              `[Action Required] An email notification for this login should be sent. ` +
              `Integrate an email sending service (e.g., SendGrid, Mailgun, Resend, or Firebase Trigger Email extension) ` +
              `to dispatch this email using the content above.`
            );
          }).catch(notificationError => {
            console.error('Failed to generate login notification content in background:', notificationError);
          });
        } catch (e) {
          // Catch any immediate synchronous error from calling sendLoginNotification if it's not truly async
          console.error('Error initiating login notification generation:', e);
        }
      }
      // onAuthStateChanged will handle setting the user and redirecting
      return true;
    } catch (error: any) {
      console.error("Firebase login error:", error);
      const errorMessage = error.message || "Invalid credentials or network error.";
      toast({ variant: "destructive", title: "Login Failed", description: errorMessage });
      setUser(null); // Ensure user state is cleared on failed login
      setLoading(false); // Ensure loading is set to false on error
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
      return true;
    } catch (error: any) {
      console.error("Update email error:", error);
      if (error.code === 'auth/requires-recent-login') {
        toast({
          variant: "destructive",
          title: "Action Requires Recent Login",
          description: "Updating your email is a sensitive action and requires a recent login. Please log out and log back in to continue.",
          duration: 7000,
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
          duration: 7000,
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
