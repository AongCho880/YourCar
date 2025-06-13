
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Phone, MessageSquareText } from 'lucide-react'; // Using MessageSquareText for Messenger
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const WHATSAPP_NUMBER_KEY = 'adminWhatsappNumber';
const MESSENGER_ID_KEY = 'adminMessengerId';
const DEFAULT_WHATSAPP_MESSAGE = "Hello! I'm interested in learning more about your cars.";

export default function ContactSection() {
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [messengerId, setMessengerId] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedWhatsapp = localStorage.getItem(WHATSAPP_NUMBER_KEY);
    const storedMessenger = localStorage.getItem(MESSENGER_ID_KEY);

    if (storedWhatsapp) {
      setWhatsappNumber(storedWhatsapp);
    }
    if (storedMessenger) {
      setMessengerId(storedMessenger);
    }
  }, []);

  const handleWhatsAppClick = () => {
    if (!whatsappNumber) return;
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\s+/g, '')}?text=${encodeURIComponent(DEFAULT_WHATSAPP_MESSAGE)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleMessengerClick = () => {
    if (!messengerId) return;
    const messengerUrl = `https://m.me/${messengerId.trim()}`;
    window.open(messengerUrl, '_blank');
  };

  if (!isClient) {
    // Don't render the section on SSR to avoid hydration issues with localStorage
    return null;
  }

  return (
    <section className="py-12 bg-card border-t border-border/20 mt-12">
      <div className="container mx-auto px-4">
        <Card className="max-w-3xl mx-auto shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl md:text-3xl font-bold font-headline text-primary">
              Get in Touch
            </CardTitle>
            <p className="text-muted-foreground">
              Have questions or need assistance? Contact us directly!
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {whatsappNumber && (
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center mb-2 sm:mb-0">
                  <Phone className="w-6 h-6 mr-3 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">WhatsApp</p>
                    <p className="text-sm text-muted-foreground">{whatsappNumber}</p>
                  </div>
                </div>
                <Button onClick={handleWhatsAppClick} variant="outline" size="sm">
                  Chat on WhatsApp
                </Button>
              </div>
            )}

            {messengerId && (
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center mb-2 sm:mb-0">
                  <MessageSquareText className="w-6 h-6 mr-3 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">Messenger</p>
                    <p className="text-sm text-muted-foreground">{messengerId}</p>
                  </div>
                </div>
                <Button onClick={handleMessengerClick} variant="outline" size="sm">
                  Message on Facebook
                </Button>
              </div>
            )}

            {!whatsappNumber && !messengerId && (
                 <p className="text-center text-muted-foreground">Contact details will be available soon. Please check back later or contact support if this persists after admin configuration.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
