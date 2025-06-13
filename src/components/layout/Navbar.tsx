
"use client";

import Link from 'next/link';
import { Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useState, useEffect } from 'react'; // useEffect might not be needed if isClient is removed
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

// Simple SVG Logo - Grayscale
const YourCarLogo = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="h-7 w-7 text-foreground group-hover:text-muted-foreground transition-colors"
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
      fill="hsl(var(--foreground)/0.03)"
    />
    <path
      d="M8 8L16 16M16 16L24 8M16 16V24"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const NavbarLoadingSkeleton = () => (
  <header className="bg-card/70 text-card-foreground shadow-xl backdrop-blur-lg sticky top-0 z-50 border-b border-border/30">
    <div className="container mx-auto px-4 py-3 flex justify-between items-center">
      <Link href="/" className="group flex items-center gap-2 text-xl font-bold text-foreground hover:text-muted-foreground transition-colors">
        <YourCarLogo />
        <span className="font-headline">YourCar</span>
      </Link>
      {/* Desktop nav placeholder */}
      <nav className="hidden md:flex items-center gap-1">
        {/* Placeholder for a single nav item like "Home" */}
        <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 hover:bg-transparent hover:text-foreground"> {/* Mimic Button classes & hover style */}
          <div className="h-5 w-16 bg-muted rounded animate-pulse"></div> {/* Mimic text content for "Home" */}
        </div>
      </nav>
      {/* Mobile menu icon placeholder */}
      <div className="md:hidden">
        <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
      </div>
    </div>
  </header>
);


export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAdmin, logout, loading: authContextIsLoading } = useAuth();
  const pathname = usePathname();

  // If auth context is loading, show skeleton.
  // This ensures server and initial client render match.
  if (authContextIsLoading) {
    return <NavbarLoadingSkeleton />;
  }

  const navLinks = [{ href: '/', label: 'Home' }];

  const adminNavLinks = [
    { href: '/admin/dashboard', label: 'Dashboard' },
    { href: '/admin/cars/new', label: 'Add Car' },
    { href: '/admin/settings', label: 'Settings' },
  ];

  const NavLinkItem = ({ href, label, onClick }: { href: string; label: string, onClick?: () => void }) => {
    const isActive = pathname === href;
    return (
      <SheetClose asChild>
        <Button
          variant="ghost"
          asChild={!onClick}
          className="w-full justify-start relative group text-left hover:bg-transparent hover:text-foreground"
          onClick={() => {
            if (onClick) onClick();
            setIsMobileMenuOpen(false);
          }}
        >
          {onClick ? (
            <>
              {label}
              <span className={cn(
                "absolute bottom-1.5 left-4 right-4 block h-[1px] bg-primary transform transition-transform duration-300 ease-out origin-left",
                isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
              )}></span>
            </>
          ) : (
            <Link href={href} className="block w-full">
              {label}
              <span className={cn(
                "absolute bottom-1.5 left-4 right-4 block h-[1px] bg-primary transform transition-transform duration-300 ease-out origin-left",
                isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
              )}></span>
            </Link>
          )}
        </Button>
      </SheetClose>
    );
  };

  return (
    <header className="bg-card/70 text-card-foreground shadow-xl backdrop-blur-lg sticky top-0 z-50 border-b border-border/30">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="group flex items-center gap-2 text-xl font-bold text-foreground hover:text-muted-foreground transition-colors">
          <YourCarLogo />
          <span className="font-headline">YourCar</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(link => {
            const isActive = pathname === link.href;
            return (
              <Button variant="ghost" asChild key={link.href} className="hover:bg-transparent hover:text-foreground">
                <Link href={link.href} className="relative group">
                  {link.label}
                  <span className={cn(
                    "absolute bottom-2 left-0 block h-[2px] w-full origin-left transform bg-primary transition-transform duration-300 ease-out",
                    isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  )}></span>
                </Link>
              </Button>
            );
          })}
          {isAdmin && adminNavLinks.map(link => {
             const isActive = pathname === link.href;
            return (
              <Button variant="ghost" asChild key={link.href} className="hover:bg-transparent hover:text-foreground">
                <Link href={link.href} className="relative group">
                  {link.label}
                  <span className={cn(
                    "absolute bottom-2 left-0 block h-[2px] w-full origin-left transform bg-primary transition-transform duration-300 ease-out",
                    isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  )}></span>
                </Link>
              </Button>
            );
          })}
          {isAdmin && (
            <Button variant="outline" size="sm" onClick={logout} className="ml-2 hover:bg-transparent hover:text-foreground">
              <LogOut className="mr-2 h-4 w-4" />Logout
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
            <SheetContent side="right" className="w-[250px] bg-card/95 backdrop-blur-lg text-card-foreground border-l border-border/30 p-0">
              <SheetHeader className="text-left border-b border-border/30 p-4 mb-2">
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 p-2">
                {navLinks.map(link => <NavLinkItem key={`mobile-${link.href}`} {...link} />)}
                {isAdmin && adminNavLinks.map(link => <NavLinkItem key={`mobile-admin-${link.href}`} {...link} />)}
                {isAdmin && (
                  <NavLinkItem href="#" label="Logout" onClick={logout} />
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
