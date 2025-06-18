
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Review } from '@/types';
import { db } from '@/lib/firebaseConfig';
import { collection, getDocs, query, orderBy, doc, updateDoc, Timestamp, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Star, MessageSquare, CheckSquare, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      if (!db) throw new Error("Firestore not initialized");
      const reviewsCollection = collection(db, 'reviews');
      const q = query(reviewsCollection, orderBy('submittedAt', 'desc'));
      const reviewSnapshot = await getDocs(q);
      const reviewList = reviewSnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          submittedAt: data.submittedAt instanceof Timestamp ? data.submittedAt.toMillis() : data.submittedAt || Date.now(),
        } as Review;
      });
      setReviews(reviewList);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({ variant: "destructive", title: "Error Loading Reviews", description: errorMessage });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const toggleTestimonialStatus = async (reviewId: string, currentStatus: boolean) => {
    if (!db) {
        toast({ variant: "destructive", title: "Database Error", description: "Firestore not initialized."});
        return;
    }
    setUpdatingId(reviewId);
    try {
        const reviewRef = doc(db, "reviews", reviewId);
        await updateDoc(reviewRef, {
            isTestimonial: !currentStatus,
            updatedAt: serverTimestamp() 
        });
        toast({ title: "Success", description: `Review status updated to ${!currentStatus ? "Testimonial" : "Regular"}.` });
        // Optimistically update UI or refetch
        setReviews(prevReviews => prevReviews.map(r => r.id === reviewId ? {...r, isTestimonial: !currentStatus} : r));
    } catch (error) {
        console.error("Error updating review status:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({ variant: "destructive", title: "Update Failed", description: errorMessage });
    } finally {
        setUpdatingId(null);
    }
  };

  const StarRatingDisplay = ({ rating }: { rating: number }) => (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "w-4 h-4",
            rating >= star ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
          )}
        />
      ))}
    </div>
  );

  if (loading && reviews.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <div className="border rounded-lg shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Submitted At</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="w-[100px]">Rating</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead className="w-[150px]">Testimonial</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-1/2" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Customer Reviews</h1>
      {reviews.length === 0 && !loading ? (
         <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
          <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Reviews Yet</h2>
          <p className="text-muted-foreground">Encourage your customers to share their experiences!</p>
        </div>
      ) : (
        <div className="border rounded-lg shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card shadow-sm">
              <TableRow>
                <TableHead className="w-[180px]">Submitted At</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="w-[100px]">Rating</TableHead>
                <TableHead className="min-w-[300px]">Comment</TableHead>
                <TableHead className="text-center w-[150px]">Testimonial</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>{format(new Date(review.submittedAt), 'MMM d, yyyy HH:mm')}</TableCell>
                  <TableCell>{review.name}</TableCell>
                  <TableCell><StarRatingDisplay rating={review.rating} /></TableCell>
                  <TableCell className="max-w-md truncate" title={review.comment}>{review.comment}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center space-x-2">
                        {updatingId === review.id ? <Loader2 className="h-5 w-5 animate-spin" /> :
                            <Switch
                            id={`testimonial-${review.id}`}
                            checked={review.isTestimonial}
                            onCheckedChange={() => toggleTestimonialStatus(review.id, review.isTestimonial)}
                            disabled={updatingId === review.id}
                            aria-label="Mark as testimonial"
                            />
                        }
                        <Label htmlFor={`testimonial-${review.id}`} className="sr-only">
                            {review.isTestimonial ? "Mark as regular review" : "Mark as testimonial"}
                        </Label>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
