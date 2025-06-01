"use client";

import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLoginPage() {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAdmin) {
      router.replace('/admin/dashboard');
    }
  }, [isAdmin, loading, router]);

  if (loading || isAdmin) {
    // Show a loader or empty screen while redirecting or checking auth
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Skeleton className="w-full max-w-sm h-96" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <LoginForm />
    </div>
  );
}
