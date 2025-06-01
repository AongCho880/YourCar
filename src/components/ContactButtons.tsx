"use client";

import { Button } from '@/components/ui/button';
import type { Car } from '@/types';
import { MessageCircle, Send } from 'lucide-react'; // Using Send for WhatsApp as generic

interface ContactButtonsProps {
  car: Car;
  phoneNumber?: string; // Admin's WhatsApp number
  messengerUsername?: string; // Admin's Messenger username
}

export default function ContactButtons({ car, phoneNumber = "1234567890", messengerUsername = "yourpage" }: ContactButtonsProps) {
  const prefilledMessage = `Hello, I'm interested in the ${car.year} ${car.make} ${car.model} (ID: ${car.id}) listed for $${car.price.toLocaleString()}. Is it still available?`;

  const handleWhatsAppClick = () => {
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(prefilledMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleMessengerClick = () => {
    // Note: Facebook's m.me links prefill functionality is limited.
    // This will open a chat with the user/page. The message might need to be manually pasted by the user.
    const messengerUrl = `https://m.me/${messengerUsername}`;
    // To attempt prefill (might not work consistently across all platforms/versions):
    // const messengerUrl = `fb-messenger://user-thread/${messengerUsername}?text=${encodeURIComponent(prefilledMessage)}`;
    // Or for pages: `http://m.me/YOUR_PAGE_NAME?ref=Hello%20World`
    window.open(messengerUrl, '_blank');
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mt-6">
      <Button onClick={handleWhatsAppClick} className="flex-1 bg-green-500 hover:bg-green-600 text-white">
        <Send className="mr-2 h-5 w-5" /> Contact via WhatsApp
      </Button>
      <Button onClick={handleMessengerClick} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
        <MessageCircle className="mr-2 h-5 w-5" /> Contact via Messenger
      </Button>
    </div>
  );
}
