import type { Booking } from "@/lib/types";
import { formatCurrency } from "@/lib/pricing";

export function buildWhatsAppMessage(booking: Booking) {
  return `Thank you for choosing SLNS Enterprises.

Booking ID: ${booking.id}
Vehicle: ${booking.vehicle?.name ?? "Vehicle pending"}
Rental Type: ${booking.rentalType}
Dates: ${booking.date} for ${booking.days} day${booking.days > 1 ? "s" : ""}
Total Amount: ${formatCurrency(booking.pricing.total)}

Your invoice is attached.

Have a safe journey.`;
}

export function getWhatsAppLink(booking: Booking) {
  return `https://wa.me/?text=${encodeURIComponent(buildWhatsAppMessage(booking))}`;
}
