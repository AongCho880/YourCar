
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save, Info, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { AdminContactSettings } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebaseConfig'; // Import db
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'; // Import firestore functions

const SETTINGS_DOC_PATH = 'adminSettings/contactDetails';

export default function AdminSettingsPage() {
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [messengerId, setMessengerId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth(); // Get the authenticated user

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/admin-settings'); // GET request
        if (!response.ok) {
          let errorDetail = `Server responded with status ${response.status}`;
          try {
            const errorData = await response.json();
            errorDetail = errorData.error || errorData.details || errorDetail;
          } catch (jsonError) {
            errorDetail = `${errorDetail}: ${response.statusText || 'Non-JSON error response'}`;
          }
          throw new Error(errorDetail);
        }
        const data: AdminContactSettings = await response.json();
        setWhatsappNumber(data.whatsappNumber || '');
        setMessengerId(data.messengerId || '');
      } catch (error) {
        console.error("Error fetching settings:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        toast({
          variant: "destructive",
          title: "Error Loading Settings",
          description: `Could not load saved settings: ${errorMessage}`,
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [toast]);

  const handleSaveSettings = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to save settings.",
      });
      return;
    }

    if (whatsappNumber && !whatsappNumber.match(/^\+?[1-9]\d{1,14}$/)) { 
        toast({
            variant: "destructive",
            title: "Invalid WhatsApp Number",
            description: "Please enter a valid WhatsApp number (e.g., +1234567890) or leave it empty to clear.",
        });
        return;
    }
    
    setIsSaving(true);
    try {
      if (!db) {
        throw new Error("Firestore is not initialized. Please check Firebase configuration.");
      }
      const settingsDocRef = doc(db, SETTINGS_DOC_PATH);
      const dataToSave: Partial<AdminContactSettings> = { // Use Partial as serverTimestamp is FieldValue
          // Only include fields that are actually passed, or set to empty string if they should be cleared
          ...(whatsappNumber !== undefined && { whatsappNumber }),
          ...(messengerId !== undefined && { messengerId }),
          updatedAt: serverTimestamp() as any, // Firestore server timestamp
      };

      await setDoc(settingsDocRef, dataToSave, { merge: true });

      toast({
        title: "Settings Saved",
        description: "Your contact information has been updated in Firestore.",
      });
    } catch (error) {
      console.error("Error saving settings directly to Firestore:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast({
        variant: "destructive",
        title: "Save Error",
        description: `Failed to save settings: ${errorMessage}`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" /> {/* Title: Contact Settings */}
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-1/2" /> {/* CardTitle */}
            <Skeleton className="h-4 w-full mt-1" /> {/* CardDescription line 1 */}
            <Skeleton className="h-4 w-3/4 mt-1" /> {/* CardDescription line 2 */}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-5 w-1/4" /> {/* Label */}
              <Skeleton className="h-10 w-full" /> {/* Input */}
              <Skeleton className="h-4 w-2/3 mt-1" /> {/* Help text */}
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-1/4" /> {/* Label */}
              <Skeleton className="h-10 w-full" /> {/* Input */}
              <Skeleton className="h-4 w-2/3 mt-1" /> {/* Help text */}
            </div>
            <Skeleton className="h-10 w-36 rounded-md" /> {/* Save button */}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Contact Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Customer Contact Information</CardTitle>
          <CardDescription>
            Enter the WhatsApp number and Facebook Page ID/Messenger Username
            that customers will use to contact you. This information will be stored in Firestore.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
            <Input
              id="whatsappNumber"
              type="tel"
              placeholder="e.g., +1234567890 (leave empty to clear)"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              disabled={isSaving}
            />
            <p className="text-xs text-muted-foreground flex items-center pt-1">
              <Info className="w-3 h-3 mr-1" />
              Include country code if applicable. Can be left empty.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="messengerId">Facebook Page ID / Messenger Username</Label>
            <Input
              id="messengerId"
              type="text"
              placeholder="e.g., yourpagename or 10001234567890 (leave empty to clear)"
              value={messengerId}
              onChange={(e) => setMessengerId(e.target.value)}
              disabled={isSaving}
            />
             <p className="text-xs text-muted-foreground flex items-center pt-1">
              <Info className="w-3 h-3 mr-1" />
              Used for `m.me/your_id_here` links. Can be left empty.
            </p>
          </div>
          <Button onClick={handleSaveSettings} className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isSaving || isLoading || !user}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
             Save Settings
          </Button>
          {!user && <p className="text-xs text-destructive mt-2">You must be logged in to save settings.</p>}
        </CardContent>
      </Card>
    </div>
  );
}

