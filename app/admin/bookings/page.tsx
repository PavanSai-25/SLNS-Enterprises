"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, CheckCircle2, Clock3, IndianRupee, XCircle } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { getCurrentUser } from "@/lib/client-auth";
import { loadBookingRequests, updateBookingRequestStatus } from "@/lib/mock-api";
import { formatCurrency } from "@/lib/pricing";
import type { BookingRequest, BookingStatus } from "@/lib/types";

const statuses: BookingStatus[] = ["Requested", "Confirmed", "Completed", "Cancelled"];

export default function AdminBookingsPage() {
  const router = useRouter();
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [bookings, setBookings] = useState<BookingRequest[]>([]);

  const stats = useMemo(
    () => ({
      requested: bookings.filter((booking) => booking.status === "Requested").length,
      confirmed: bookings.filter((booking) => booking.status === "Confirmed").length,
      revenue: bookings
        .filter((booking) => booking.status !== "Cancelled")
        .reduce((sum, booking) => sum + booking.pricing.total, 0)
    }),
    [bookings]
  );

  useEffect(() => {
    let cancelled = false;

    async function checkAccess() {
      const user = await getCurrentUser();
      const hasAdminAccess = user?.role === "admin";

      if (cancelled) return;
      setAuthorized(hasAdminAccess);
      setCheckingAccess(false);

      if (!hasAdminAccess) {
        router.replace("/dashboard");
        return;
      }

      setBookings(loadBookingRequests());
    }

    void checkAccess();

    return () => {
      cancelled = true;
    };
  }, [router]);

  function changeStatus(id: string, status: BookingStatus) {
    setBookings(updateBookingRequestStatus(id, status));
  }

  if (checkingAccess || !authorized) {
    return (
      <AppShell>
        <div className="glass-panel rounded-2xl p-8 text-center">
          <p className="label">Access restricted</p>
          <h1 className="mt-2 text-2xl font-black">Admin login required</h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Booking requests are available only to SLNS admin users.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-5">
        <section className="glass-panel rounded-2xl p-5 sm:p-7">
          <div>
            <p className="label">Admin dashboard</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">Booking Requests</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              Review customer booking requests, confirm trips, mark completed rides, or cancel requests that cannot be served.
            </p>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <BookingStat icon={<Clock3 className="h-5 w-5" />} label="Requested" value={String(stats.requested)} />
            <BookingStat icon={<CheckCircle2 className="h-5 w-5" />} label="Confirmed" value={String(stats.confirmed)} />
            <BookingStat icon={<IndianRupee className="h-5 w-5" />} label="Active Value" value={formatCurrency(stats.revenue)} />
          </div>
        </section>

        {bookings.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center shadow-xl dark:border-zinc-700 dark:bg-zinc-950">
            <CalendarDays className="mx-auto h-10 w-10 text-teal-700" />
            <h2 className="mt-4 text-2xl font-black">No booking requests yet</h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Customer requests will appear here after they confirm a booking from checkout.
            </p>
          </section>
        ) : (
          <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1040px] text-left text-sm">
                <thead className="bg-zinc-100 text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                  <tr>
                    <th className="p-4">Booking</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Vehicle</th>
                    <th className="p-4">Trip</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="border-t border-zinc-200 align-top dark:border-zinc-800">
                      <td className="p-4">
                        <p className="font-black">{booking.id}</p>
                        <p className="text-xs text-zinc-500">{booking.invoiceNumber}</p>
                        <p className="mt-1 text-xs text-zinc-500">{new Date(booking.createdAt).toLocaleString("en-IN")}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-bold">{booking.customer.name}</p>
                        <p className="text-xs text-zinc-500">{booking.customer.mobile}</p>
                        <p className="text-xs text-zinc-500">{booking.customer.email}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-bold">{booking.vehicle?.name ?? "Vehicle pending"}</p>
                        <p className="text-xs text-zinc-500">{booking.vehicleType}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-bold">{booking.rentalType}</p>
                        <p className="text-xs text-zinc-500">{booking.date} / {booking.days} day(s)</p>
                        <p className="text-xs text-zinc-500">
                          {booking.rentalType === "Chauffeur" ? `${booking.pricing.effectiveKm} effective km` : "Self drive"}
                        </p>
                      </td>
                      <td className="p-4 font-black">{formatCurrency(booking.pricing.total)}</td>
                      <td className="p-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-black ${statusClassName(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          {statuses.map((status) => (
                            <button
                              key={status}
                              type="button"
                              disabled={booking.status === status}
                              onClick={() => changeStatus(booking.id, status)}
                              className="rounded-lg border border-zinc-200 px-3 py-2 text-xs font-bold transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:bg-teal-700 disabled:text-white dark:border-zinc-800 dark:hover:bg-zinc-900"
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}

function BookingStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-2 text-teal-700">{icon}<p className="label">{label}</p></div>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}

function statusClassName(status: BookingStatus) {
  if (status === "Confirmed") return "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-100";
  if (status === "Completed") return "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-100";
  if (status === "Cancelled") return "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-100";
  return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-100";
}
