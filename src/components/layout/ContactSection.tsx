
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Phone, MessageSquareText, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { AdminContactSettings } from '@/types';
import { useToast } from '@/hooks/use-toast';

const DEFAULT_WHATSAPP_MESSAGE = "Hello! I'm interested in learning more about your cars.";

export default function ContactSection() {
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
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to fetch contact settings');
        }
        const data: AdminContactSettings = await response.json();
        setContactSettings(data);
      } catch (error) {
        console.error("Error fetching contact details for ContactSection:", error);
        // Toasting here can be noisy if ContactButtons also toasts. 
        // Consider a shared hook or context if this becomes an issue.
        // For now, let individual components handle their specific error display or rely on a general error boundary.
      } finally {
        setIsLoading(false);
      }
    };

    fetchContactDetails();
  }, [toast]);

  const handleWhatsAppClick = () => {
    if (!contactSettings?.whatsappNumber) return;
    const whatsappUrl = `https://wa.me/${contactSettings.whatsappNumber.replace(/\s+/g, '')}?text=${encodeURIComponent(DEFAULT_WHATSAPP_MESSAGE)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleMessengerClick = () => {
    if (!contactSettings?.messengerId) return;
    const messengerUrl = `https://m.me/${contactSettings.messengerId.trim()}`;
    window.open(messengerUrl, '_blank');
  };

  if (!isClient) {
    return null; // Or a minimal skeleton if preferred for SSR consistency
  }
  
  const LoadingSkeleton = () => (
    <Card className="max-w-3xl mx-auto shadow-xl">
      <CardHeader className="text-center">
        <Skeleton className="h-8 w-1/2 mx-auto mb-2" /> {/* CardTitle Get in Touch */}
        <Skeleton className="h-4 w-3/4 mx-auto" />    {/* Description */}
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


  const canContactViaWhatsApp = contactSettings?.whatsappNumber && contactSettings.whatsappNumber.trim() !== '';
  const canContactViaMessenger = contactSettings?.messengerId && contactSettings.messengerId.trim() !== '';

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
                {canContactViaWhatsApp && (
                <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center mb-2 sm:mb-0">
                    <Phone className="w-6 h-6 mr-3 text-primary" />
                    <div>
                        <p className="font-semibold text-foreground">WhatsApp</p>
                        <p className="text-sm text-muted-foreground">{contactSettings.whatsappNumber}</p>
                    </div>
                    </div>
                    <Button onClick={handleWhatsAppClick} variant="outline" size="sm">
                    Chat on WhatsApp
                    </Button>
                </div>
                )}

                {canContactViaMessenger && (
                <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center mb-2 sm:mb-0">
                    <MessageSquareText className="w-6 h-6 mr-3 text-primary" />
                    <div>
                        <p className="font-semibold text-foreground">Messenger</p>
                        <p className="text-sm text-muted-foreground">{contactSettings.messengerId}</p>
                    </div>
                    </div>
                    <Button onClick={handleMessengerClick} variant="outline" size="sm">
                    Message on Facebook
                    </Button>
                </div>
                )}

                {!isLoading && !canContactViaWhatsApp && !canContactViaMessenger && (
                    <p className="text-center text-muted-foreground">Contact details are not yet configured by the admin. Please check back later.</p>
                )}
            </CardContent>
            </Card>
        )}
      </div>
    </section>
  );
}
