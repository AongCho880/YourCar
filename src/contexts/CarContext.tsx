
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import type { Car } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface CarContextType {
  cars: Car[];
  loading: boolean;
  addCar: (carData: Omit<Car, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Car | null>;
  updateCar: (carData: Car) => Promise<Car | null>; // Placeholder for now
  deleteCar: (carId: string) => Promise<void>; // Placeholder for now
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
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch cars');
      }
      const data: Car[] = await response.json();
      setCars(data);
    } catch (error) {
      console.error("Error fetching cars:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast({ variant: "destructive", title: "Error", description: `Could not load cars: ${errorMessage}` });
      setCars([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  const addCar = async (carData: Omit<Car, 'id' | 'createdAt' | 'updatedAt'>): Promise<Car | null> => {
    setLoading(true);
    try {
      const response = await fetch('/api/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(carData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add car');
      }
      const newCar: Car = await response.json();
      // setCars(prevCars => [newCar, ...prevCars].sort((a,b) => b.createdAt - a.createdAt)); // Optimistic update, or refetch
      await fetchCars(); // Refetch to ensure data consistency
      return newCar;
    } catch (error) {
      console.error("Error adding car:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast({ variant: "destructive", title: "Error", description: `Could not add car: ${errorMessage}` });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Placeholder implementations for updateCar and deleteCar
  // These would also call their respective API endpoints
  const updateCar = async (carData: Car): Promise<Car | null> => {
    setLoading(true);
    console.log("Updating car (API call to be implemented):", carData.id);
    // Example:
    // const response = await fetch(`/api/cars/${carData.id}`, { method: 'PUT', ... });
    // await fetchCars(); // Refetch
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    setLoading(false);
    toast({ title: "Info", description: "Update car functionality via API is pending." });
    return carData; // Return original for now
  };

  const deleteCar = async (carId: string): Promise<void> => {
    setLoading(true);
    console.log("Deleting car (API call to be implemented):", carId);
    // Example:
    // const response = await fetch(`/api/cars/${carId}`, { method: 'DELETE', ... });
    // await fetchCars(); // Refetch
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    setLoading(false);
    toast({ title: "Info", description: "Delete car functionality via API is pending." });
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
