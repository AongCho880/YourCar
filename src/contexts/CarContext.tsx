
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import type { Car } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { db, auth } from '@/lib/firebaseConfig'; // Import db and auth
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
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
  const { user: firebaseUser } = useAuth(); 

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
    if (!firebaseUser) {
      toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to add a car." });
      return null;
    }
    if (!db) {
      toast({ variant: "destructive", title: "Database Error", description: "Firestore is not initialized." });
      return null;
    }

    try {
      const carWithTimestamps = {
        ...carData,
        features: carData.features || [], 
        images: carData.images || [],
        isSold: carData.isSold ?? false, // Initialize isSold, default to false
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, 'cars'), carWithTimestamps);
      
      const newCar: Car = { 
        id: docRef.id, 
        ...carData, 
        features: carData.features || [],
        images: carData.images || [],
        isSold: carData.isSold ?? false,
        createdAt: Date.now(), 
        updatedAt: Date.now()
      }; 
      
      await fetchCars(); 
      
      toast({ title: "Success", description: "Car listing added successfully." });
      return newCar; 
    } catch (error) {
      console.error("Error adding car directly to Firestore:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast({ variant: "destructive", title: "Error Adding Car", description: `Failed to create car: ${errorMessage}` });
      return null;
    }
  };

  const updateCar = async (carData: Omit<Car, 'createdAt' | 'updatedAt'> & { id: string }): Promise<Car | null> => {
     if (!firebaseUser) {
      toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to update a car." });
      return null;
    }
    if (!db) {
      toast({ variant: "destructive", title: "Database Error", description: "Firestore is not initialized." });
      return null;
    }

    try {
      const carDocRef = doc(db, 'cars', carData.id);
      const { id, ...dataToUpdate } = carData; 
      
      const updatePayload: Partial<Car> & { updatedAt: any } = { // Use Partial<Car> to allow isSold to be optional if not changing
        ...dataToUpdate,
        features: dataToUpdate.features || [], 
        images: dataToUpdate.images || [],
        updatedAt: serverTimestamp(), 
      };
      // Only include isSold if it's explicitly passed
      if (typeof dataToUpdate.isSold === 'boolean') {
        updatePayload.isSold = dataToUpdate.isSold;
      }


      await updateDoc(carDocRef, updatePayload as any); // Cast to any because serverTimestamp is not directly part of Car
      
      await fetchCars(); 
      
      const updatedCarData: Car = {
        ...carData,
        features: carData.features || [],
        images: carData.images || [],
        isSold: carData.isSold ?? cars.find(c => c.id === carData.id)?.isSold ?? false, // Keep existing or default
        updatedAt: Date.now(),
      };
      toast({ title: "Success", description: "Car listing updated successfully." });
      return updatedCarData;
    } catch (error) {
      console.error("Error updating car directly in Firestore:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast({ variant: "destructive", title: "Error Updating Car", description: `Failed to update car: ${errorMessage}` });
      return null;
    }
  };

  const toggleCarSoldStatus = async (carId: string, newSoldStatus: boolean): Promise<boolean> => {
    if (!firebaseUser) {
      toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to update car status." });
      return false;
    }
    if (!db) {
      toast({ variant: "destructive", title: "Database Error", description: "Firestore is not initialized." });
      return false;
    }

    try {
      const carDocRef = doc(db, 'cars', carId);
      await updateDoc(carDocRef, {
        isSold: newSoldStatus,
        updatedAt: serverTimestamp(),
      });
      
      // Optimistically update local state for faster UI response
      setCars(prevCars => 
        prevCars.map(car => 
          car.id === carId ? { ...car, isSold: newSoldStatus, updatedAt: Date.now() } : car
        )
      );
      // await fetchCars(); // Can be called to ensure full consistency, but optimistic update is faster for UI

      toast({ title: "Status Updated", description: `Car marked as ${newSoldStatus ? 'Sold' : 'Available'}.` });
      return true;
    } catch (error) {
      console.error("Error toggling car sold status:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast({ variant: "destructive", title: "Update Failed", description: `Failed to update car status: ${errorMessage}` });
      // Revert optimistic update if needed, or simply refetch
      await fetchCars();
      return false;
    }
  };


  const deleteCar = async (carId: string): Promise<boolean> => {
    if (!firebaseUser) {
      toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to delete a car." });
      return false;
    }
    if (!auth?.currentUser) {
      toast({ variant: "destructive", title: "Authentication Error", description: "User not found for token generation." });
      return false;
    }

    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`/api/cars/${carId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response from server.' }));
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }
      await fetchCars(); // Refresh list
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

