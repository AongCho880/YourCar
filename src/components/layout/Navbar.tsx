
"use client";

import Link from 'next/link';
import { Menu, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { useState, useEffect, useMemo } from 'react';
import { SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';

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


export default function Navbar() {
  const { isLoaded, isSignedIn } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [clientLoaded, setClientLoaded] = useState(false); // To ensure client-side rendering for Clerk status

  useEffect(() => {
    setClientLoaded(true);
  }, []);

  const navLinks = useMemo(() => {
    const links = [{ href: '/', label: 'Home' }];
    if (clientLoaded && isSignedIn && isLoaded) {
      links.push({ href: '/admin/dashboard', label: 'Dashboard' });
    }
    return links;
  }, [clientLoaded, isSignedIn, isLoaded]);

  const NavLinkItem = ({ href, label }: { href: string; label: string }) => (
    <Button
      variant="ghost" // Using ghost for nav links, can be adjusted
      asChild
      onClick={() => setIsMobileMenuOpen(false)}
    >
      <Link href={href}>{label}</Link>
    </Button>
  );

  return (
    <header className="bg-card/70 text-card-foreground shadow-xl backdrop-blur-lg sticky top-0 z-50 border-b border-border/30">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="group flex items-center gap-2 text-xl font-bold text-foreground hover:text-muted-foreground transition-colors">
          <YourCarLogo />
          <span className="font-headline">YourCar</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(link => <NavLinkItem key={link.href} {...link} />)}
          {clientLoaded && isLoaded && (
            <>
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
              <SignedOut>
                <Button variant="ghost" asChild>
                  <Link href="/admin"><LogIn className="mr-2 h-4 w-4" />Admin Login</Link>
                </Button>
              </SignedOut>
            </>
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
                 {clientLoaded && isLoaded && (
                  <>
                    <SignedIn>
                       <SheetClose asChild>
                          <div className="px-2 py-1.5"> {/* Added padding for UserButton consistency */}
                            <UserButton afterSignOutUrl="/" />
                          </div>
                       </SheetClose>
                    </SignedIn>
                    <SignedOut>
                      <SheetClose asChild>
                        <Button variant="ghost" asChild className="justify-start">
                            <Link href="/admin"><LogIn className="mr-2 h-4 w-4" />Admin Login</Link>
                        </Button>
                      </SheetClose>
                    </SignedOut>
                  </>
                 )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
