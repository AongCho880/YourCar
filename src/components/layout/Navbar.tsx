
"use client";

import Link from 'next/link';
import { Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState, useEffect } from 'react';
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
      <nav className="hidden md:flex items-center gap-1">
        <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 hover:bg-transparent hover:text-foreground active:bg-transparent active:text-foreground">
          <div className="h-5 w-16 bg-muted rounded animate-pulse"></div>
        </div>
      </nav>
      <div className="md:hidden">
        <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
      </div>
    </div>
  </header>
);


export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout, loading: authContextIsLoading } = useAuth();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || authContextIsLoading) {
    return <NavbarLoadingSkeleton />;
  }

  const homeLink = { href: '/', label: 'Home' };

  const customerInteractiveLinks = [
    { href: '/contact/review', label: 'Write a Review' },
    { href: '/contact/complaint', label: 'Submit Complaint' },
  ];

  const adminDashboardLinks = [
    { href: '/admin/dashboard', label: 'Dashboard' },
    { href: '/admin/cars/new', label: 'Add Car' },
    { href: '/admin/reviews', label: 'Reviews' }, // Shortened
    { href: '/admin/complaints', label: 'Complaints' }, // Shortened
    { href: '/admin/settings', label: 'Settings' }, // Shortened
    { href: '/admin/account', label: 'Account' }, // Shortened
  ];


  const NavLinkItem = ({ href, label, onClick, isLogoutButton = false }: { href: string; label: string, onClick?: () => void, isLogoutButton?: boolean }) => {
    const isActive = pathname === href;
    
    const buttonContent = (
      <>
        {label}
        {!isLogoutButton && (
          <span className={cn(
            "absolute bottom-1.5 left-4 right-4 block h-[1px] bg-primary transform transition-transform duration-300 ease-out origin-left",
            isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
          )}></span>
        )}
      </>
    );

    if (isLogoutButton) {
      return (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start relative group text-left hover:bg-transparent hover:text-foreground active:bg-transparent active:text-foreground"
            >
               <LogOut className="mr-2 h-4 w-4" />{buttonContent}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to log out?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => {
                if (onClick) onClick();
                setIsMobileMenuOpen(false); 
              }} className="bg-destructive hover:bg-destructive/90">
                Logout
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    }

    return (
      <SheetClose asChild>
        <Button
          variant="ghost"
          asChild={!onClick}
          className="w-full justify-start relative group text-left hover:bg-transparent hover:text-foreground active:bg-transparent active:text-foreground"
          onClick={() => {
            if (onClick) onClick();
            setIsMobileMenuOpen(false); 
          }}
        >
          {onClick ? (
            buttonContent
          ) : (
            <Link href={href} className="block w-full">
              {buttonContent}
            </Link>
          )}
        </Button>
      </SheetClose>
    );
  };

  const DesktopNavLink = ({ href, label, size = "default" }: { href: string; label: string; size?: "default" | "sm" }) => {
    const isActive = pathname === href;
    return (
      <Button
        variant="ghost"
        size={size}
        asChild
        className="hover:bg-transparent hover:text-foreground active:bg-transparent active:text-foreground relative group"
      >
        <Link href={href}>
          {label}
          <span className={cn(
            "absolute left-0 right-0 mx-auto block h-[1.5px] w-[80%] origin-center transform bg-primary transition-transform duration-300 ease-out",
            size === "sm" ? "bottom-1" : "bottom-1.5", 
            isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
          )}></span>
        </Link>
      </Button>
    );
  };

  return (
    <header className="bg-card/70 text-card-foreground shadow-xl backdrop-blur-lg sticky top-0 z-50 border-b border-border/30">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="group flex items-center gap-2 text-xl font-bold text-foreground hover:text-muted-foreground transition-colors">
          <YourCarLogo />
          <span className="font-headline">YourCar</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <DesktopNavLink href={homeLink.href} label={homeLink.label} size="default"/>
          
          {user ? (
            adminDashboardLinks.map(link => <DesktopNavLink key={link.href} href={link.href} label={link.label} size="sm" />)
          ) : (
            customerInteractiveLinks.map(link => <DesktopNavLink key={link.href} href={link.href} label={link.label} size="default" />)
          )}

          {user && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="ml-2 hover:bg-transparent hover:text-foreground active:bg-transparent active:text-foreground">
                  <LogOut className="mr-2 h-4 w-4" />Logout
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to log out?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={logout} className="bg-destructive hover:bg-destructive/90">
                    Logout
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </nav>

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
                <NavLinkItem key={`mobile-${homeLink.href}`} {...homeLink} />

                {user ? (
                  adminDashboardLinks.map(link => <NavLinkItem key={`mobile-admin-${link.href}`} {...link} />)
                ) : (
                  customerInteractiveLinks.map(link => <NavLinkItem key={`mobile-customer-${link.href}`} {...link} />)
                )}
                
                {user && (
                  <NavLinkItem href="#" label="Logout" onClick={logout} isLogoutButton={true} />
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

