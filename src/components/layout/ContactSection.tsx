
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Phone, MessageSquareText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
// Removed Firebase imports

const LOCAL_STORAGE_WHATSAPP_KEY = 'yourCarAdminWhatsApp';
const LOCAL_STORAGE_MESSENGER_KEY = 'yourCarAdminMessenger';
const DEFAULT_WHATSAPP_MESSAGE = "Hello! I'm interested in learning more about your cars.";

export default function ContactSection() {
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [messengerId, setMessengerId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Ensure this runs client-side

    const fetchContactDetails = () => {
      setIsLoading(true);
      try {
        const savedWhatsApp = localStorage.getItem(LOCAL_STORAGE_WHATSAPP_KEY);
        const savedMessenger = localStorage.getItem(LOCAL_STORAGE_MESSENGER_KEY);
        if (savedWhatsApp) setWhatsappNumber(savedWhatsApp);
        if (savedMessenger) setMessengerId(savedMessenger);
      } catch (error) {
        console.error("Error fetching contact details from localStorage:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContactDetails();
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
    return null;
  }
  
  const LoadingSkeleton = () => (
    <Card className="max-w-3xl mx-auto shadow-xl">
      <CardHeader className="text-center">
        <Skeleton className="h-8 w-1/2 mx-auto" /> {/* CardTitle */}
        <Skeleton className="h-4 w-3/4 mx-auto mt-2" /> {/* Description */}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center mb-2 sm:mb-0">
            <Skeleton className="w-6 h-6 mr-3 rounded-full" />
            <div>
              <Skeleton className="h-5 w-20 mb-1" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-9 w-36 rounded-md" />
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center mb-2 sm:mb-0">
            <Skeleton className="w-6 h-6 mr-3 rounded-full" />
            <div>
              <Skeleton className="h-5 w-20 mb-1" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-9 w-40 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <section className="py-12 bg-card border-t border-border/20 mt-12">
      <div className="container mx-auto px-4">
        {isLoading ? <LoadingSkeleton /> : (
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

                {!isLoading && !whatsappNumber && !messengerId && (
                    <p className="text-center text-muted-foreground">Contact details are not yet configured by the admin. Please check back later.</p>
                )}
            </CardContent>
            </Card>
        )}
      </div>
    </section>
  );
}
