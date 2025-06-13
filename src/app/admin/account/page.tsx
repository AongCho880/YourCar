
"use client";

import { UserProfile } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AccountPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Manage Your Account</h1>
      <Card>
        <CardHeader>
          <CardTitle>Account Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <UserProfile 
            path="/admin/account" 
            routing="path"
            // Removed appearance prop to simplify Clerk setup
            // appearance={{
            //   elements: {
            //     card: "shadow-none border-none",
            //     headerTitle: "text-foreground",
            //     headerSubtitle: "text-muted-foreground",
            //     navbar: "text-foreground",
            //     navbarButton: "text-foreground hover:bg-muted",
            //     navbarButton__active: "text-primary bg-muted",
            //     formFieldLabel: "text-foreground",
            //     formFieldInput: "bg-input text-foreground border-border",
            //     formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
            //     formButtonReset: "text-destructive hover:bg-destructive/10",
            //     dividerLine: "bg-border",
            //     accordionTrigger: "text-foreground hover:bg-muted",
            //     accordionContent: "text-foreground",
            //     selectOptionsContainer: "bg-popover",
            //     selectOption__active: "bg-muted",
            //     selectOption: "hover:bg-muted/50",
            //   }
            // }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
