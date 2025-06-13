
"use client";

import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAdmin) {
      router.replace('/admin/dashboard');
    }
  }, [isAdmin, loading, router]);

  if (loading || (!loading && isAdmin)) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
         <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return <LoginForm />;
}
