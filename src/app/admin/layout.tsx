
"use client";

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, LogOut, Loader2 } from 'lucide-react'; // Removed LayoutDashboard, PlusCircle, Settings
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isAdmin, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAdmin && pathname !== '/admin') {
      router.replace('/admin');
    }
  }, [isAdmin, loading, router, pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading admin panel...</p>
      </div>
    );
  }

  if (!isAdmin && pathname !== '/admin') {
    // This case should ideally be caught by the useEffect redirect,
    // but as a fallback, show a loading/redirecting message.
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-lg">Redirecting to login...</p>
        </div>
    );
  }
  
  // If it's the /admin login page and the user is not an admin, render children (which is the login form)
  if (!isAdmin && pathname === '/admin') {
     return <div className="flex-grow container mx-auto p-4 md:p-8 flex items-center justify-center">{children}</div>;
  }

  // If user is admin, show the admin layout
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-card text-card-foreground p-4 shadow-xl">
        <div className="container mx-auto flex flex-wrap justify-between items-center gap-4">
          <Link href="/admin/dashboard" className="text-xl font-bold font-headline text-primary hover:text-primary/80 transition-opacity">Admin Panel</Link>
          <nav className="flex flex-wrap items-center gap-2">
            {/* Admin navigation links are now in the main Navbar when admin is logged in */}
            <Button variant="ghost" asChild size="sm">
              <Link href="/"><Home className="mr-2 h-4 w-4" />View Site</Link>
            </Button>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />Logout
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-grow container mx-auto my-4 bg-card text-card-foreground rounded-lg shadow-xl p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
