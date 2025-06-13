
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import type { Car } from '@/types';
import { MessageCircle, Send } from 'lucide-react';

const WHATSAPP_NUMBER_KEY = 'adminWhatsappNumber';
const MESSENGER_ID_KEY = 'adminMessengerId';
const DEFAULT_WHATSAPP_NUMBER = "1234567890"; // Default if nothing in localStorage
const DEFAULT_MESSENGER_ID = "yourpage"; // Default if nothing in localStorage

interface ContactButtonsProps {
  car: Car;
  // Props for phone number and messenger ID are now primarily for fallback/testing
  // and not the main source of truth if localStorage is set.
  phoneNumber?: string;
  messengerUsername?: string;
}

export default function ContactButtons({ 
  car, 
  phoneNumber: propPhoneNumber, 
  messengerUsername: propMessengerUsername 
}: ContactButtonsProps) {
  const [contactPhoneNumber, setContactPhoneNumber] = useState(DEFAULT_WHATSAPP_NUMBER);
  const [contactMessengerId, setContactMessengerId] = useState(DEFAULT_MESSENGER_ID);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Ensure localStorage is accessed only on the client
    const storedWhatsapp = localStorage.getItem(WHATSAPP_NUMBER_KEY);
    const storedMessenger = localStorage.getItem(MESSENGER_ID_KEY);

    if (storedWhatsapp) {
      setContactPhoneNumber(storedWhatsapp);
    } else if (propPhoneNumber) {
      setContactPhoneNumber(propPhoneNumber);
    }

    if (storedMessenger) {
      setContactMessengerId(storedMessenger);
    } else if (propMessengerUsername) {
      setContactMessengerId(propMessengerUsername);
    }
  }, [propPhoneNumber, propMessengerUsername]);

  const prefilledMessage = `Hello, I'm interested in the ${car.year} ${car.make} ${car.model} (ID: ${car.id}) listed for $${car.price.toLocaleString()}. Is it still available?`;

  const handleWhatsAppClick = () => {
    if (!contactPhoneNumber) return; // Or show a message
    const whatsappUrl = `https://wa.me/${contactPhoneNumber.replace(/\s+/g, '')}?text=${encodeURIComponent(prefilledMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleMessengerClick = () => {
    if (!contactMessengerId) return; // Or show a message
    const messengerUrl = `https://m.me/${contactMessengerId.trim()}`;
    window.open(messengerUrl, '_blank');
  };

  if (!isClient) {
    // Render nothing or a placeholder on the server to avoid hydration mismatch
    return null; 
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mt-6">
      <Button 
        onClick={handleWhatsAppClick} 
        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
        disabled={!contactPhoneNumber}
      >
        <Send className="mr-2 h-5 w-5" /> Contact via WhatsApp
      </Button>
      <Button 
        onClick={handleMessengerClick} 
        className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
        disabled={!contactMessengerId}
      >
        <MessageCircle className="mr-2 h-5 w-5" /> Contact via Messenger
      </Button>
    </div>
  );
}
