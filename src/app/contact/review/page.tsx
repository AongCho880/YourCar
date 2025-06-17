
"use client";

import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Star, Loader2, MessageSquarePlus } from 'lucide-react';
import { cn } from '@/lib/utils';

const reviewFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(50, { message: "Name cannot exceed 50 characters." }),
  rating: z.number().min(1, { message: "Please select a rating." }).max(5),
  comment: z.string().min(10, { message: "Review must be at least 10 characters long." }).max(1500, { message: "Review cannot exceed 1500 characters." }),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

export default function ReviewPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      name: "",
      rating: 0,
      comment: "",
    },
  });

  const currentRating = form.watch("rating");

  const onSubmit = async (data: ReviewFormValues) => {
    setIsSubmitting(true);
    try {
      if (!db) {
        throw new Error("Database service is not available.");
      }
      await addDoc(collection(db, "reviews"), {
        ...data,
        submittedAt: serverTimestamp(),
        isTestimonial: false, 
      });
      toast({
        title: "Review Submitted",
        description: "Thank you for your valuable feedback!",
      });
      form.reset();
    } catch (error) {
      console.error("Error submitting review:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: `Could not submit your review: ${errorMessage}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl font-bold font-headline text-primary">Write a Review</CardTitle>
          <CardDescription>
            Share your experience with us. Your feedback helps us improve.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your name" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Rating</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              "w-7 h-7 cursor-pointer transition-colors",
                              (hoverRating || currentRating) >= star
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-muted-foreground"
                            )}
                            onClick={() => form.setValue("rating", star, { shouldValidate: true })}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                          />
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Review</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about your experience..."
                        {...field}
                        rows={6}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquarePlus className="mr-2 h-4 w-4" />}
                Submit Review
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
