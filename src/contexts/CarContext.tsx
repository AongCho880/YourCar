
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
  Timestamp, 
  doc, 
  updateDoc, 
  query, 
  orderBy,
  serverTimestamp // Import serverTimestamp
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
}

const CarContext = createContext<CarContextType | undefined>(undefined);

export const CarProvider = ({ children }: { children: ReactNode }) => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user: firebaseUser } = useAuth(); // Get Firebase auth user

  const fetchCars = useCallback(async () => {
    setLoading(true);
    try {
      // API route for fetching cars remains a good approach for public data
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
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, 'cars'), carWithTimestamps);
      // Optimistically update UI or re-fetch
      await fetchCars(); 
      // Construct what the car object would look like (serverTimestamp resolves later)
      // For immediate UI update, we might return carData with estimated timestamps or just the ID
      const newCar: Car = { 
        id: docRef.id, 
        ...carData, 
        createdAt: Date.now(), // Approximate for UI, actual value is server-generated
        updatedAt: Date.now()  // Approximate for UI
      }; 
      toast({ title: "Success", description: "Car listing added successfully." });
      return newCar;
    } catch (error) {
      console.error("Error adding car directly to Firestore:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast({ variant: "destructive", title: "Error Adding Car", description: `${errorMessage}` });
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
      const { id, ...dataToUpdate } = carData; // Exclude id from data payload
      
      await updateDoc(carDocRef, {
        ...dataToUpdate,
        updatedAt: serverTimestamp(), // Use serverTimestamp for updates
      });
      await fetchCars();
      const updatedCarData: Car = {
        ...carData,
        // createdAt will be preserved from original data if not re-fetching the specific doc
        updatedAt: Date.now(), // Approximate for UI
      };
      toast({ title: "Success", description: "Car listing updated successfully." });
      return updatedCarData;
    } catch (error) {
      console.error("Error updating car directly in Firestore:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast({ variant: "destructive", title: "Error Updating Car", description: `${errorMessage}` });
      return null;
    }
  };

  const deleteCar = async (carId: string): Promise<boolean> => {
    // Delete still uses API route because it handles Storage image deletion too
    if (!firebaseUser) {
      toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to delete a car." });
      return false;
    }
    try {
      const response = await fetch(`/api/cars/${carId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete car');
      }
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
