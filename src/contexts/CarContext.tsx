
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import type { Car } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface CarContextType {
  cars: Car[];
  loading: boolean;
  addCar: (carData: Omit<Car, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Car | null>;
  updateCar: (carData: Car) => Promise<Car | null>;
  deleteCar: (carId: string) => Promise<boolean>; // Returns true on success, false on failure
  getCarById: (carId: string) => Car | undefined;
  refreshCars: () => Promise<void>;
}

const CarContext = createContext<CarContextType | undefined>(undefined);

export const CarProvider = ({ children }: { children: ReactNode }) => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCars = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cars');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch cars');
      }
      const data: Car[] = await response.json();
      setCars(data);
    } catch (error) {
      console.error("Error fetching cars:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast({ variant: "destructive", title: "Error Loading Cars", description: `${errorMessage}` });
      setCars([]); 
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  const addCar = async (carData: Omit<Car, 'id' | 'createdAt' | 'updatedAt'>): Promise<Car | null> => {
    // setLoading(true); // Handled by individual components using the form, or global loading state for context actions
    try {
      const response = await fetch('/api/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(carData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to add car');
      }
      const newCar: Car = await response.json();
      await fetchCars(); // Refetch to ensure data consistency and sorting
      // toast({ title: "Success", description: "Car listing added successfully." }); // Moved to CarForm
      return newCar;
    } catch (error) {
      console.error("Error adding car:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast({ variant: "destructive", title: "Error Adding Car", description: `${errorMessage}` });
      return null;
    } finally {
      // setLoading(false);
    }
  };

  const updateCar = async (carData: Car): Promise<Car | null> => {
    // setLoading(true);
    try {
      const response = await fetch(`/api/cars/${carData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(carData), // Send the whole car object, API will pick fields
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update car');
      }
      const updatedCar: Car = await response.json();
      await fetchCars(); // Refetch for consistency
      // toast({ title: "Success", description: "Car listing updated successfully." }); // Moved to CarForm
      return updatedCar;
    } catch (error) {
      console.error("Error updating car:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast({ variant: "destructive", title: "Error Updating Car", description: `${errorMessage}` });
      return null;
    } finally {
      // setLoading(false);
    }
  };

  const deleteCar = async (carId: string): Promise<boolean> => {
    // setLoading(true); // Handled by component triggering delete
    try {
      const response = await fetch(`/api/cars/${carId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete car');
      }
      await fetchCars(); // Refetch
      toast({ title: "Car Deleted", description: "The car listing has been removed." });
      return true;
    } catch (error) {
      console.error("Error deleting car:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast({ variant: "destructive", title: "Error Deleting Car", description: `${errorMessage}` });
      return false;
    } finally {
      // setLoading(false);
    }
  };

  const getCarById = (carId: string): Car | undefined => {
    return cars.find(car => car.id === carId);
  };

  return (
    <CarContext.Provider value={{ cars, loading, addCar, updateCar, deleteCar, getCarById, refreshCars: fetchCars }}>
      {children}
    </CarContext.Provider>
  );
};

export const useCars = () => {
  const context = useContext(CarContext);
  if (context === undefined) {
    throw new Error('useCars must be used within a CarProvider');
  }
  return context;
};
