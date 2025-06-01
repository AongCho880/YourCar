
"use client";

import Link from 'next/link';
import { LogIn, LogOut, LayoutDashboard, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { useState } from 'react';
import { cn } from '@/lib/utils';

// Simple SVG Logo
const YourCarLogo = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="h-7 w-7 text-primary group-hover:text-primary/80 transition-colors"
    aria-hidden="true"
  >
    <rect
      x="4"
      y="4"
      width="24"
      height="24"
      rx="4"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
    <path d="M16 8L12 14H20L16 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 20L16 14M16 14L20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 24H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);


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
    // Removed: !isAdmin && !loading && { href: '/admin', label: 'Admin Login' },
  ].filter(Boolean) as { href: string; label: string }[];

  const NavLinkItem = ({ href, label }: { href: string; label: string }) => (
    <Button
      variant={pathname === href ? "secondary" : "ghost"}
      className={cn(
        "text-card-foreground hover:bg-accent hover:text-accent-foreground",
        pathname === href && "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
      )}
      asChild
      onClick={() => setIsMobileMenuOpen(false)}
    >
      <Link href={href}>{label}</Link>
    </Button>
  );

  return (
    <header className="bg-card/70 text-card-foreground shadow-xl backdrop-blur-lg sticky top-0 z-50 border-b border-border/30">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="group flex items-center gap-2 text-xl font-bold text-primary hover:text-primary/80 transition-colors">
          <YourCarLogo />
          <span className="font-headline">YourCar</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(link => <NavLinkItem key={link.href} {...link} />)}
          {isAdmin && !loading && (
            <Button variant="ghost" onClick={handleLogout} className="text-card-foreground hover:bg-destructive/20 hover:text-destructive">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          )}
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-card-foreground hover:bg-accent hover:text-accent-foreground">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] bg-card/95 backdrop-blur-lg text-card-foreground border-l border-border/30">
              <div className="flex flex-col gap-4 pt-8">
                {navLinks.map(link => <NavLinkItem key={link.href} {...link} />)}
                {isAdmin && !loading && (
                   <SheetClose asChild>
                    <Button variant="ghost" onClick={handleLogout} className="justify-start text-card-foreground hover:bg-destructive/20 hover:text-destructive">
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
