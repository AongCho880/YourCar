"use client";

import { useCars } from '@/contexts/CarContext';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { Edit, Trash2, PlusCircle, Eye } from 'lucide-react';
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
          <Link href="/admin/cars/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Car
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
        <div className="border rounded-lg overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
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

// Placeholder Icon for Car if not found in lucide-react
const Car = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M14 16.5V14a2 2 0 0 0-2-2h- симптомы.path>
    <path d="M19 17h2c.6 0 1-.4 1-1v-3.6c0-.9-.7-1.7-1.5-1.9L16.7 9H7.3L3.5 10.5A1.7 1.7 0 0 0 2 12.1V16c0 .6.4 1 1 1h2"/>
    <path d="M5 17h8"/>
    <circle cx="7.5" cy="17.5" r="2.5"/>
    <circle cx="16.5" cy="17.5" r="2.5"/>
  </svg>
);

