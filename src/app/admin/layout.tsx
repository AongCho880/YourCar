"use client";

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Car, PlusCircle, LogOut, Home } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isAdmin, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace('/admin'); // Redirect to login if not admin and not loading
    }
  }, [isAdmin, loading, router]);

  if (loading || !isAdmin) {
    // Show a loader or minimal content while checking auth or if not admin
    return (
      <div className="flex flex-col min-h-screen">
        <header className="bg-primary text-primary-foreground p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold font-headline">Admin Panel</h1>
            <Skeleton className="h-8 w-24" />
          </div>
        </header>
        <main className="flex-grow container mx-auto p-4 md:p-8 flex items-center justify-center">
          {loading && <Skeleton className="w-full h-64 max-w-lg" />}
          {!loading && !isAdmin && pathname !== '/admin' && (
            <p>Redirecting to login...</p>
          )}
           {!loading && !isAdmin && pathname === '/admin' && (
             <div className="w-full">{children}</div> // Allow login page content
           )}
        </main>
      </div>
    );
  }

  // If admin is authenticated
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary text-primary-foreground p-4 shadow-md">
        <div className="container mx-auto flex flex-wrap justify-between items-center gap-4">
          <Link href="/admin/dashboard" className="text-xl font-bold font-headline hover:opacity-80 transition-opacity">Admin Panel</Link>
          <nav className="flex flex-wrap items-center gap-2">
            <Button variant={pathname === '/admin/dashboard' ? 'secondary' : 'ghost'} asChild size="sm">
              <Link href="/admin/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" />Dashboard</Link>
            </Button>
            <Button variant={pathname === '/admin/cars/new' ? 'secondary' : 'ghost'} asChild size="sm">
              <Link href="/admin/cars/new"><PlusCircle className="mr-2 h-4 w-4" />Add Car</Link>
            </Button>
            <Button variant="ghost" asChild size="sm">
              <Link href="/"><Home className="mr-2 h-4 w-4" />View Site</Link>
            </Button>
            <Button variant="ghost" onClick={() => { logout(); router.push('/'); }} size="sm">
              <LogOut className="mr-2 h-4 w-4" />Logout
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
