
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useState, useContext, useEffect } from 'react';
import type { Car } from '@/types';
import { db } from '@/lib/firebaseConfig';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';

interface CarContextType {
  cars: Car[];
  loading: boolean;
  addCar: (carData: Omit<Car, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Car | null>;
  updateCar: (carData: Car) => Promise<Car | null>;
  deleteCar: (carId: string) => Promise<void>;
  getCarById: (carId: string) => Car | undefined;
}

const CarContext = createContext<CarContextType | undefined>(undefined);

export const CarProvider = ({ children }: { children: ReactNode }) => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true);
      try {
        const carsCollection = collection(db, 'cars');
        const q = query(carsCollection, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetchedCars = querySnapshot.docs.map(docSnapshot => {
          const data = docSnapshot.data();
          return {
            id: docSnapshot.id,
            ...data,
            // Convert Firestore Timestamps to numbers (milliseconds)
            createdAt: (data.createdAt as Timestamp)?.toMillis() || Date.now(),
            updatedAt: (data.updatedAt as Timestamp)?.toMillis() || Date.now(),
          } as Car;
        });
        setCars(fetchedCars);
      } catch (error) {
        console.error("Error fetching cars from Firestore:", error);
        // Optionally set an error state or show a toast
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  const addCar = async (carData: Omit<Car, 'id' | 'createdAt' | 'updatedAt'>): Promise<Car | null> => {
    setLoading(true);
    try {
      const carDataWithTimestamps = {
        ...carData,
        createdAt: serverTimestamp(), // Use server timestamp for creation
        updatedAt: serverTimestamp(), // Use server timestamp for initial update
      };
      const docRef = await addDoc(collection(db, 'cars'), carDataWithTimestamps);
      
      // For immediate UI update, we create a client-side version.
      // Note: serverTimestamp() will be null until server processes it.
      // A more robust solution might re-fetch or listen for snapshot changes.
      // For simplicity, we'll use client-side timestamps for the immediate UI update.
      const now = Date.now();
      const newCar: Car = {
        ...carData,
        id: docRef.id,
        createdAt: now, 
        updatedAt: now,
      };
      setCars(prevCars => [newCar, ...prevCars].sort((a, b) => b.createdAt - a.createdAt));
      setLoading(false);
      return newCar;
    } catch (error) {
      console.error("Error adding car to Firestore:", error);
      setLoading(false);
      return null;
    }
  };

  const updateCar = async (updatedCarData: Car): Promise<Car | null> => {
    setLoading(true);
    try {
      const carRef = doc(db, 'cars', updatedCarData.id);
      // Exclude id, createdAt from the update payload. createdAt should not change.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, createdAt, ...dataToUpdate } = updatedCarData;
      
      const updatePayload = {
        ...dataToUpdate,
        updatedAt: serverTimestamp(), // Use server timestamp for updates
      };
      await updateDoc(carRef, updatePayload);

      // For immediate UI update with client-side timestamp
      const carForStateUpdate: Car = {
        ...updatedCarData,
        updatedAt: Date.now(), // Client-side timestamp for UI
      };

      setCars(prevCars =>
        prevCars.map(car => (car.id === carForStateUpdate.id ? carForStateUpdate : car))
        .sort((a,b) => b.createdAt - a.createdAt)
      );
      setLoading(false);
      return carForStateUpdate;
    } catch (error) {
      console.error("Error updating car in Firestore:", error);
      setLoading(false);
      return null;
    }
  };

  const deleteCar = async (carId: string): Promise<void> => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'cars', carId));
      setCars(prevCars => prevCars.filter(car => car.id !== carId));
    } catch (error) {
      console.error("Error deleting car from Firestore:", error);
      // Optionally set an error state or show a toast
    } finally {
      setLoading(false);
    }
  };

  const getCarById = (carId: string): Car | undefined => {
    return cars.find(car => car.id === carId);
  };

  return (
    <CarContext.Provider value={{ cars, loading, addCar, updateCar, deleteCar, getCarById }}>
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
