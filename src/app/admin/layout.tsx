
"use client";

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Loader2, MessageSquareText, ShieldAlert } from 'lucide-react'; // Added icons
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button'; // Added Button for styling links
import { cn } from '@/lib/utils'; // Added cn for conditional styling

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!authLoading && !user && pathname !== '/admin') {
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

  if (!user && pathname !== '/admin') {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-lg">Redirecting to login...</p>
        </div>
    );
  }
  
  if (!user && pathname === '/admin') {
     return <div className="flex-grow container mx-auto p-4 md:p-8 flex items-center justify-center">{children}</div>;
  }

  const adminNavLinks = [
    { href: '/admin/reviews', label: 'Manage Reviews', icon: MessageSquareText },
    { href: '/admin/complaints', label: 'View Complaints', icon: ShieldAlert },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-card text-card-foreground p-4 shadow-xl sticky top-0 z-40">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/admin/dashboard" className="text-xl font-bold font-headline text-primary hover:text-primary/80 transition-opacity">Admin Panel</Link>
          <nav className="flex items-center gap-2">
            {adminNavLinks.map(link => {
              const isActive = pathname === link.href || (link.href !== "/admin/dashboard" && pathname.startsWith(link.href));
              return (
                <Button
                  key={link.href}
                  variant="ghost"
                  size="sm"
                  asChild
                  className={cn(
                    "hover:bg-muted/50 hover:text-primary",
                    isActive && "bg-muted text-primary font-semibold"
                  )}
                >
                  <Link href={link.href} className="flex items-center">
                    <link.icon className="mr-1.5 h-4 w-4" />
                    {link.label}
                  </Link>
                </Button>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="flex-grow container mx-auto my-4 bg-card text-card-foreground rounded-lg shadow-xl p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
