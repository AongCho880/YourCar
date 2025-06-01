import Link from 'next/link';
import Image from 'next/image';
import type { Car as CarType } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, CalendarDays, Gauge, Tag } from 'lucide-react';

interface CarCardProps {
  car: CarType;
}

export default function CarCard({ car }: CarCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
      <CardHeader className="p-0 relative">
        <Link href={`/cars/${car.id}`} className="block">
          <Image
            src={car.images[0] || "https://placehold.co/600x400.png"}
            alt={`${car.make} ${car.model}`}
            width={600}
            height={400}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={`${car.make} ${car.model}`}
          />
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Link href={`/cars/${car.id}`} className="block">
          <CardTitle className="text-lg font-headline mb-1 truncate group-hover:text-accent">
            {car.make} {car.model}
          </CardTitle>
        </Link>
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <Tag className="w-4 h-4 mr-1.5 text-accent" />
          <span className="font-semibold text-lg text-accent">
            ${car.price.toLocaleString()}
          </span>
        </div>
        <div className="space-y-1 text-sm text-muted-foreground">
          <div className="flex items-center">
            <CalendarDays className="w-4 h-4 mr-1.5" /> {car.year}
          </div>
          <div className="flex items-center">
            <Gauge className="w-4 h-4 mr-1.5" /> {car.mileage.toLocaleString()} miles
          </div>
        </div>
        <Badge variant="outline" className="mt-3 text-xs">{car.condition}</Badge>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href={`/cars/${car.id}`}>
            View Details <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
