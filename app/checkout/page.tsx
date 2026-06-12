"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { loadBooking, saveBooking, saveBookingRequest } from "@/lib/mock-api";
import { formatCurrency, getChauffeurRate } from "@/lib/pricing";
import type { Booking } from "@/lib/types";

export default function CheckoutPage() {
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => setBooking(loadBooking()), []);

  if (!booking) {
    return (
      <AppShell>
        <div className="glass-panel rounded-2xl p-8 text-center">
          <h1 className="text-2xl font-black">No booking selected</h1>
          <Link className="btn-primary mt-5" href="/dashboard">Start Booking</Link>
        </div>
      </AppShell>
    );
  }

  function confirmBooking() {
    if (booking) {
      saveBooking(booking);
      saveBookingRequest(booking);
    }
    router.push("/invoice");
  }

  const rows = [
    ["Customer", `${booking.customer.name} / ${booking.customer.mobile}`],
    ["Vehicle Selected", booking.vehicle?.name ?? "Not selected"],
    ["Rental Type", booking.rentalType],
    ["Date", booking.date],
    ["Number Of Days", `${booking.days}`],
    ["Estimated KM", booking.rentalType === "Chauffeur" ? `${booking.estimatedKm} km` : "Not applicable"],
    ["Effective KM", booking.rentalType === "Chauffeur" ? `${booking.pricing.effectiveKm} km` : "Not applicable"],
    ["Chauffeur Rate", booking.rentalType === "Chauffeur" ? `${formatCurrency(getChauffeurRate(booking.vehicle?.type ?? booking.vehicleType))}/km` : "Not applicable"],
    ["Base Fare", formatCurrency(booking.pricing.baseFare)],
    ["Discount", `-${formatCurrency(booking.pricing.discount)}`],
    ["Chauffeur Charges", formatCurrency(booking.pricing.driverCharges)]
  ];

  return (
    <AppShell>
      <section className="glass-panel rounded-2xl p-5 sm:p-7">
        <p className="label">Checkout</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">Review booking summary</h1>
        <div className="mt-7 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
          {rows.map(([label, value]) => (
            <div key={label} className="grid gap-1 border-b border-zinc-200 p-4 last:border-b-0 dark:border-zinc-800 sm:grid-cols-[220px_1fr]">
              <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400">{label}</p>
              <p className="font-semibold">{value}</p>
            </div>
          ))}
          <div className="grid gap-1 bg-zinc-950 p-4 text-white sm:grid-cols-[220px_1fr]">
            <p className="text-sm font-bold text-zinc-300">Total Amount</p>
            <p className="text-2xl font-black">{formatCurrency(booking.pricing.total)}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link className="btn-secondary" href="/dashboard"><Pencil className="h-4 w-4" /> Edit Booking</Link>
          <button type="button" className="btn-primary" onClick={confirmBooking}><Check className="h-4 w-4" /> Confirm Booking</button>
        </div>
      </section>
    </AppShell>
  );
}
