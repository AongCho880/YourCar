
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
  isSold?: boolean; // Added isSold status
  createdAt: number; // Timestamp
  updatedAt: number; // Timestamp
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
  updatedAt?: number; // Timestamp
}

export interface Complaint {
  id: string;
  name?: string;
  email?: string;
  details: string;
  submittedAt: number; // Timestamp
  isResolved?: boolean;
}

export interface Review {
  id: string;
  name: string;
  rating: number; // 1-5
  comment: string;
  submittedAt: number; // Timestamp
  isTestimonial: boolean;
  carId?: string; // Optional: if the review is about a specific car
  carMake?: string; // Optional: denormalized for easier display with testimonials
  carModel?: string; // Optional: denormalized
}

