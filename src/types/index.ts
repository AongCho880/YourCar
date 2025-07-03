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
  features: { value: string }[];
  images: string[]; // Array of image URLs
  description: string; // This can be the AI-generated ad copy
  isSold?: boolean; // Added isSold status
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
}

export type CarFilters = {
  make?: string;
  priceRange?: [number, number];
  condition?: CarCondition;
  searchTerm?: string;
};

export interface AdminContactSettings {
  whatsappNumber?: string;
  messengerId?: string;
  facebookPageLink?: string;
  updatedAt?: string; // ISO 8601 date string
}

export interface Complaint {
  id: string;
  name?: string;
  email?: string;
  details: string;
  submittedAt: string; // ISO 8601 date string
  isResolved?: boolean;
}

export interface Review {
  id: string;
  name: string;
  rating: number; // 1-5
  comment: string;
  email?: string;
  occupation?: string;
  submittedAt: string; // ISO 8601 date string
  isTestimonial: boolean;
  carId?: string; // Optional: if the review is about a specific car
  carMake?: string; // Optional: denormalized for easier display with testimonials
  carModel?: string; // Optional: denormalized
}

