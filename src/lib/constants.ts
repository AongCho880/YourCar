import { CarCondition } from "@/types";

export const CAR_MAKES: string[] = [
  "Toyota",
  "Honda",
  "Ford",
  "BMW",
  "Mercedes-Benz",
  "Audi",
  "Nissan",
  "Volkswagen",
  "Hyundai",
  "Kia",
  "Subaru",
  "Mazda",
  "Lexus",
  "Chevrolet",
  "Jeep",
  "Volvo",
  "Porsche",
  "Land Rover",
  "Jaguar",
  "Tesla",
];

export const CAR_CONDITIONS: { value: CarCondition; label: string }[] = [
  { value: CarCondition.NEW, label: "New" },
  { value: CarCondition.USED_EXCELLENT, label: "Used - Excellent" },
  { value: CarCondition.USED_GOOD, label: "Used - Good" },
  { value: CarCondition.USED_FAIR, label: "Used - Fair" },
];

export const MAX_IMAGE_UPLOADS = 5;
export const DEFAULT_MIN_PRICE = 0;
export const DEFAULT_MAX_PRICE = 200000;
