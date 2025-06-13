
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { CarProvider } from '@/contexts/CarContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ContactSection from '@/components/layout/ContactSection';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes'; // Optional: if you want a dark theme for Clerk components

export const metadata: Metadata = {
  title: 'YourCar - Your Premier Car Marketplace',
  description: 'Find or list your next car with YourCar. Featuring AI-powered ad copy generation.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark, // Example: using Clerk's dark theme; remove or change as needed
        variables: { 
            colorPrimary: 'hsl(0 0% 20%)', // Corresponds to your primary theme color
            colorBackground: 'hsl(0 0% 96%)', // Corresponds to your background
            colorInputBackground: 'hsl(0 0% 100%)',
            colorInputText: 'hsl(0 0% 13%)',
         },
      }}
    >
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        </head>
        <body className="font-body antialiased flex flex-col min-h-screen">
          <CarProvider>
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            <ContactSection />
            <Footer />
            <Toaster />
          </CarProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
