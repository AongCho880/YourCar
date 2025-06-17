
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
import { Loader2, Send } from 'lucide-react';

const complaintFormSchema = z.object({
  name: z.string().optional(),
  email: z.string().email({ message: "Please enter a valid email." }).optional().or(z.literal("")),
  details: z.string().min(20, { message: "Complaint details must be at least 20 characters long." }).max(2000, { message: "Complaint details cannot exceed 2000 characters." }),
});

type ComplaintFormValues = z.infer<typeof complaintFormSchema>;

export default function ComplaintPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ComplaintFormValues>({
    resolver: zodResolver(complaintFormSchema),
    defaultValues: {
      name: "",
      email: "",
      details: "",
    },
  });

  const onSubmit = async (data: ComplaintFormValues) => {
    setIsSubmitting(true);
    try {
      if (!db) {
        throw new Error("Database service is not available.");
      }
      await addDoc(collection(db, "complaints"), {
        ...data,
        submittedAt: serverTimestamp(),
        isResolved: false,
      });
      toast({
        title: "Complaint Submitted",
        description: "Thank you for your feedback. We will look into it shortly.",
      });
      form.reset();
    } catch (error) {
      console.error("Error submitting complaint:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: `Could not submit your complaint: ${errorMessage}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl font-bold font-headline text-primary">Submit a Complaint</CardTitle>
          <CardDescription>
            We are sorry to hear you had an issue. Please provide details below.
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
                    <FormLabel>Your Name (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your name" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Email (Optional)</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter your email for follow-up" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormDescription>We'll only use this to contact you about your complaint.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Complaint Details</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please describe your issue in detail..."
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
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Submit Complaint
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
