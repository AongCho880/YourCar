"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import TestimonialsSection from '@/components/TestimonialsSection';
import { Sparkles, Car, ArrowRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';

const YourCarLogo = () => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="h-16 w-16 text-primary drop-shadow-lg"
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

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col justify-center items-center px-4 py-24 text-center bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-center items-center mb-6 gap-3">
            <YourCarLogo />
            <span className="text-3xl md:text-4xl font-extrabold font-headline text-primary tracking-tight">YourCar</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold font-headline mb-4 text-foreground leading-tight">
            Find Your Next Car, Effortlessly
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            Discover, compare, and connect with the best car deals. Simple. Fast. Trusted.
          </p>
          <Button asChild size="lg" className="px-8 py-4 text-lg font-semibold shadow-lg">
            <Link href="/homepage">
              Browse Cars <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-muted/40">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold font-headline text-center mb-10 text-primary flex items-center justify-center">
            <Sparkles className="w-7 h-7 mr-2 text-primary/80" /> How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="mb-4 flex justify-center">
                <Car className="h-10 w-10 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Browse</h3>
              <p className="text-muted-foreground">Explore a curated selection of cars from trusted sellers.</p>
            </div>
            <div>
              <div className="mb-4 flex justify-center">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Compare</h3>
              <p className="text-muted-foreground">Easily compare features, prices, and reviews to find your perfect match.</p>
            </div>
            <div>
              <div className="mb-4 flex justify-center">
                <ArrowRight className="h-10 w-10 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Connect</h3>
              <p className="text-muted-foreground">Contact sellers directly and drive away with confidence.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Testimonials */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          <TestimonialsSection />
        </div>
      </section>
    </main>
  );
}
