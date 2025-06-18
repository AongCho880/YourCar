
"use client";

import Link from 'next/link';
import { Menu, LogOut, CarIcon as SiteLogoIcon, LayoutDashboard, MessageSquareText, ShieldAlert, Settings, User, FilePlus2, HomeIcon } from 'lucide-react'; // Added HomeIcon
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

  const homeLink = { href: '/', label: 'Home', icon: HomeIcon }; // Changed SiteLogoIcon to HomeIcon for clarity

  const customerInteractiveLinks = [
    { href: '/contact/review', label: 'Write a Review', icon: MessageSquareText },
    { href: '/contact/complaint', label: 'Submit Complaint', icon: ShieldAlert },
  ];

  // "Manage Reviews" and "View Complaints" are now in AdminLayout header
  // "Add New Car" functionality is primarily on the dashboard
  const adminDashboardLinks = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    // { href: '/admin/cars/new', label: 'Add Car', icon: FilePlus2 }, // Removed "Add New Car"
    // { href: '/admin/reviews', label: 'Reviews', icon: MessageSquareText }, // Moved
    // { href: '/admin/complaints', label: 'Complaints', icon: ShieldAlert }, // Moved
    { href: '/admin/settings', label: 'Site Settings', icon: Settings },
    { href: '/admin/account', label: 'My Account', icon: User },
  ];


  const NavLinkItem = ({ href, label, icon: Icon, onClick, isLogoutButton = false }: { href: string; label: string, icon?: React.ElementType, onClick?: () => void, isLogoutButton?: boolean }) => {
    const isActive = pathname === href;
    
    const buttonContent = (
      <>
        {Icon && <Icon className="mr-2 h-4 w-4 shrink-0" />}
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
               <LogOut className="mr-2 h-4 w-4" />{label} 
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
            <Link href={href} className="block w-full pl-0">
              {buttonContent}
            </Link>
          )}
        </Button>
      </SheetClose>
    );
  };

  const DesktopNavLink = ({ href, label, icon: Icon }: { href: string; label: string, icon?: React.ElementType }) => {
    const isActive = pathname === href || (href !== "/" && pathname.startsWith(href)); // More robust active check
    return (
      <Button
        variant="ghost"
        size="default" // Reverted to default size for desktop navlinks
        asChild
        className={cn(
          "hover:bg-transparent hover:text-foreground active:bg-transparent active:text-foreground relative group px-3 py-2 h-auto",
           isActive && "text-primary" // Style active link text
        )}
      >
        <Link href={href} className="flex items-center">
          {label}
          <span className={cn(
            "absolute bottom-1 left-0 right-0 mx-auto block h-[1.5px] w-[80%] origin-center transform bg-primary transition-transform duration-300 ease-out",
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

        <nav className="hidden md:flex items-center gap-0.5">
          <DesktopNavLink href={homeLink.href} label={homeLink.label} icon={homeLink.icon} />
          
          {user ? (
            adminDashboardLinks.map(link => <DesktopNavLink key={link.href} href={link.href} label={link.label} icon={link.icon} />)
          ) : (
            customerInteractiveLinks.map(link => <DesktopNavLink key={link.href} href={link.href} label={link.label} icon={link.icon} />)
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
