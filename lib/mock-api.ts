import type { Booking, BookingDraft, Vehicle } from "@/lib/types";
import { calculatePricing } from "@/lib/pricing";

export const vehicles: Vehicle[] = [
  {
    id: "veh-dzire",
    name: "Swift Dzire",
    type: "5 Seater",
    seatingCapacity: 5,
    fuelType: "Petrol",
    transmission: "Manual",
    dailyRentalPrice: 2200,
    chauffeurRatePerKm: 13,
    isAvailable: true,
    description: "Compact sedan with excellent mileage for city and highway trips.",
    images: [
      {
        id: "dzire-1",
        url: "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1200&q=80",
        caption: "Silver sedan exterior",
        isCover: true
      }
    ]
  },
  {
    id: "veh-innova",
    name: "Innova Crytsa",
    type: "7 Seater",
    seatingCapacity: 7,
    fuelType: "Diesel",
    transmission: "Manual",
    dailyRentalPrice: 4200,
    chauffeurRatePerKm: 18,
    isAvailable: true,
    description: "Spacious MPV for family tours, airport transfers, and outstation travel.",
    images: [
      {
        id: "innova-1",
        url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80",
        caption: "Premium seven seater",
        isCover: true
      }
    ]
  },
  {
    id: "veh-glanza",
    name: "Toyota Glanza",
    type: "5 Seater",
    seatingCapacity: 5,
    fuelType: "Petrol",
    transmission: "Automatic",
    dailyRentalPrice: 2500,
    chauffeurRatePerKm: 13,
    isAvailable: true,
    description: "Smooth hatchback with automatic transmission for effortless drives.",
    images: [
      {
        id: "glanza-1",
        url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
        caption: "Automatic hatchback",
        isCover: true
      }
    ]
  },
  {
    id: "veh-baleno",
    name: "Suzuki Baleno",
    type: "7 Seater SUV",
    seatingCapacity: 7,
    fuelType: "Hybrid",
    transmission: "Automatic",
    dailyRentalPrice: 5000,
    chauffeurRatePerKm: 22,
    isAvailable: false,
    description: "Premium SUV category vehicle configured for comfort-focused travel.",
    images: [
      {
        id: "baleno-1",
        url: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80",
        caption: "SUV cover image",
        isCover: true
      }
    ]
  }
];

const wait = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));
const fleetStorageKey = "slns-fleet";

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function loadFleet(): Vehicle[] {
  if (!canUseStorage()) return vehicles;

  const stored = window.localStorage.getItem(fleetStorageKey);
  if (!stored) return vehicles;

  try {
    return JSON.parse(stored) as Vehicle[];
  } catch {
    return vehicles;
  }
}

export function saveFleet(fleet: Vehicle[]) {
  if (canUseStorage()) {
    window.localStorage.setItem(fleetStorageKey, JSON.stringify(fleet));
  }
}

export async function fetchVehicles() {
  await wait();
  return loadFleet();
}

export async function fetchAvailableVehicles(type: string) {
  await wait();
  return loadFleet().filter((vehicle) => vehicle.type === type && vehicle.isAvailable);
}

export function createBooking(draft: BookingDraft): Booking {
  const id = `SLNS-${Date.now().toString().slice(-6)}`;
  return {
    ...draft,
    id,
    invoiceNumber: `INV-${new Date().getFullYear()}-${id.slice(-4)}`,
    pricing: calculatePricing(draft),
    createdAt: new Date().toISOString()
  };
}

export function saveBooking(booking: Booking) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("slns-booking", JSON.stringify(booking));
  }
}

export function loadBooking(): Booking | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem("slns-booking");
  if (!stored) return null;

  const booking = JSON.parse(stored) as Booking;
  return {
    ...booking,
    pricing: calculatePricing(booking)
  };
}
