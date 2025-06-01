
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useState, useContext, useEffect } from 'react';
import type { Car, CarCondition } from '@/types';
import { CAR_MAKES, CAR_CONDITIONS } from '@/lib/constants';

// Helper to generate diverse mock data
const getRandomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomNumber = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

const generateMockFeatures = (): string[] => {
  const allFeatures = ["Sunroof", "Leather Seats", "Navigation System", "Backup Camera", "Bluetooth", "Apple CarPlay", "Android Auto", "Heated Seats", "Alloy Wheels", "Premium Sound System"];
  const numFeatures = getRandomNumber(2, 5);
  const features: string[] = [];
  while (features.length < numFeatures) {
    const feature = getRandomElement(allFeatures);
    if (!features.includes(feature)) {
      features.push(feature);
    }
  }
  return features;
};

const generateMockImages = (count: number): string[] => {
  return Array.from({ length: count }, (_, i) => `https://placehold.co/600x400.png`);
};


const initialCarsData: Car[] = Array.from({ length: 15 }, (_, i) => {
  const make = getRandomElement(CAR_MAKES);
  const model = `${getRandomElement(["Sedan", "SUV", "Truck", "Hatchback"])} ${String.fromCharCode(65 + i % 5)}${i + 1}`; // e.g. Sedan A1
  const year = getRandomNumber(2010, 2024);
  const price = getRandomNumber(5000, 75000);
  const mileage = getRandomNumber(5000, 150000);
  const condition = getRandomElement(CAR_CONDITIONS).value;
  
  return {
    id: `car_${Date.now()}_${i}`,
    make,
    model,
    year,
    price,
    mileage,
    condition,
    features: generateMockFeatures(),
    images: generateMockImages(getRandomNumber(1, 3)),
    description: `This is a fantastic ${year} ${make} ${model}. It's in ${condition.toLocaleLowerCase()} condition with ${mileage.toLocaleString()} miles. Priced at $${price.toLocaleString()}, it comes with features like ${generateMockFeatures().slice(0,2).join(', ')}. A great deal!`,
    createdAt: Date.now() - (i * 1000 * 60 * 60 * 24), // Stagger creation time
    updatedAt: Date.now() - (i * 1000 * 60 * 60 * 24),
  };
});


interface CarContextType {
  cars: Car[];
  loading: boolean;
  addCar: (carData: Omit<Car, 'id' | 'createdAt' | 'updatedAt'>) => Car;
  updateCar: (carData: Car) => Car | undefined;
  deleteCar: (carId: string) => void;
  getCarById: (carId: string) => Car | undefined;
}

const CarContext = createContext<CarContextType | undefined>(undefined);

export const CarProvider = ({ children }: { children: ReactNode }) => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    setCars(initialCarsData);
    setLoading(false);
  }, []);

  const addCar = (carData: Omit<Car, 'id' | 'createdAt' | 'updatedAt'>): Car => {
    const newCar: Car = {
      ...carData,
      id: `car_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setCars(prevCars => [newCar, ...prevCars]);
    return newCar;
  };

  const updateCar = (updatedCarData: Car): Car | undefined => {
    let updatedCar: Car | undefined;
    setCars(prevCars =>
      prevCars.map(car => {
        if (car.id === updatedCarData.id) {
          updatedCar = { ...updatedCarData, updatedAt: Date.now() };
          return updatedCar;
        }
        return car;
      })
    );
    return updatedCar;
  };

  const deleteCar = (carId: string) => {
    setCars(prevCars => prevCars.filter(car => car.id !== carId));
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
