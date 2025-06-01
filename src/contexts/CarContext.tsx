
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

const sampleCarImageUrls: string[] = [
  "https://media.gettyimages.com/id/1399903080/photo/generic-modern-suv-car-in-concrete-garage.jpg?s=612x612&w=0&k=20&c=i2H2E5HSCeGkRf7f91J2x57t89LAKL_kPqFjV1x_9uA=",
  "https://media.gettyimages.com/id/1165353017/photo/generic-silver-car-on-a-white-background.jpg?s=612x612&w=0&k=20&c=tKNI_Yc9lyRSiW_1_C7kSg2R_Q9QDN5k4xzsDHY50zY=",
  "https://media.gettyimages.com/id/172307117/photo/red-sports-car.jpg?s=612x612&w=0&k=20&c=_QxKkP_ecqX0B_JgAAnvR3qgL871cZgbrqSVOo_R-M0=",
  "https://media.gettyimages.com/id/1322370607/photo/generic-modern-van-on-a-white-background-side-view.jpg?s=612x612&w=0&k=20&c=tU98QhRzHq2gKk6_kZJEa8yPDRdDEo_Hh8o-Qx1xT4M=",
  "https://media.gettyimages.com/id/1193743434/photo/generic-red-suv-on-a-white-background-side-view.jpg?s=612x612&w=0&k=20&c=_E2oQoutYvyPFW0WBT69IWIsaJg4M7tMIs7uq_8rS7Q=",
  "https://media.gettyimages.com/id/1307083013/photo/white-passenger-van.jpg?s=612x612&w=0&k=20&c=YhP-DBV8sEY3IKTVFCVz_nJdJZRBTqKjWzYjKhvIqKI=",
  "https://media.gettyimages.com/id/1442489056/photo/sedan-car-on-the-road.jpg?s=612x612&w=0&k=20&c=Yc5gLhAZYyChQyHGDYw90yK57x0249zYkMWxmdvU304=",
  "https://media.gettyimages.com/id/1344699548/photo/modern-generic-car-on-white-background-side-view.jpg?s=612x612&w=0&k=20&c=Z_Fk_s2xHh81HCTBwzZ3Ygof_zssX9qA9LVN3lvTj2Q=",
  "https://media.gettyimages.com/id/1359025256/photo/blue-hatchback-car.jpg?s=612x612&w=0&k=20&c=vN2D_c3m0y4Q_4_1hP7rWJ2zLzH1-X-X0F8U9n9qD_E=",
  "https://media.gettyimages.com/id/1272176247/photo/black-modern-car.jpg?s=612x612&w=0&k=20&c=qH4vHAb2_sQIx6VBDxK2Y1FuaJe2OlXQ_0U1YxU-gRw=",
];

const generateMockImages = (count: number): string[] => {
  const selectedImages: string[] = [];
  if (sampleCarImageUrls.length === 0) { // Fallback if sample list is empty
      return Array.from({ length: count }, () => `https://placehold.co/600x400.png`);
  }
  for (let i = 0; i < count; i++) {
    selectedImages.push(getRandomElement(sampleCarImageUrls));
  }
  return selectedImages;
};


const initialCarsData: Car[] = Array.from({ length: 15 }, (_, i) => {
  const make = getRandomElement(CAR_MAKES);
  const model = `${getRandomElement(["Sedan", "SUV", "Truck", "Hatchback", "Coupe", "Minivan"])} ${String.fromCharCode(65 + i % 10)}${getRandomNumber(1,5)}`; // e.g. Sedan A1
  const year = getRandomNumber(2010, 2024);
  const price = getRandomNumber(5000, 75000);
  const mileage = getRandomNumber(5000, 150000);
  const condition = getRandomElement(CAR_CONDITIONS).value;
  
  return {
    id: `car_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 7)}`,
    make,
    model,
    year,
    price,
    mileage,
    condition,
    features: generateMockFeatures(),
    images: generateMockImages(getRandomNumber(1, 3)),
    description: `This is a fantastic ${year} ${make} ${model}. It's in ${condition.toLocaleLowerCase()} condition with ${mileage.toLocaleString()} miles. Priced at $${price.toLocaleString()}, it comes with features like ${generateMockFeatures().slice(0,2).join(', ')}. A great deal!`,
    createdAt: Date.now() - (i * 1000 * 60 * 60 * 24 * getRandomNumber(1,5)), // Stagger creation time more
    updatedAt: Date.now() - (i * 1000 * 60 * 60 * getRandomNumber(1,12)),
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
    setCars(prevCars => [newCar, ...prevCars].sort((a, b) => b.createdAt - a.createdAt));
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
      }).sort((a,b) => b.createdAt - a.createdAt)
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

