
"use client";

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth(); // Changed from isAdmin to user
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!authLoading && !user && pathname !== '/admin') {
      router.replace('/admin'); // Redirect to login if not authenticated and not already on login page
    }
    // If user is authenticated and on the login page, redirect to dashboard
    // This is now handled by the AdminLoginPage itself.
  }, [user, authLoading, router, pathname]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading admin panel...</p>
      </div>
    );
  }

  // If not logged in and trying to access a protected admin page (not /admin itself)
  if (!user && pathname !== '/admin') {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-lg">Redirecting to login...</p>
        </div>
    );
  }
  
  // If not logged in and on the /admin page (login page), render children (which is LoginForm)
  if (!user && pathname === '/admin') {
     return <div className="flex-grow container mx-auto p-4 md:p-8 flex items-center justify-center">{children}</div>;
  }

  // If logged in, render the admin layout
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-card text-card-foreground p-4 shadow-xl">
        <div className="container mx-auto flex justify-center items-center gap-4">
          <Link href="/admin/dashboard" className="text-xl font-bold font-headline text-primary hover:text-primary/80 transition-opacity">Admin Panel</Link>
        </div>
      </header>
      <main className="flex-grow container mx-auto my-4 bg-card text-card-foreground rounded-lg shadow-xl p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
