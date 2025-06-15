
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import type { Car, AdminContactSettings } from '@/types';
import { MessageCircle, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ContactButtonsProps {
  car: Car;
}

export default function ContactButtons({ car }: ContactButtonsProps) {
  const [contactSettings, setContactSettings] = useState<AdminContactSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true); 

    const fetchContactDetails = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/admin-settings');
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({})); // Catch if response is not JSON
          throw new Error(errorData.error || 'Failed to fetch contact settings');
        }
        const data: AdminContactSettings = await response.json();
        setContactSettings(data);
      } catch (error) {
        console.error("Error fetching contact details:", error);
        // Do not toast here, ContactSection will handle general message
      } finally {
        setIsLoading(false);
      }
    };

    fetchContactDetails();
  }, [toast]);

  const prefilledMessage = `Hello, I'm interested in the ${car.year} ${car.make} ${car.model} (ID: ${car.id}) listed for $${car.price.toLocaleString()}. Is it still available?`;

  const handleWhatsAppClick = () => {
    if (!contactSettings?.whatsappNumber) return;
    const whatsappUrl = `https://wa.me/${contactSettings.whatsappNumber.replace(/\s+/g, '')}?text=${encodeURIComponent(prefilledMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleMessengerClick = () => {
    if (!contactSettings?.messengerId) return;
    const messengerUrl = `https://m.me/${contactSettings.messengerId.trim()}`;
    window.open(messengerUrl, '_blank');
  };

  if (!isClient || isLoading) {
    return (
      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        <Button className="flex-1 bg-primary text-primary-foreground" disabled>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading WhatsApp...
        </Button>
        <Button className="flex-1 bg-secondary text-secondary-foreground" disabled>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading Messenger...
        </Button>
      </div>
    );
  }

  const canContactViaWhatsApp = contactSettings?.whatsappNumber && contactSettings.whatsappNumber.trim() !== '';
  const canContactViaMessenger = contactSettings?.messengerId && contactSettings.messengerId.trim() !== '';

  if (!canContactViaWhatsApp && !canContactViaMessenger) {
    return (
        <div className="mt-6 text-center text-muted-foreground">
            Contact options are not configured by the administrator.
        </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mt-6">
      {canContactViaWhatsApp && (
        <Button 
          onClick={handleWhatsAppClick} 
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Send className="mr-2 h-5 w-5" /> Contact via WhatsApp
        </Button>
      )}
      {canContactViaMessenger && (
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
