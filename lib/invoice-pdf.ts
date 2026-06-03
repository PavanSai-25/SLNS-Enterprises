import type { Booking } from "@/lib/types";

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function money(amount: number) {
  return `Rs. ${Math.round(amount).toLocaleString("en-IN")}`;
}

function invoiceLines(booking: Booking) {
  return [
    "SLNS Enterprises",
    "Car Rental Invoice",
    "",
    `Booking ID: ${booking.id}`,
    `Invoice Number: ${booking.invoiceNumber}`,
    `Issued: ${new Date(booking.createdAt).toLocaleDateString("en-IN")}`,
    "",
    "Customer Details",
    `Name: ${booking.customer.name}`,
    `Mobile: ${booking.customer.mobile}`,
    `Email: ${booking.customer.email}`,
    "",
    "Vehicle Details",
    `Vehicle: ${booking.vehicle?.name ?? "Vehicle pending"}`,
    `Type: ${booking.vehicle?.type ?? booking.vehicleType}`,
    `Rental Type: ${booking.rentalType}`,
    `Date: ${booking.date}`,
    `Days: ${booking.days}`,
    booking.rentalType === "Chauffeur" ? `Estimated KM: ${booking.estimatedKm}` : "Estimated KM: Not applicable",
    booking.rentalType === "Chauffeur" ? `Effective KM: ${booking.pricing.effectiveKm}` : "Effective KM: Not applicable",
    "",
    "Fare Breakdown",
    `Base Fare: ${money(booking.pricing.baseFare)}`,
    `Discount: -${money(booking.pricing.discount)}`,
    `Chauffeur Charges: ${money(booking.pricing.driverCharges)}`,
    `Taxes: ${money(0)}`,
    "",
    `Grand Total: ${money(booking.pricing.total)}`,
    "",
    "Toll charges extra. Fuel charges extra for chauffeur bookings.",
    "Thank you for choosing SLNS Enterprises. Have a safe journey."
  ];
}

export function createInvoicePdfBlob(booking: Booking) {
  const lines = invoiceLines(booking);
  const textCommands = lines
    .map((line, index) => {
      const fontSize = index === 0 ? 22 : index === 1 ? 14 : line.startsWith("Grand Total") ? 16 : 11;
      const y = 780 - index * 22;
      return `BT /F1 ${fontSize} Tf 54 ${y} Td (${escapePdfText(line)}) Tj ET`;
    })
    .join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${textCommands.length} >>\nstream\n${textCommands}\nendstream`
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}

export function invoicePdfFileName(booking: Booking) {
  return `${booking.invoiceNumber}.pdf`;
}

export function createInvoicePdfFile(booking: Booking) {
  return new File([createInvoicePdfBlob(booking)], invoicePdfFileName(booking), {
    type: "application/pdf"
  });
}

export function downloadInvoicePdf(booking: Booking) {
  const url = URL.createObjectURL(createInvoicePdfBlob(booking));
  const link = document.createElement("a");
  link.href = url;
  link.download = invoicePdfFileName(booking);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
