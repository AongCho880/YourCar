
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { db } from '@/lib/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const SETTINGS_COLLECTION = 'adminSettings';
const CONTACT_INFO_DOC_ID = 'contactDetails';

export default function AdminSettingsPage() {
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [messengerId, setMessengerId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const settingsDocRef = doc(db, SETTINGS_COLLECTION, CONTACT_INFO_DOC_ID);
        const docSnap = await getDoc(settingsDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setWhatsappNumber(data.whatsappNumber || '');
          setMessengerId(data.messengerId || '');
        } else {
          // Document doesn't exist, perhaps initialize with empty strings
          // or let the user save for the first time.
        }
      } catch (error) {
        console.error("Error reading settings from Firestore:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load saved settings from the database.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, [toast]);

  const handleSaveSettings = async () => {
    if (!whatsappNumber.match(/^\+?[1-9]\d{1,14}$/)) {
        toast({
            variant: "destructive",
            title: "Invalid WhatsApp Number",
            description: "Please enter a valid WhatsApp number (e.g., +1234567890 or 1234567890).",
        });
        return;
    }
    if (!messengerId.trim()) {
        toast({
            variant: "destructive",
            title: "Messenger ID Required",
            description: "Please enter your Facebook Page ID or Messenger Username.",
        });
        return;
    }

    setIsLoading(true);
    try {
      const settingsDocRef = doc(db, SETTINGS_COLLECTION, CONTACT_INFO_DOC_ID);
      await setDoc(settingsDocRef, { whatsappNumber, messengerId }, { merge: true }); // Use merge to avoid overwriting other fields if any
      toast({
        title: "Settings Saved",
        description: "Your contact information has been updated in the database.",
      });
    } catch (error) {
      console.error("Error saving settings to Firestore:", error);
      toast({
        variant: "destructive",
        title: "Database Error",
        description: "Could not save settings to the database.",
      });
    } finally {
      setIsLoading(false);
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
            that customers will use to contact you. This information will be stored securely.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
            <Input
              id="whatsappNumber"
              type="tel"
              placeholder="e.g., +1234567890"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
            />
            <p className="text-xs text-muted-foreground flex items-center pt-1">
              <Info className="w-3 h-3 mr-1" />
              Include country code if applicable.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="messengerId">Facebook Page ID / Messenger Username</Label>
            <Input
              id="messengerId"
              type="text"
              placeholder="e.g., yourpagename or 10001234567890"
              value={messengerId}
              onChange={(e) => setMessengerId(e.target.value)}
            />
             <p className="text-xs text-muted-foreground flex items-center pt-1">
              <Info className="w-3 h-3 mr-1" />
              This is used for `m.me/your_id_here` links.
            </p>
          </div>
          <Button onClick={handleSaveSettings} className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" /> Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
