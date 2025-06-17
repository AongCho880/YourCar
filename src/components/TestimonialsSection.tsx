
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Review } from '@/types';
import { db } from '@/lib/firebaseConfig';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import TestimonialCard from './TestimonialCard';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquareHeart, Sparkles } from 'lucide-react';

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    try {
      if (!db) throw new Error("Firestore not initialized");
      const reviewsCollection = collection(db, 'reviews');
      // Fetch up to 6 testimonials, ordered by submission date
      const q = query(
        reviewsCollection, 
        where('isTestimonial', '==', true), 
        orderBy('submittedAt', 'desc'),
        limit(6) 
      );
      const testimonialSnapshot = await getDocs(q);
      const testimonialList = testimonialSnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          submittedAt: typeof data.submittedAt?.toMillis === 'function' ? data.submittedAt.toMillis() : data.submittedAt || Date.now(),
        } as Review;
      });
      setTestimonials(testimonialList);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      // Silently fail for homepage display, or show a subtle message. Avoid disruptive toasts.
      // toast({ variant: "destructive", title: "Could not load testimonials", description: errorMessage });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  if (loading) {
    return (
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <Skeleton className="h-10 w-1/3 mx-auto mb-3" />
            <Skeleton className="h-5 w-1/2 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return null; // Don't show the section if there are no testimonials
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-primary mb-3 flex items-center justify-center">
            <Sparkles className="w-8 h-8 mr-3 text-primary/80" />
            What Our Customers Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hear directly from those who've found their perfect ride with us.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} review={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}

const CardSkeleton = () => (
  <div className="p-6 border rounded-lg bg-card shadow-lg">
    <Skeleton className="h-20 w-full mb-4" /> {/* Blockquote */}
    <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-24" /> {/* Stars */}
        <Skeleton className="h-4 w-16" /> {/* Time ago */}
    </div>
    <div className="border-t pt-4 flex items-center space-x-3">
        <Skeleton className="h-10 w-10 rounded-full" /> {/* Avatar */}
        <div>
            <Skeleton className="h-5 w-28 mb-1" /> {/* Name */}
            <Skeleton className="h-4 w-36" /> {/* Car */}
        </div>
    </div>
  </div>
);
