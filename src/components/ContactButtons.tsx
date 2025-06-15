
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import type { Car } from '@/types';
import { MessageCircle, Send } from 'lucide-react';
import { db } from '@/lib/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const SETTINGS_COLLECTION = 'adminSettings';
const CONTACT_INFO_DOC_ID = 'contactDetails';

interface ContactButtonsProps {
  car: Car;
}

export default function ContactButtons({ car }: ContactButtonsProps) {
  const [contactPhoneNumber, setContactPhoneNumber] = useState('');
  const [contactMessengerId, setContactMessengerId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Ensure this runs client-side

    const fetchContactDetails = async () => {
      setIsLoading(true);
      try {
        const settingsDocRef = doc(db, SETTINGS_COLLECTION, CONTACT_INFO_DOC_ID);
        const docSnap = await getDoc(settingsDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setContactPhoneNumber(data.whatsappNumber || '');
          setContactMessengerId(data.messengerId || '');
        }
      } catch (error) {
        console.error("Error fetching contact details from Firestore:", error);
        // Optionally show a toast or error message to the user
      } finally {
        setIsLoading(false);
      }
    };

    fetchContactDetails();
  }, []);

  const prefilledMessage = `Hello, I'm interested in the ${car.year} ${car.make} ${car.model} (ID: ${car.id}) listed for $${car.price.toLocaleString()}. Is it still available?`;

  const handleWhatsAppClick = () => {
    if (!contactPhoneNumber) return;
    const whatsappUrl = `https://wa.me/${contactPhoneNumber.replace(/\s+/g, '')}?text=${encodeURIComponent(prefilledMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleMessengerClick = () => {
    if (!contactMessengerId) return;
    const messengerUrl = `https://m.me/${contactMessengerId.trim()}`;
    window.open(messengerUrl, '_blank');
  };

  if (!isClient || isLoading) {
    // Render a loading state or null to avoid hydration mismatch & show loading
    // For example, simple placeholder buttons:
    return (
      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        <Button className="flex-1 bg-primary text-primary-foreground" disabled>
          <Send className="mr-2 h-5 w-5" /> Loading WhatsApp...
        </Button>
        <Button className="flex-1 bg-secondary text-secondary-foreground" disabled>
          <MessageCircle className="mr-2 h-5 w-5" /> Loading Messenger...
        </Button>
      </div>
    );
  }

  const canContact = contactPhoneNumber || contactMessengerId;

  if (!canContact) {
    return (
        <div className="mt-6 text-center text-muted-foreground">
            Contact options will be available once configured by the administrator.
        </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mt-6">
      {contactPhoneNumber && (
        <Button 
          onClick={handleWhatsAppClick} 
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Send className="mr-2 h-5 w-5" /> Contact via WhatsApp
        </Button>
      )}
      {contactMessengerId && (
        <Button 
          onClick={handleMessengerClick} 
          className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
        >
          <MessageCircle className="mr-2 h-5 w-5" /> Contact via Messenger
        </Button>
      )}
    </div>
  );
}
