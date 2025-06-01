
"use client";

import { useCars } from '@/contexts/CarContext';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { Edit, Trash2, PlusCircle, Eye, Car } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboardPage() {
  const { cars, deleteCar, loading } = useCars();
  const { toast } = useToast();

  const handleDelete = (carId: string) => {
    deleteCar(carId);
    toast({ title: "Car Deleted", description: "The car listing has been removed." });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-96 w-full" />
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

      {cars.length === 0 ? (
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
        <div className="border rounded-lg shadow-sm max-h-[65vh] overflow-hidden">
        <Table>
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
            {cars.map((car) => (
              <TableRow key={car.id}>
                <TableCell>
                  <Image
                    src={car.images[0] || 'https://placehold.co/100x75.png'}
                    alt={`${car.make} ${car.model}`}
                    width={60}
                    height={45}
                    className="rounded object-cover"
                    data-ai-hint={`${car.make} car`}
                  />
                </TableCell>
                <TableCell className="font-medium">{car.make} {car.model}</TableCell>
                <TableCell className="hidden md:table-cell">{car.year}</TableCell>
                <TableCell>${car.price.toLocaleString()}</TableCell>
                <TableCell className="hidden lg:table-cell">
                  <Badge variant={car.condition === "New" ? "default" : "secondary"}>{car.condition}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild title="View Car">
                      <Link href={`/cars/${car.id}`} target="_blank"><Eye className="h-4 w-4" /></Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild title="Edit Car">
                      <Link href={`/admin/cars/edit/${car.id}`}><Edit className="h-4 w-4" /></Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" title="Delete Car">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the car listing for "{car.make} {car.model}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(car.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      )}
    </div>
  );
}
