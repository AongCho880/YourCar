
"use client";

import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const { user, loading: authLoading } = useAuth(); // Changed from isAdmin to user
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/admin/dashboard'); // If logged in, redirect to dashboard
    }
  }, [user, authLoading, router]);

  // Show loading spinner if auth state is loading OR if user is already logged in (and redirecting)
  if (authLoading || (!authLoading && user)) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
         <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // If not loading and no user, show the login form
  return <LoginForm />;
}
