
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mail, KeyRound, Loader2, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function AdminAccountPage() {
  const { user, updateAdminEmail, updateAdminPassword, sendAdminEmailVerification, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [newEmail, setNewEmail] = useState('');
  const [currentPasswordForEmailChange, setCurrentPasswordForEmailChange] = useState(''); // May not be needed depending on Firebase re-auth flow
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);

  useEffect(() => {
    if (user && user.email) {
      // Optionally prefill newEmail if you want, or leave it for user to type
      // setNewEmail(user.email); 
    }
  }, [user]);

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) {
      toast({ variant: "destructive", title: "Error", description: "New email cannot be empty." });
      return;
    }
    // Firebase's verifyBeforeUpdateEmail doesn't require current password by default
    // but reauthentication might be needed for sensitive operations if sessions are short.
    // For simplicity, we'll directly call it.
    setIsUpdatingEmail(true);
    await updateAdminEmail(newEmail);
    setIsUpdatingEmail(false);
    setNewEmail(''); // Clear field after attempt
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      toast({ variant: "destructive", title: "Error", description: "New password cannot be empty." });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast({ variant: "destructive", title: "Error", description: "Passwords do not match." });
      return;
    }
    setIsUpdatingPassword(true);
    const success = await updateAdminPassword(newPassword);
    setIsUpdatingPassword(false);
    if (success) {
      setNewPassword('');
      setConfirmNewPassword('');
    }
  };

  const handleSendVerification = async () => {
    setIsSendingVerification(true);
    await sendAdminEmailVerification();
    setIsSendingVerification(false);
  };
  
  if (authLoading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-8 w-1/3" /> 
            <Card>
                <CardHeader><Skeleton className="h-7 w-1/2" /></CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-5 w-1/4" /> 
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-9 w-36" />
                </CardContent>
            </Card>
             <Card>
                <CardHeader><Skeleton className="h-7 w-1/2" /></CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-5 w-1/4" /> 
                    <Skeleton className="h-10 w-full" />
                     <Skeleton className="h-5 w-1/4 mt-2" /> 
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-9 w-36" />
                </CardContent>
            </Card>
        </div>
    );
  }

  if (!user) {
    return <p>Please log in to manage your account.</p>; // Or redirect
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold font-headline">My Account</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>View and manage your account details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center">
            <Label className="w-32 shrink-0">Current Email:</Label>
            <span className="font-medium">{user.email}</span>
          </div>
          <div className="flex items-center">
            <Label className="w-32 shrink-0">Email Status:</Label>
            {user.emailVerified ? (
              <span className="flex items-center text-green-600">
                <ShieldCheck className="mr-2 h-5 w-5" /> Verified
              </span>
            ) : (
              <span className="flex items-center text-yellow-600">
                <ShieldAlert className="mr-2 h-5 w-5" /> Not Verified
              </span>
            )}
          </div>
        </CardContent>
        {!user.emailVerified && (
          <CardFooter>
            <Button 
              onClick={handleSendVerification} 
              disabled={isSendingVerification}
              variant="outline"
            >
              {isSendingVerification && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Resend Verification Email
            </Button>
          </CardFooter>
        )}
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Update Email</CardTitle>
          <CardDescription>
            Change the email address associated with your admin account. 
            A verification link will be sent to your new email address.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleUpdateEmail}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-email">New Email Address</Label>
              <Input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter new email"
                required
                disabled={isUpdatingEmail}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isUpdatingEmail} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {isUpdatingEmail ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
              Update Email
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Update Password</CardTitle>
          <CardDescription>Change your account password. Make sure it's strong!</CardDescription>
        </CardHeader>
        <form onSubmit={handleUpdatePassword}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                disabled={isUpdatingPassword}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">Confirm New Password</Label>
              <Input
                id="confirm-new-password"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                disabled={isUpdatingPassword}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isUpdatingPassword} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {isUpdatingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
              Update Password
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

// Basic Skeleton for loading state
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
      <div
        className={`animate-pulse rounded-md bg-muted ${className}`}
        {...props}
      />
    );
}
