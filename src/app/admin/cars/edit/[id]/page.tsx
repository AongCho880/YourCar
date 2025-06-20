
"use client";

import CarForm from '@/components/admin/CarForm';
import { useCars } from '@/contexts/CarContext';
import { useParams, notFound } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function EditCarPage() {
  const params = useParams();
  const { id } = params;
  const { getCarById, loading } = useCars();
  
  const carId = Array.isArray(id) ? id[0] : id;
  const car = getCarById(carId);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          {/* Skeleton for "Edit Car Listing" title */}
          <Skeleton className="h-8 w-1/2 rounded-md" /> 
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Grid for first few fields */}
          <div className="grid md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-1/4 rounded-md" /> {/* Label */}
                <Skeleton className="h-10 w-full rounded-md" /> {/* Input */}
              </div>
            ))}
          </div>

          {/* Image URLs skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-6 w-1/3 rounded-md" /> {/* "Image URLs" label */}
            <Skeleton className="h-10 w-full rounded-md" /> {/* One input field */}
            <Skeleton className="h-9 w-36 rounded-md" /> {/* "Add Image URL" button */}
          </div>

          {/* Features skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-6 w-1/4 rounded-md" /> {/* "Features" label */}
            <Skeleton className="h-10 w-full rounded-md" /> {/* One input field */}
            <Skeleton className="h-9 w-32 rounded-md" /> {/* "Add Feature" button */}
          </div>

          {/* Description skeleton */}
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-2">
              <Skeleton className="h-6 w-1/3 rounded-md" /> {/* "Description" label */}
              <Skeleton className="h-9 w-40 rounded-md" /> {/* "Generate with AI" button */}
            </div>
            <Skeleton className="h-24 w-full rounded-md" /> {/* Textarea */}
          </div>

          {/* Submit button skeleton */}
          <Skeleton className="h-10 w-44 rounded-md" />
        </CardContent>
      </Card>
    );
  }

  if (!car) {
    notFound();
    return null; 
  }

  return (
    <div>
      <CarForm initialData={car} isEditMode={true} />
    </div>
  );
}

