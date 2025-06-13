
"use client";

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, PlusCircle, Home, Settings, User, UserCircle } from 'lucide-react';
import { UserButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col min-h-screen">
      <SignedIn>
        <header className="bg-card text-card-foreground p-4 shadow-xl">
          <div className="container mx-auto flex flex-wrap justify-between items-center gap-4">
            <Link href="/admin/dashboard" className="text-xl font-bold font-headline text-primary hover:text-primary/80 transition-opacity">Admin Panel</Link>
            <nav className="flex flex-wrap items-center gap-2">
              <Button variant={pathname === '/admin/dashboard' ? 'secondary' : 'ghost'} asChild size="sm">
                <Link href="/admin/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" />Dashboard</Link>
              </Button>
              <Button variant={pathname === '/admin/cars/new' ? 'secondary' : 'ghost'} asChild size="sm">
                <Link href="/admin/cars/new"><PlusCircle className="mr-2 h-4 w-4" />Add Car</Link>
              </Button>
              <Button variant={pathname === '/admin/settings' ? 'secondary' : 'ghost'} asChild size="sm">
                <Link href="/admin/settings"><Settings className="mr-2 h-4 w-4" />Contact Settings</Link>
              </Button>
               <Button variant={pathname === '/admin/account' ? 'secondary' : 'ghost'} asChild size="sm">
                <Link href="/admin/account"><UserCircle className="mr-2 h-4 w-4" />Account</Link>
              </Button>
              <Button variant="ghost" asChild size="sm">
                <Link href="/"><Home className="mr-2 h-4 w-4" />View Site</Link>
              </Button>
              <UserButton afterSignOutUrl="/" />
            </nav>
          </div>
        </header>
        <main className="flex-grow container mx-auto my-4 bg-card text-card-foreground rounded-lg shadow-xl p-4 md:p-8">
          {children}
        </main>
      </SignedIn>
      <SignedOut>
        {/* This content is typically shown on the /admin page which will render Clerk's <SignIn /> */}
        {/* If a user tries to access a protected admin route while signed out, middleware redirects them to sign-in */}
        <div className="flex-grow container mx-auto p-4 md:p-8 flex items-center justify-center">
          {children} {/* This will render the <SignIn /> component from /admin/page.tsx */}
        </div>
      </SignedOut>
    </div>
  );
}
