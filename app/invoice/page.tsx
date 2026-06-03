"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Download, MessageCircle, Send } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { createInvoicePdfFile, downloadInvoicePdf } from "@/lib/invoice-pdf";
import { loadBooking } from "@/lib/mock-api";
import { formatCurrency, getChauffeurRate } from "@/lib/pricing";
import { buildWhatsAppMessage, getWhatsAppLink } from "@/lib/whatsapp";
import type { Booking } from "@/lib/types";

export default function InvoicePage() {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => setBooking(loadBooking()), []);

  if (!booking) {
    return (
      <AppShell>
        <div className="glass-panel rounded-2xl p-8 text-center">
          <h1 className="text-2xl font-black">Invoice will appear after checkout.</h1>
          <Link className="btn-primary mt-5" href="/dashboard">Create Booking</Link>
        </div>
      </AppShell>
    );
  }

  async function shareInvoice() {
    if (!booking) return;

    const file = createInvoicePdfFile(booking);
    const text = buildWhatsAppMessage(booking);
    const shareData: ShareData = {
      title: "SLNS Invoice",
      text,
      files: [file]
    };
    const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean };

    if (nav.canShare?.(shareData)) {
      await navigator.share(shareData);
      setNotice("Invoice PDF and booking details shared.");
      return;
    }

    downloadInvoicePdf(booking);
    setNotice("PDF downloaded. This browser cannot attach files through Share, so attach the downloaded invoice manually.");
  }

  async function sendToWhatsApp() {
    if (!booking) return;

    const file = createInvoicePdfFile(booking);
    const text = buildWhatsAppMessage(booking);
    const shareData: ShareData = {
      title: "SLNS Invoice",
      text,
      files: [file]
    };
    const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean };

    if (nav.canShare?.(shareData)) {
      await navigator.share(shareData);
      setNotice("Choose WhatsApp to send the booking details with the invoice PDF attached.");
      return;
    }

    downloadInvoicePdf(booking);
    window.open(getWhatsAppLink(booking), "_blank", "noopener,noreferrer");
    setNotice("PDF downloaded and WhatsApp opened with booking details. Attach the downloaded PDF if WhatsApp Web does not attach it automatically.");
  }

  return (
    <AppShell>
      <section className="rounded-2xl bg-white p-5 shadow-2xl dark:bg-zinc-950 sm:p-8">
        <div className="flex flex-col gap-5 border-b border-zinc-200 pb-6 dark:border-zinc-800 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="label">Professional invoice</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">SLNS Enterprises</h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Car rental booking invoice and confirmation</p>
          </div>
          <div className="text-sm sm:text-right">
            <p><strong>Booking ID:</strong> {booking.id}</p>
            <p><strong>Invoice Number:</strong> {booking.invoiceNumber}</p>
            <p><strong>Issued:</strong> {new Date(booking.createdAt).toLocaleDateString("en-IN")}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <p className="label">Customer Details</p>
            <p className="mt-3 font-bold">{booking.customer.name}</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{booking.customer.mobile}</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{booking.customer.email}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <p className="label">Vehicle Details</p>
            <p className="mt-3 font-bold">{booking.vehicle?.name}</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{booking.vehicle?.type} / {booking.vehicle?.fuelType} / {booking.vehicle?.transmission}</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{booking.date} / {booking.days} day(s) / {booking.rentalType}</p>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
          {[
            ["Base Fare", formatCurrency(booking.pricing.baseFare)],
            ["Discount", `-${formatCurrency(booking.pricing.discount)}`],
            ["Effective KM", booking.rentalType === "Chauffeur" ? `${booking.pricing.effectiveKm} km` : "Not applicable"],
            ["Chauffeur Rate", booking.rentalType === "Chauffeur" ? `${formatCurrency(getChauffeurRate(booking.vehicle?.type ?? booking.vehicleType))}/km` : "Not applicable"],
            ["Chauffeur Charges", formatCurrency(booking.pricing.driverCharges)],
            ["Grand Total", formatCurrency(booking.pricing.total)]
          ].map(([label, value], index, arr) => (
            <div key={label} className={`grid grid-cols-2 p-4 ${index === arr.length - 1 ? "bg-teal-700 text-white" : "border-b border-zinc-200 dark:border-zinc-800"}`}>
              <p className="font-bold">{label}</p>
              <p className="text-right font-black">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl bg-zinc-100 p-4 text-sm dark:bg-zinc-900">
          <p className="font-bold">WhatsApp message preview</p>
          <pre className="mt-3 whitespace-pre-wrap font-sans text-zinc-600 dark:text-zinc-300">{buildWhatsAppMessage(booking)}</pre>
        </div>

        {notice && (
          <p className="mt-4 rounded-xl bg-teal-50 p-3 text-sm font-semibold text-teal-900 dark:bg-teal-950/40 dark:text-teal-100">
            {notice}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button type="button" className="btn-secondary" onClick={() => downloadInvoicePdf(booking)}><Download className="h-4 w-4" /> Download PDF</button>
          <button type="button" className="btn-secondary" onClick={() => void shareInvoice()}><Send className="h-4 w-4" /> Share Invoice</button>
          <button type="button" className="btn-primary" onClick={() => void sendToWhatsApp()}><MessageCircle className="h-4 w-4" /> Send To WhatsApp</button>
        </div>
      </section>
    </AppShell>
  );
}
