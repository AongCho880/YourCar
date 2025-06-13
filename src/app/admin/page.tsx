
"use client";

import { SignIn, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLoginPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/admin/dashboard');
    }
  }, [isSignedIn, isLoaded, router]);

  if (!isLoaded || isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Skeleton className="w-full max-w-sm h-96" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <SignIn path="/admin" routing="path" signUpUrl="/admin/sign-up" afterSignInUrl="/admin/dashboard" />
    </div>
  );
}
