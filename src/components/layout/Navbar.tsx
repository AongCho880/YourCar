
"use client";

import Link from 'next/link';
import { Car, LogIn, LogOut, LayoutDashboard, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const { isAdmin, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    isAdmin && { href: '/admin/dashboard', label: 'Dashboard' },
    !isAdmin && { href: '/admin', label: 'Admin Login' },
  ].filter(Boolean) as { href: string; label: string }[];

  const NavLinkItem = ({ href, label }: { href: string; label: string }) => (
    <Button
      variant={pathname === href ? "secondary" : "ghost"}
      className={cn(
        pathname === href ? "bg-primary/20 text-primary hover:bg-primary/30" : "hover:bg-primary/10 hover:text-primary"
      )}
      asChild
      onClick={() => setIsMobileMenuOpen(false)}
    >
      <Link href={href}>{label}</Link>
    </Button>
  );

  return (
    <header className="bg-background/80 text-foreground shadow-lg backdrop-blur-lg sticky top-0 z-50 border-b border-border/30">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold hover:opacity-80 transition-opacity text-primary">
          <Car className="h-7 w-7" />
          <span className="font-headline">AutoList</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(link => <NavLinkItem key={link.href} {...link} />)}
          {isAdmin && !loading && (
            <Button variant="ghost" onClick={handleLogout} className="hover:bg-destructive/20 hover:text-destructive">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          )}
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] bg-background/90 backdrop-blur-lg text-foreground border-l border-border/30">
              <div className="flex flex-col gap-4 pt-8">
                {navLinks.map(link => <NavLinkItem key={link.href} {...link} />)}
                {isAdmin && !loading && (
                   <SheetClose asChild>
                    <Button variant="ghost" onClick={handleLogout} className="justify-start hover:bg-destructive/20 hover:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" /> Logout
                    </Button>
                   </SheetClose>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
