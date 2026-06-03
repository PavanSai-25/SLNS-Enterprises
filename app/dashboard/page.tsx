"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Route, Search, ShieldCheck, UserRound } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AvailabilityModal } from "@/components/availability-modal";
import { MetricCard } from "@/components/metric-card";
import { createBooking, fetchAvailableVehicles, saveBooking } from "@/lib/mock-api";
import { calculatePricing, formatCurrency, getChauffeurRate } from "@/lib/pricing";
import type { BookingDraft, RentalType, Vehicle, VehicleType } from "@/lib/types";

const vehicleTypes: VehicleType[] = ["5 Seater", "7 Seater", "7 Seater SUV"];
const rentalTypes: RentalType[] = ["Self Drive", "Chauffeur"];

export default function CustomerDashboard() {
  const router = useRouter();
  const [draft, setDraft] = useState<BookingDraft>({
    customer: { name: "Demo Customer", mobile: "9876543210", email: "customer@slns.demo" },
    vehicleType: "5 Seater",
    date: new Date().toISOString().slice(0, 10),
    days: 2,
    rentalType: "Self Drive",
    estimatedKm: 600
  });
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const previewPricing = useMemo(() => calculatePricing(draft), [draft]);

  useEffect(() => {
    const stored = window.localStorage.getItem("slns-customer");
    if (!stored) return;

    try {
      setDraft((current) => ({ ...current, customer: JSON.parse(stored) }));
    } catch {
      window.localStorage.removeItem("slns-customer");
    }
  }, []);

  async function checkAvailability() {
    setAvailableVehicles(await fetchAvailableVehicles(draft.vehicleType));
    setModalOpen(true);
  }

  function selectVehicle(vehicle: Vehicle) {
    const booking = createBooking({ ...draft, vehicle });
    saveBooking(booking);
    router.push("/checkout");
  }

  return (
    <AppShell>
      <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <section className="glass-panel rounded-2xl p-5 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="label">Customer dashboard</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Plan a rental</h1>
            </div>
            <ShieldCheck className="h-9 w-9 text-teal-700" />
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <label>
              <span className="label">Customer name</span>
              <input className="field mt-2" value={draft.customer.name} onChange={(event) => setDraft({ ...draft, customer: { ...draft.customer, name: event.target.value } })} />
            </label>
            <label>
              <span className="label">Mobile number</span>
              <input className="field mt-2" inputMode="tel" value={draft.customer.mobile} onChange={(event) => setDraft({ ...draft, customer: { ...draft.customer, mobile: event.target.value } })} />
            </label>
            <label className="sm:col-span-2">
              <span className="label">Email address</span>
              <input className="field mt-2" type="email" value={draft.customer.email} onChange={(event) => setDraft({ ...draft, customer: { ...draft.customer, email: event.target.value } })} />
            </label>
            <label>
              <span className="label">Select vehicle type</span>
              <select className="field mt-2" value={draft.vehicleType} onChange={(event) => setDraft({ ...draft, vehicleType: event.target.value as VehicleType })}>
                {vehicleTypes.map((type) => <option key={type}>{type}</option>)}
              </select>
            </label>
            <label>
              <span className="label">Date picker</span>
              <input className="field mt-2" type="date" value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} />
            </label>
            <label>
              <span className="label">Number of days</span>
              <input className="field mt-2" type="number" min={1} value={draft.days} onChange={(event) => setDraft({ ...draft, days: Math.max(1, Number(event.target.value) || 1) })} />
            </label>
            <label>
              <span className="label">Rental type</span>
              <select className="field mt-2" value={draft.rentalType} onChange={(event) => setDraft({ ...draft, rentalType: event.target.value as RentalType })}>
                {rentalTypes.map((type) => <option key={type}>{type}</option>)}
              </select>
            </label>
            {draft.rentalType === "Chauffeur" && (
              <label className="sm:col-span-2">
                <span className="label">Estimated KM</span>
                <input className="field mt-2" type="number" min={0} value={draft.estimatedKm} onChange={(event) => setDraft({ ...draft, estimatedKm: Math.max(0, Number(event.target.value) || 0) })} />
              </label>
            )}
          </div>

          <button type="button" className="btn-primary mt-6 w-full sm:w-auto" onClick={checkAvailability}>
            <Search className="h-4 w-4" /> Check Availability
          </button>
        </section>

        <aside className="space-y-4">
          <MetricCard label="Self drive preview" value={formatCurrency(previewPricing.baseFare - previewPricing.discount)} detail={`${Math.round(previewPricing.discountRate * 100)}% duration discount applied`} />
          <MetricCard label="Chauffeur rate" value={`${formatCurrency(getChauffeurRate(draft.vehicleType))}/km`} detail="Minimum 300 km per day, toll and fuel extra" />
          {draft.rentalType === "Chauffeur" && (
            <div className="glass-panel rounded-xl p-4">
              <Route className="h-8 w-8 text-teal-700" />
              <p className="label mt-3">Trip calculation</p>
              <p className="mt-2 text-2xl font-black">{formatCurrency(previewPricing.driverCharges)}</p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Effective KM: {previewPricing.effectiveKm} km. Trip cost excludes toll and fuel charges.
              </p>
            </div>
          )}
          <div className="glass-panel rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-8 w-8 text-amber-500" />
              <UserRound className="h-8 w-8 text-teal-700" />
            </div>
            <h2 className="mt-4 text-xl font-black">Transparent pricing rules</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              Self drive discounts scale up to 20%. Chauffeur bookings automatically use the greater of entered kilometres or 300 km per day.
            </p>
          </div>
        </aside>
      </div>

      {modalOpen && <AvailabilityModal vehicles={availableVehicles} onClose={() => setModalOpen(false)} onSelect={selectVehicle} />}
    </AppShell>
  );
}
