import type { BookingDraft, PricingBreakdown, RentalType, VehicleType } from "@/lib/types";

const chauffeurRates: Record<VehicleType, number> = {
  "5 Seater": 13,
  "7 Seater": 18,
  "7 Seater SUV": 22
};

const fallbackDailyRates: Record<VehicleType, number> = {
  "5 Seater": 2200,
  "7 Seater": 4200,
  "7 Seater SUV": 5000
};

export function getSelfDriveDiscount(days: number) {
  if (days >= 20) return 0.2;
  if (days >= 11) return 0.15;
  if (days >= 6) return 0.1;
  if (days >= 3) return 0.05;
  return 0;
}

export function getChauffeurRate(type: VehicleType) {
  return chauffeurRates[type];
}

export function getDefaultDailyRate(type: VehicleType) {
  return fallbackDailyRates[type];
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Math.round(amount));
}

export function calculatePricing(draft: BookingDraft): PricingBreakdown {
  const days = Math.max(1, Number(draft.days) || 1);
  const rentalType: RentalType = draft.rentalType;
  const dailyPrice = draft.vehicle?.dailyRentalPrice ?? getDefaultDailyRate(draft.vehicleType);
  const baseFare = dailyPrice * days;
  const discountRate = rentalType === "Self Drive" ? getSelfDriveDiscount(days) : 0;
  const discount = baseFare * discountRate;
  const effectiveKm =
    rentalType === "Chauffeur" ? Math.max(Number(draft.estimatedKm) || 0, 300 * days) : 0;
  const rate = getChauffeurRate(draft.vehicle?.type ?? draft.vehicleType);
  const driverCharges = rentalType === "Chauffeur" ? effectiveKm * rate : 0;
  const subtotal = baseFare - discount + driverCharges;

  return {
    baseFare,
    discountRate,
    discount,
    effectiveKm,
    driverCharges,
    taxes: 0,
    total: subtotal
  };
}
