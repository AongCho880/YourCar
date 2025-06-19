
"use client";

import { useCars } from '@/contexts/CarContext';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { Edit, Trash2, PlusCircle, Eye, Car, Loader2, Sparkles, CheckSquare, XSquare, ListFilter } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useMemo } from 'react';
import type { Car as CarType } from '@/types';
import { CarCondition } from '@/types';
import { CAR_MAKES, CAR_CONDITIONS } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';


// Function to generate random car data
function generateRandomCarData(): Omit<CarType, 'id' | 'createdAt' | 'updatedAt'> {
  const randomMake = CAR_MAKES[Math.floor(Math.random() * CAR_MAKES.length)];
  const randomConditionObj = CAR_CONDITIONS[Math.floor(Math.random() * CAR_CONDITIONS.length)];

  const commonFeaturesPool = ["Air Conditioning", "Power Steering", "Power Windows", "Bluetooth", "Backup Camera", "Sunroof", "Navigation System", "Heated Seats", "Leather Interior", "Alloy Wheels", "Cruise Control", "Keyless Entry"];
  const numFeatures = Math.floor(Math.random() * 4) + 2; // 2 to 5 features
  const randomFeatures: string[] = [];
  const usedIndexes = new Set<number>();
  while (randomFeatures.length < numFeatures && randomFeatures.length < commonFeaturesPool.length) {
    const randomIndex = Math.floor(Math.random() * commonFeaturesPool.length);
    if (!usedIndexes.has(randomIndex)) {
      randomFeatures.push(commonFeaturesPool[randomIndex]);
      usedIndexes.add(randomIndex);
    }
  }

  const currentYear = new Date().getFullYear();
  const randomYear = Math.floor(Math.random() * (currentYear - 2005 + 2)) + 2005; // Year between 2005 and currentYear+1

  return {
    make: randomMake,
    model: `${randomMake.split(' ')[0]} Series ${String.fromCharCode(65 + Math.floor(Math.random() * 3))}${Math.floor(Math.random() * 500)}`, // e.g. Toyota Series A350
    year: randomYear,
    price: Math.floor(Math.random() * (65000 - 7000 + 1)) + 7000, // 7000 to 65000
    mileage: Math.floor(Math.random() * (120000 - 5000 + 1)) + 5000, // 5000 to 120000
    condition: randomConditionObj.value,
    features: randomFeatures,
    images: [
      `https://placehold.co/600x400.png`,
      `https://placehold.co/600x400.png`,
      `https://placehold.co/600x400.png`,
    ],
    description: `Explore this reliable ${randomYear} ${randomMake}. It's in ${randomConditionObj.label.toLowerCase()} condition with reasonable mileage. Key features include: ${randomFeatures.join(', ')}. Contact us for a test drive!`,
    isSold: false, // Default to not sold
  };
}

const CarTable = ({ 
  cars, 
  title, 
  isSoldTable,
  onDelete, 
  onToggleSoldStatus, 
  isDeletingId, 
  isTogglingStatusId,
  isAddingRandomCar
}: { 
  cars: CarType[], 
  title: string, 
  isSoldTable: boolean,
  onDelete: (carId: string, carName: string) => void, 
  onToggleSoldStatus: (carId: string, currentStatus: boolean) => void,
  isDeletingId: string | null,
  isTogglingStatusId: string | null,
  isAddingRandomCar: boolean
}) => {
  if (cars.length === 0) {
    return (
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-3 font-headline flex items-center">
          <ListFilter className="mr-2 h-5 w-5 text-primary"/> {title} (0)
        </h3>
        <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
          <Car className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            {isSoldTable ? "No cars have been marked as sold yet." : "No available cars found. Try adding some!"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-3 font-headline flex items-center">
        <ListFilter className="mr-2 h-5 w-5 text-primary"/> {title} ({cars.length})
      </h3>
      <div className="border rounded-lg shadow-sm overflow-hidden">
        <Table className="max-h-[65vh]">
          <TableHeader className="sticky top-0 z-10 bg-card shadow-sm">
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Make & Model</TableHead>
              <TableHead className="hidden md:table-cell">Year</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="hidden lg:table-cell">Condition</TableHead>
              <TableHead className="w-[150px] text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cars.map((car) => {
              const makeKeywords = car.make.split(' ');
              let aiHint = '';
              if (makeKeywords.length >= 2) {
                aiHint = car.make;
              } else {
                const modelType = car.model.split(' ')[0] || 'car';
                aiHint = `${car.make} ${modelType}`;
              }
              const carDisplayName = `${car.make} ${car.model}`;
              return (
                <TableRow key={car.id}>
                  <TableCell>
                    <Image
                      src={car.images[0] || 'https://placehold.co/100x75.png'}
                      alt={carDisplayName}
                      width={60}
                      height={45}
                      className="rounded object-cover"
                      data-ai-hint={aiHint}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{carDisplayName}</TableCell>
                  <TableCell className="hidden md:table-cell">{car.year}</TableCell>
                  <TableCell>${car.price.toLocaleString()}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Badge variant={car.condition === "New" ? "default" : "secondary"}>{car.condition}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center space-x-2">
                      {isTogglingStatusId === car.id ? 
                        <Loader2 className="h-5 w-5 animate-spin text-primary" /> :
                        <>
                          <Switch
                              id={`sold-status-${car.id}`}
                              checked={!!car.isSold}
                              onCheckedChange={() => onToggleSoldStatus(car.id, !!car.isSold)}
                              disabled={isTogglingStatusId === car.id || isDeletingId === car.id || isAddingRandomCar}
                              aria-label={car.isSold ? "Mark as Available" : "Mark as Sold"}
                          />
                          <Label htmlFor={`sold-status-${car.id}`} className="text-xs">
                              {car.isSold ? <Badge variant="destructive">Sold</Badge> : <Badge variant="default">Available</Badge>}
                          </Label>
                        </>
                      }
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 sm:gap-2">
                      <Button variant="ghost" size="icon" asChild title="View Car" disabled={isDeletingId === car.id || isAddingRandomCar || isTogglingStatusId === car.id}>
                        <Link href={`/cars/${car.id}`} target="_blank"><Eye className="h-4 w-4" /></Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild title="Edit Car" disabled={isDeletingId === car.id || isAddingRandomCar || isTogglingStatusId === car.id}>
                        <Link href={`/admin/cars/edit/${car.id}`}><Edit className="h-4 w-4" /></Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" title="Delete Car" className="hover:bg-destructive/10" disabled={isDeletingId === car.id || isAddingRandomCar || isTogglingStatusId === car.id}>
                            {isDeletingId === car.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the car listing for "{carDisplayName}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={isDeletingId === car.id}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDelete(car.id, carDisplayName)}
                              className="bg-destructive hover:bg-destructive/90"
                              disabled={isDeletingId === car.id}
                            >
                              {isDeletingId === car.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}


export default function AdminDashboardPage() {
  const { cars, deleteCar, loading: carsLoadingFromContext, addCar, toggleCarSoldStatus } = useCars();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isAddingRandomCar, setIsAddingRandomCar] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState<string | null>(null);
  const { toast } = useToast();

  const availableCars = useMemo(() => cars.filter(car => !car.isSold), [cars]);
  const soldCars = useMemo(() => cars.filter(car => car.isSold), [cars]);

  const handleDelete = async (carId: string, carName: string) => {
    setIsDeleting(carId);
    await deleteCar(carId); // Toast is handled by CarContext
    setIsDeleting(null);
  };

  const handleAddRandomCar = async () => {
    setIsAddingRandomCar(true);
    await addCar(generateRandomCarData()); // Toast is handled by CarContext
    setIsAddingRandomCar(false);
  };

  const handleToggleSoldStatus = async (carId: string, currentStatus: boolean) => {
    setIsTogglingStatus(carId);
    await toggleCarSoldStatus(carId, !currentStatus); // Toast is handled by CarContext
    setIsTogglingStatus(null);
  };

  if (carsLoadingFromContext && !isDeleting && !isAddingRandomCar && !isTogglingStatus) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
        </div>
        <h2 className="text-2xl font-bold font-headline pt-4">Car Listings Management</h2>
        <div className="flex flex-col sm:flex-row gap-2 mt-4 mb-6">
            <Skeleton className="h-10 w-40" /> 
            <Skeleton className="h-10 w-36" /> 
        </div>
        <Skeleton className="h-64 w-full mt-6" /> 
        <Separator className="my-8" />
        <Skeleton className="h-64 w-full mt-6" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1> 
      
      <h2 className="text-2xl font-semibold font-headline pt-4">Car Listings Management</h2>
      <div className="flex flex-col sm:flex-row gap-2 mb-6"> 
          <Button 
            onClick={handleAddRandomCar} 
            variant="outline"
            disabled={isAddingRandomCar || carsLoadingFromContext || !!isTogglingStatus}
          >
            {isAddingRandomCar ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Add Random Dev Car
          </Button>
          <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/admin/cars/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Car
            </Link>
          </Button>
        </div>

      <CarTable 
        cars={availableCars}
        title="Available Cars"
        isSoldTable={false}
        onDelete={handleDelete}
        onToggleSoldStatus={handleToggleSoldStatus}
        isDeletingId={isDeleting}
        isTogglingStatusId={isTogglingStatus}
        isAddingRandomCar={isAddingRandomCar}
      />

      <Separator className="my-8" />

      <CarTable 
        cars={soldCars}
        title="Sold Cars"
        isSoldTable={true}
        onDelete={handleDelete}
        onToggleSoldStatus={handleToggleSoldStatus}
        isDeletingId={isDeleting}
        isTogglingStatusId={isTogglingStatus}
        isAddingRandomCar={isAddingRandomCar}
      />

    </div>
  );
}
