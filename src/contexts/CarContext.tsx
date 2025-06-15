
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useState, useContext, useEffect } from 'react';
import type { Car } from '@/types';
// Removed Firebase imports

// Example initial mock car data (can be empty)
const initialMockCars: Car[] = [
  // {
  //   id: '1',
  //   make: 'Toyota',
  //   model: 'Camry',
  //   year: 2022,
  //   price: 25000,
  //   mileage: 15000,
  //   condition: CarCondition.USED_EXCELLENT,
  //   features: ['Sunroof', 'Leather Seats', 'Navigation'],
  //   images: ['https://placehold.co/600x400.png?text=Toyota+Camry+1', 'https://placehold.co/600x400.png?text=Toyota+Camry+2'],
  //   description: 'A reliable and stylish sedan, perfect for families or commuting.',
  //   createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5, // 5 days ago
  //   updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
  // },
  // {
  //   id: '2',
  //   make: 'Honda',
  //   model: 'CR-V',
  //   year: 2021,
  //   price: 28000,
  //   mileage: 22000,
  //   condition: CarCondition.USED_GOOD,
  //   features: ['All-Wheel Drive', 'Apple CarPlay', 'Backup Camera'],
  //   images: ['https://placehold.co/600x400.png?text=Honda+CRV+1'],
  //   description: 'Spacious and versatile SUV, great for adventures.',
  //   createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10, // 10 days ago
  //   updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 3, // 3 days ago
  // },
];


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
  const [cars, setCars] = useState<Car[]>(initialMockCars);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay for mock data
    const timer = setTimeout(() => {
      // Sort initial cars by createdAt descending if needed, though initialMockCars can be pre-sorted
      setCars(prevCars => [...prevCars].sort((a, b) => b.createdAt - a.createdAt));
      setLoading(false);
    }, 500); // 0.5 second delay to simulate loading
    return () => clearTimeout(timer);
  }, []);

  const addCar = async (carData: Omit<Car, 'id' | 'createdAt' | 'updatedAt'>): Promise<Car | null> => {
    setLoading(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    try {
      const now = Date.now();
      const newCar: Car = {
        ...carData,
        id: Math.random().toString(36).substr(2, 9), // Generate a simple unique ID
        createdAt: now,
        updatedAt: now,
      };
      setCars(prevCars => [newCar, ...prevCars].sort((a, b) => b.createdAt - a.createdAt));
      setLoading(false);
      return newCar;
    } catch (error) {
      console.error("Error adding car (mock):", error);
      setLoading(false);
      return null;
    }
  };

  const updateCar = async (updatedCarData: Car): Promise<Car | null> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    try {
      const carWithTimestamp: Car = {
        ...updatedCarData,
        updatedAt: Date.now(),
      };
      setCars(prevCars =>
        prevCars.map(car => (car.id === carWithTimestamp.id ? carWithTimestamp : car))
        .sort((a,b) => b.createdAt - a.createdAt)
      );
      setLoading(false);
      return carWithTimestamp;
    } catch (error) {
      console.error("Error updating car (mock):", error);
      setLoading(false);
      return null;
    }
  };

  const deleteCar = async (carId: string): Promise<void> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    try {
      setCars(prevCars => prevCars.filter(car => car.id !== carId));
    } catch (error) {
      console.error("Error deleting car (mock):", error);
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
