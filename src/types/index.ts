export enum CarCondition {
  NEW = "New",
  USED_EXCELLENT = "Used - Excellent",
  USED_GOOD = "Used - Good",
  USED_FAIR = "Used - Fair",
}

export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  condition: CarCondition;
  features: string[];
  images: string[]; // Array of image URLs
  description: string; // This can be the AI-generated ad copy
  createdAt: number; // Timestamp
  updatedAt: number; // Timestamp
}

export type CarFilters = {
  make?: string;
  priceRange?: [number, number];
  condition?: CarCondition;
  searchTerm?: string;
};
