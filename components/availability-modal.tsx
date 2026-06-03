"use client";

import { CheckCircle2, Fuel, Gauge, Users, X } from "lucide-react";
import type { Vehicle } from "@/lib/types";
import { formatCurrency } from "@/lib/pricing";

export function AvailabilityModal({
  vehicles,
  onClose,
  onSelect
}: {
  vehicles: Vehicle[];
  onClose: () => void;
  onSelect: (vehicle: Vehicle) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/60 p-3 backdrop-blur-sm sm:items-center">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-zinc-950">
        <div className="flex items-center justify-between border-b border-zinc-200 p-4 dark:border-zinc-800">
          <div>
            <p className="label">Available vehicles</p>
            <h2 className="text-xl font-black tracking-tight">Choose your ride</h2>
          </div>
          <button
            type="button"
            aria-label="Close availability modal"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-lg border border-zinc-200 dark:border-zinc-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid max-h-[75vh] gap-4 overflow-y-auto p-4 md:grid-cols-2">
          {vehicles.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700 md:col-span-2">
              <p className="text-lg font-bold">No matching vehicle is available right now.</p>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Try another vehicle type or rental date for the demo fleet.
              </p>
            </div>
          ) : (
            vehicles.map((vehicle) => {
              const cover = vehicle.images.find((image) => image.isCover) ?? vehicle.images[0];
              return (
                <article
                  key={vehicle.id}
                  className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div
                    className="h-48 bg-cover bg-center"
                    style={{ backgroundImage: `url(${cover.url})` }}
                    aria-label={cover.caption}
                  />
                  <div className="space-y-4 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-black">{vehicle.name}</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">{vehicle.description}</p>
                      </div>
                      <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-bold text-teal-800 dark:bg-teal-950 dark:text-teal-200">
                        Available
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <span className="flex items-center gap-1 rounded-lg bg-white p-2 dark:bg-zinc-950">
                        <Users className="h-4 w-4" /> {vehicle.seatingCapacity}
                      </span>
                      <span className="flex items-center gap-1 rounded-lg bg-white p-2 dark:bg-zinc-950">
                        <Fuel className="h-4 w-4" /> {vehicle.fuelType}
                      </span>
                      <span className="flex items-center gap-1 rounded-lg bg-white p-2 dark:bg-zinc-950">
                        <Gauge className="h-4 w-4" /> {vehicle.transmission}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="label">Starting price</p>
                        <p className="text-xl font-black">{formatCurrency(vehicle.dailyRentalPrice)}</p>
                      </div>
                      <button type="button" className="btn-primary" onClick={() => onSelect(vehicle)}>
                        <CheckCircle2 className="h-4 w-4" /> Select Vehicle
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
