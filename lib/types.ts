export type VehicleType = "5 Seater" | "7 Seater" | "7 Seater SUV";
export type RentalType = "Self Drive" | "Chauffeur";
export type FuelType = "Petrol" | "Diesel" | "Hybrid";
export type Transmission = "Manual" | "Automatic";

export interface VehicleImage {
  id: string;
  url: string;
  caption: string;
  isCover: boolean;
}

export interface Vehicle {
  id: string;
  name: string;
  type: VehicleType;
  seatingCapacity: number;
  fuelType: FuelType;
  transmission: Transmission;
  dailyRentalPrice: number;
  chauffeurRatePerKm: number;
  isAvailable: boolean;
  description: string;
  images: VehicleImage[];
}

export interface CustomerDetails {
  name: string;
  mobile: string;
  email: string;
}

export interface BookingDraft {
  customer: CustomerDetails;
  vehicleType: VehicleType;
  date: string;
  days: number;
  rentalType: RentalType;
  estimatedKm: number;
  vehicle?: Vehicle;
}

export interface PricingBreakdown {
  baseFare: number;
  discountRate: number;
  discount: number;
  effectiveKm: number;
  driverCharges: number;
  taxes: number;
  total: number;
}

export interface Booking extends BookingDraft {
  id: string;
  invoiceNumber: string;
  pricing: PricingBreakdown;
  createdAt: string;
}
