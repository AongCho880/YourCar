
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { CarProvider } from '@/contexts/CarContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ContactSection from '@/components/layout/ContactSection';
import { AuthProvider } from '@/contexts/AuthContext'; // Restored AuthProvider

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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <AuthProvider> {/* Restored AuthProvider */}
          <CarProvider>
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            <ContactSection />
            <Footer />
            <Toaster />
          </CarProvider>
        </AuthProvider> {/* Restored AuthProvider */}
      </body>
    </html>
  );
}
