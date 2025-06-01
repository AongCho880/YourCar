"use client";

import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import { useCars } from '@/contexts/CarContext';
import CarImageCarousel from '@/components/CarImageCarousel';
import ContactButtons from '@/components/ContactButtons';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle }
from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CalendarDays, Gauge, Tag, CheckCircle, Settings, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function CarDetailPage() {
  const params = useParams();
  const { id } = params;
  const { getCarById, loading } = useCars();
  
  const car = getCarById(Array.isArray(id) ? id[0] : id);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Skeleton className="w-full h-[400px] rounded-lg mb-8" />
        <Skeleton className="h-10 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-6" />
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-32 w-full mb-6" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (!car) {
    notFound();
    return null; // Ensure notFound is called and component returns
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <Card className="overflow-hidden shadow-xl">
        <CardHeader className="p-0">
          <CarImageCarousel images={car.images} altText={`${car.make} ${car.model}`} />
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-headline text-primary mb-1">
                {car.make} {car.model}
              </h1>
              <div className="text-lg text-muted-foreground">
                <Badge variant="secondary" className="text-sm">{car.condition}</Badge> - {car.year}
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-semibold text-accent mt-2 md:mt-0">
              ${car.price.toLocaleString()}
            </div>
          </div>
          
          <Separator className="my-6" />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 text-sm">
            <div className="flex items-center p-3 bg-secondary/50 rounded-md">
              <Tag className="w-5 h-5 mr-2 text-primary" />
              <strong>Make:</strong><span className="ml-1">{car.make}</span>
            </div>
            <div className="flex items-center p-3 bg-secondary/50 rounded-md">
              <Tag className="w-5 h-5 mr-2 text-primary" />
              <strong>Model:</strong><span className="ml-1">{car.model}</span>
            </div>
            <div className="flex items-center p-3 bg-secondary/50 rounded-md">
              <CalendarDays className="w-5 h-5 mr-2 text-primary" />
              <strong>Year:</strong><span className="ml-1">{car.year}</span>
            </div>
            <div className="flex items-center p-3 bg-secondary/50 rounded-md">
              <Gauge className="w-5 h-5 mr-2 text-primary" />
              <strong>Mileage:</strong><span className="ml-1">{car.mileage.toLocaleString()} miles</span>
            </div>
            <div className="flex items-center p-3 bg-secondary/50 rounded-md">
              <Info className="w-5 h-5 mr-2 text-primary" />
              <strong>Condition:</strong><span className="ml-1">{car.condition}</span>
            </div>
          </div>
          
          {car.features && car.features.length > 0 && (
            <>
              <h2 className="text-xl font-semibold mb-3 font-headline flex items-center">
                <Settings className="w-5 h-5 mr-2 text-primary" /> Features
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-6 list-none p-0">
                {car.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm p-2 bg-secondary/30 rounded-md">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </>
          )}

          <h2 className="text-xl font-semibold mb-3 font-headline flex items-center">
            <Info className="w-5 h-5 mr-2 text-primary" /> Description
          </h2>
          <p className="text-foreground leading-relaxed whitespace-pre-line mb-6">
            {car.description || 'No description available.'}
          </p>
          
          <ContactButtons car={car} />
        </CardContent>
      </Card>
    </div>
  );
}
