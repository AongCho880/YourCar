
"use client";

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react'; 
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button'; 
import { cn } from '@/lib/utils'; 

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!authLoading && !user && pathname !== '/admin' && pathname !== '/admin/forgot-password') { // Allow forgot-password
      router.replace('/admin');
    }
  }, [user, authLoading, router, pathname]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading admin panel...</p>
      </div>
    );
  }

  // Allow access to /admin (login) and /admin/forgot-password even if not logged in
  if (!user && pathname !== '/admin' && pathname !== '/admin/forgot-password') {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-lg">Redirecting to login...</p>
        </div>
    );
  }
  
  if (!user && (pathname === '/admin' || pathname === '/admin/forgot-password')) {
     return <div className="flex-grow container mx-auto p-4 md:p-8 flex items-center justify-center">{children}</div>;
  }


  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-card text-card-foreground p-4 shadow-xl sticky top-0 z-40">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/admin/dashboard" className="text-xl font-bold font-headline text-primary hover:text-primary/80 transition-opacity">Admin Panel</Link>
          {/* Links moved to main Navbar */}
          <nav className="flex items-center gap-2">
             {/* Placeholder for any future admin header specific nav items if needed */}
          </nav>
        </div>
      </header>
      <main className="flex-grow container mx-auto my-4 bg-card text-card-foreground rounded-lg shadow-xl p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
