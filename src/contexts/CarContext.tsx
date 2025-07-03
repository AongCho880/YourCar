"use client";

import type { ReactNode } from 'react';
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import type { Car } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from './AuthContext'; // To check for authenticated user

interface CarContextType {
  cars: Car[];
  loading: boolean;
  addCar: (carData: Omit<Car, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Car | null>;
  updateCar: (carData: Omit<Car, 'createdAt' | 'updatedAt'> & { id: string }) => Promise<Car | null>;
  deleteCar: (carId: string) => Promise<boolean>;
  getCarById: (carId: string) => Car | undefined;
  refreshCars: () => Promise<void>;
  toggleCarSoldStatus: (carId: string, newSoldStatus: boolean) => Promise<boolean>;
}

const CarContext = createContext<CarContextType | undefined>(undefined);

export const CarProvider = ({ children }: { children: ReactNode }) => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchCars = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cars');
      if (!response.ok) {
        throw new Error(`Failed to fetch cars: ${response.status}`);
      }
      const data = await response.json();
      setCars(data as Car[]);
    } catch (error: any) {
      console.error("Error fetching cars:", JSON.stringify(error));
      toast({ variant: "destructive", title: "Error Loading Cars", description: error.message || error.details || 'An unknown error occurred.' });
      setCars([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  const addCar = async (carData: Omit<Car, 'id' | 'createdAt' | 'updatedAt'>): Promise<Car | null> => {
    if (!user) {
      toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to add a car." });
      return null;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("You must be logged in to add a car.");
      }

      // Ensure price and mileage are numbers
      const payload = {
        ...carData,
        price: Number(carData.price),
        mileage: Number(carData.mileage),
      };

      const response = await fetch('/api/cars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response from server.' }));
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }

      const newCar = await response.json();
      await fetchCars();
      toast({ title: "Success", description: "Car listing added successfully." });
      return newCar;
    } catch (error: any) {
      console.error("Error adding car:", error);
      const errorMessage = error.message || error.details || 'An unknown error occurred.';
      toast({ variant: "destructive", title: "Error Adding Car", description: `Failed to create car: ${errorMessage}` });
      return null;
    }
  };

  const updateCar = async (carData: Omit<Car, 'createdAt' | 'updatedAt'> & { id: string }): Promise<Car | null> => {
    if (!user) {
      toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to update a car." });
      return null;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("You must be logged in to update a car.");
      }

      const { id, ...dataToUpdate } = carData;
      // Ensure price and mileage are numbers
      const payload = {
        ...dataToUpdate,
        price: Number(dataToUpdate.price),
        mileage: Number(dataToUpdate.mileage),
      };

      const response = await fetch(`/api/cars/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response from server.' }));
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }

      const updatedCar = await response.json();
      await fetchCars();
      toast({ title: "Success", description: "Car listing updated successfully." });
      return updatedCar;
    } catch (error: any) {
      console.error("Error updating car:", error);
      toast({ variant: "destructive", title: "Error Updating Car", description: `Failed to update car: ${error.message}` });
      return null;
    }
  };

  const toggleCarSoldStatus = async (carId: string, newSoldStatus: boolean): Promise<boolean> => {
    if (!user) {
      toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to update car status." });
      return false;
    }

    try {
      const { error } = await supabase.from('cars').update({ isSold: newSoldStatus }).eq('id', carId);

      if (error) throw error;

      setCars(prevCars =>
        prevCars.map(car =>
          car.id === carId ? { ...car, isSold: newSoldStatus } : car
        )
      );

      toast({ title: "Status Updated", description: `Car marked as ${newSoldStatus ? 'Sold' : 'Available'}.` });
      return true;
    } catch (error: any) {
      console.error("Error toggling car sold status:", error);
      toast({ variant: "destructive", title: "Update Failed", description: `Failed to update car status: ${error.message}` });
      await fetchCars();
      return false;
    }
  };

  /**
   * Deletes a car and all its associated images from both database and storage
   * This function calls the DELETE /api/cars/[id] endpoint which handles:
   * 1. Authentication verification
   * 2. Fetching car details to get image URLs
   * 3. Deleting all images from Supabase storage
   * 4. Deleting the car record from the database
   */
  const deleteCar = async (carId: string): Promise<boolean> => {
    // Check if user is authenticated before attempting to delete
    if (!user) {
      toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to delete a car." });
      return false;
    }

    try {
      // Get the current session to obtain the access token for API calls
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("You must be logged in to delete a car.");
      }

      // Call the DELETE endpoint which handles both image and car deletion
      const response = await fetch(`/api/cars/${carId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      // Handle API response errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response from server.' }));
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }

      // Refresh the cars list to reflect the deletion
      await fetchCars();
      toast({ title: "Car Deleted", description: "The car listing has been removed." });
      return true;
    } catch (error) {
      console.error("Error deleting car via API:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast({ variant: "destructive", title: "Error Deleting Car", description: `${errorMessage}` });
      return false;
    }
  };

  const getCarById = (carId: string): Car | undefined => {
    return cars.find(car => car.id === carId);
  };

  return (
    <CarContext.Provider value={{ cars, loading, addCar, updateCar, deleteCar, getCarById, refreshCars: fetchCars, toggleCarSoldStatus }}>
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

