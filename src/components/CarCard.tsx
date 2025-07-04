
import Link from 'next/link';
import Image from 'next/image';
import type { Car as CarType } from '@/types';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Fuel, Gauge, ExternalLink, GitCommitHorizontal } from 'lucide-react';

interface CarCardProps {
  car: CarType;
}

export default function CarCard({ car }: CarCardProps) {
  const makeKeywords = car.make.split(' ');
  let aiHint = '';
  if (makeKeywords.length >= 2) {
    aiHint = car.make; // e.g., "Land Rover"
  } else {
    // makeKeywords.length is 1, e.g., "Toyota", "BMW", "Mercedes-Benz"
    const modelType = car.model.split(' ')[0] || 'car';
    aiHint = `${car.make} ${modelType}`; // e.g., "Toyota Camry", "BMW car", "Mercedes-Benz Sedan"
  }

  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg bg-card">
      <div className="relative">
        <Link href={`/cars/${car.id}`} className="block">
          <Image
            src={car.images[0] || "https://placehold.co/600x400.png"}
            alt={`${car.make} ${car.model}`}
            width={600}
            height={400}
            className="w-full h-48 object-cover"
            data-ai-hint={aiHint}
          />
        </Link>
        {car.isSold && (
          <Badge 
            variant="destructive" 
            className="absolute top-3 right-3 text-sm px-3 py-1 z-10"
            style={{ backgroundColor: 'hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))' }}
          >
            SOLD
          </Badge>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <Link href={`/cars/${car.id}`} className="block group">
          <h2 className="text-lg md:text-xl font-bold font-headline mb-2 text-foreground group-hover:text-primary transition-colors">
            {car.make} {car.model}
          </h2>
        </Link>

        <Separator className="my-1 bg-border/50" />

        <div className="space-y-2 my-3 text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Fuel className="w-5 h-5 mr-2 text-primary" />
            </div>
            <span>Petrol</span> {/* Placeholder: CarType doesn't have fuel_type */}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Gauge className="w-5 h-5 mr-2 text-primary" />
            </div>
            <span>{car.mileage.toLocaleString()} miles</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <GitCommitHorizontal className="w-5 h-5 mr-2 text-primary" />
            </div>
            <span>Manual</span> {/* Placeholder: CarType doesn't have transmission_type */}
          </div>
        </div>

        <Separator className="my-1 bg-border/50" />

        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-xl font-bold text-foreground">
            ${car.price.toLocaleString()}
          </span>
          <Link href={`/cars/${car.id}`} className="text-sm text-primary hover:text-primary/80 flex items-center font-medium">
            View Details <ExternalLink className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </Card>
  );
}
