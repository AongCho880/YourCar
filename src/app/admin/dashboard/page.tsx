
"use client";

import { useCars } from '@/contexts/CarContext';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { Edit, Trash2, PlusCircle, Eye, Car, Loader2 } from 'lucide-react';
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
// useToast is now part of CarContext for delete operations
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react'; // For managing delete loading state

export default function AdminDashboardPage() {
  const { cars, deleteCar, loading: carsLoadingFromContext } = useCars();
  const [isDeleting, setIsDeleting] = useState<string | null>(null); // Store ID of car being deleted

  const handleDelete = async (carId: string, carName: string) => {
    setIsDeleting(carId);
    const success = await deleteCar(carId);
    // Toast is handled by CarContext
    // if (success) {
    //   toast({ title: "Car Deleted", description: `"${carName}" has been removed.` });
    // } else {
    //   toast({ variant:"destructive", title: "Deletion Failed", description: `Could not delete "${carName}".` });
    // }
    setIsDeleting(null);
  };

  if (carsLoadingFromContext && !isDeleting) { // Show main loading only if not in middle of a delete operation
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-96 w-full" /> {/* Table skeleton */}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold font-headline">Car Listings Management</h1>
        <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href="/admin/cars/new" className="text-white">
            <PlusCircle className="mr-2 h-4 w-4 text-white" /> Add New Car
          </Link>
        </Button>
      </div>

      {cars.length === 0 && !carsLoadingFromContext ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
          <Car className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Cars Listed Yet</h2>
          <p className="text-muted-foreground mb-4">Start by adding your first car listing.</p>
          <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/admin/cars/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Car
            </Link>
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg shadow-sm overflow-hidden">
          <Table className="max-h-[65vh]">
            <TableHeader className="sticky top-0 z-10 bg-card shadow-sm">
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Make & Model</TableHead>
                <TableHead className="hidden md:table-cell">Year</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="hidden lg:table-cell">Condition</TableHead>
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
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 sm:gap-2">
                        <Button variant="ghost" size="icon" asChild title="View Car" disabled={isDeleting === car.id}>
                          <Link href={`/cars/${car.id}`} target="_blank"><Eye className="h-4 w-4" /></Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild title="Edit Car" disabled={isDeleting === car.id}>
                          <Link href={`/admin/cars/edit/${car.id}`}><Edit className="h-4 w-4" /></Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" title="Delete Car" className="hover:bg-destructive/10" disabled={isDeleting === car.id}>
                              {isDeleting === car.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
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
                              <AlertDialogCancel disabled={isDeleting === car.id}>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(car.id, carDisplayName)}
                                className="bg-destructive hover:bg-destructive/90"
                                disabled={isDeleting === car.id}
                              >
                                {isDeleting === car.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
      )}
    </div>
  );
}
