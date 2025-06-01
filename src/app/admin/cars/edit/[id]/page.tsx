"use client";

import CarForm from '@/components/admin/CarForm';
import { useCars } from '@/contexts/CarContext';
import { useParams, notFound } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditCarPage() {
  const params = useParams();
  const { id } = params;
  const { getCarById, loading } = useCars();
  
  const carId = Array.isArray(id) ? id[0] : id;
  const car = getCarById(carId);

  if (loading) {
    return (
      <div>
        <Skeleton className="h-10 w-1/3 mb-6" />
        <Skeleton className="h-[600px] w-full" />
      </div>
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
