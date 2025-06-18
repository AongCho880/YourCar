
"use client";

import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Mail, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';


const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const { sendAdminPasswordResetEmail, user, loading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });
  
  useEffect(() => {
    // Redirect if user is already logged in and auth state is no longer loading
    if (!authLoading && user) {
      router.replace('/admin/dashboard');
    }
  }, [user, authLoading, router]);

  // Handle initial loading of authentication state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
         <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Handle case where user is logged in and about to be redirected
  // This prevents the form from flashing briefly for an authenticated user.
  if (user) { // authLoading is false at this point
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
         <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg">Redirecting...</p>
        </div>
      </div>
    );
  }

  // If authLoading is false and user is null, show the form
  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsSubmitting(true);
    const success = await sendAdminPasswordResetEmail(data.email);
    setIsSubmitting(false);
    if (success) {
      form.reset();
      // Toast is handled by AuthContext
      // Optionally, redirect back to login or show a persistent success message on this page
      // router.push('/admin'); 
    }
    // No specific action on failure here as AuthContext handles toast
  };

  return (
    <div className="flex items-center justify-center min-h-screen -mt-16"> {/* Adjusted for admin layout */}
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold font-headline text-primary">Reset Your Password</CardTitle>
          <CardDescription>
            Enter your email address below, and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="admin@example.com" 
                        {...field} 
                        disabled={isSubmitting} 
                        autoComplete="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                Send Password Reset Link
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="pt-6">
            <Button variant="outline" className="w-full" asChild>
                <Link href="/admin">
                    <LogIn className="mr-2 h-4 w-4" /> Back to Login
                </Link>
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
