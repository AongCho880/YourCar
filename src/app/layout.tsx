"use client"; // Added to use usePathname

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { CarProvider } from '@/contexts/CarContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ContactSection from '@/components/layout/ContactSection';
import { AuthProvider } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation'; // Import usePathname

// Metadata export still works with "use client" in layout.tsx
// export const metadata: Metadata = { // This would cause an error if uncommented here, needs to be defined outside default export or as generateMetadata
//   title: 'YourCar - Your Premier Car Marketplace',
//   description: 'Find or list your next car with YourCar. Featuring AI-powered ad copy generation.',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');
  const isLandingPage = pathname === '/';

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        {/* It's generally recommended to define metadata outside the component or use generateMetadata for dynamic titles */}
        <link rel="icon" type="image/svg+xml" href="/public/YourCarLogo.svg" />
        <title>YourCar - Your Premier Car Marketplace</title>
        <meta name="description" content="Find or list your next car with YourCar. Featuring AI-powered ad copy generation." />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <AuthProvider>
          <CarProvider>
            {!isLandingPage && <Navbar />}
            <main className="flex-grow w-full max-w-full px-2 py-4 sm:px-4 md:px-8">
              {children}
            </main>
            {!isAdminPage && <ContactSection />} {/* Conditionally render ContactSection */}
            <Footer />
            <Toaster />
          </CarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

// If you need to keep static metadata object, it should be outside or use generateMetadata
// For simplicity with "use client", I've moved basic title/description to <head> directly.
// Or, you can define it like this if not using generateMetadata:
const staticMetadata: Metadata = {
  title: 'YourCar - Your Premier Car Marketplace',
  description: 'Find or list your next car with YourCar. Featuring AI-powered ad copy generation.',
};
// And then you would typically use generateMetadata if the layout is a server component,
// or set title/meta tags directly in <head> if it's a client component like now.
// For this case, simple <title> and <meta> in <head> is fine.
