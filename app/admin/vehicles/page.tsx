"use client";

import { ChangeEvent, DragEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Check, GripVertical, ImagePlus, Pencil, Plus, Trash2, UploadCloud, X } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { getCurrentUser } from "@/lib/client-auth";
import { loadFleet, saveFleet, vehicles as seedVehicles } from "@/lib/mock-api";
import { formatCurrency } from "@/lib/pricing";
import type { FuelType, Transmission, Vehicle, VehicleImage, VehicleType } from "@/lib/types";

const acceptedTypes = ["image/jpeg", "image/png", "image/webp"];
const emptyVehicle: Vehicle = {
  id: "",
  name: "",
  type: "5 Seater",
  seatingCapacity: 5,
  fuelType: "Petrol",
  transmission: "Manual",
  dailyRentalPrice: 2200,
  chauffeurRatePerKm: 13,
  isAvailable: true,
  description: "",
  images: []
};

export default function VehicleManagementPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [fleet, setFleet] = useState<Vehicle[]>(seedVehicles);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [galleryVehicle, setGalleryVehicle] = useState<Vehicle | null>(null);
  const stats = useMemo(
    () => ({
      total: fleet.length,
      available: fleet.filter((vehicle) => vehicle.isAvailable).length,
      images: fleet.reduce((sum, vehicle) => sum + vehicle.images.length, 0)
    }),
    [fleet]
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

      setFleet(loadFleet());
    }

    void checkAccess();

    return () => {
      cancelled = true;
    };
  }, [router]);

  function persistFleet(updater: (current: Vehicle[]) => Vehicle[]) {
    setFleet((current) => {
      const next = updater(current);
      saveFleet(next);
      return next;
    });
  }

  function saveVehicle(vehicle: Vehicle) {
    const prepared = {
      ...vehicle,
      id: vehicle.id || `veh-${Date.now()}`,
      seatingCapacity: vehicle.type === "5 Seater" ? 5 : 7,
      images: ensureCover(vehicle.images)
    };
    persistFleet((current) =>
      current.some((item) => item.id === prepared.id)
        ? current.map((item) => (item.id === prepared.id ? prepared : item))
        : [prepared, ...current]
    );
    setEditing(null);
    setGalleryVehicle(null);
  }

  if (checkingAccess || !authorized) {
    return (
      <AppShell>
        <div className="glass-panel rounded-2xl p-8 text-center">
          <p className="label">Access restricted</p>
          <h1 className="mt-2 text-2xl font-black">Admin login required</h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Vehicle management is available only for the registered SLNS admin number.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-5">
        <section className="glass-panel rounded-2xl p-5 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="label">Admin dashboard</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight">Vehicle Management</h1>
            </div>
            <button type="button" className="btn-primary" onClick={() => setEditing(emptyVehicle)}>
              <Plus className="h-4 w-4" /> Add New Vehicle
            </button>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <AdminStat label="Fleet Size" value={String(stats.total)} />
            <AdminStat label="Available" value={String(stats.available)} />
            <AdminStat label="Stored Images" value={String(stats.images)} />
          </div>
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
            Admin-only prototype controls are active on this page. Image uploads are validated for JPG, PNG, or WEBP files, capped at 10MB each, compressed in-browser, and stored as mock database URLs in localStorage.
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-zinc-100 text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                <tr>
                  <th className="p-4">Vehicle</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Fuel</th>
                  <th className="p-4">Daily Price</th>
                  <th className="p-4">Chauffeur</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Images</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {fleet.map((vehicle) => {
                  const cover = vehicle.images.find((image) => image.isCover) ?? vehicle.images[0];
                  return (
                    <tr key={vehicle.id} className="border-t border-zinc-200 dark:border-zinc-800">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-14 w-20 rounded-lg bg-cover bg-center" style={{ backgroundImage: `url(${cover?.url})` }} />
                          <div>
                            <p className="font-black">{vehicle.name}</p>
                            <p className="line-clamp-1 max-w-xs text-xs text-zinc-500">{vehicle.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">{vehicle.type}</td>
                      <td className="p-4">{vehicle.fuelType}</td>
                      <td className="p-4 font-bold">{formatCurrency(vehicle.dailyRentalPrice)}</td>
                      <td className="p-4">{formatCurrency(vehicle.chauffeurRatePerKm)}/km</td>
                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => persistFleet((current) => current.map((item) => item.id === vehicle.id ? { ...item, isAvailable: !item.isAvailable } : item))}
                          className={`rounded-full px-3 py-1 text-xs font-black ${vehicle.isAvailable ? "bg-teal-100 text-teal-800" : "bg-rose-100 text-rose-800"}`}
                        >
                          {vehicle.isAvailable ? "Available" : "Unavailable"}
                        </button>
                      </td>
                      <td className="p-4">{vehicle.images.length}/5</td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <IconButton label="Gallery" onClick={() => setGalleryVehicle(vehicle)}><Camera className="h-4 w-4" /></IconButton>
                          <IconButton label="Quick Edit" onClick={() => setEditing(vehicle)}><Pencil className="h-4 w-4" /></IconButton>
                          <IconButton label="Delete" onClick={() => persistFleet((current) => current.filter((item) => item.id !== vehicle.id))}><Trash2 className="h-4 w-4" /></IconButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {editing && <VehicleForm vehicle={editing} onClose={() => setEditing(null)} onSave={saveVehicle} />}
      {galleryVehicle && <GalleryManager vehicle={galleryVehicle} onClose={() => setGalleryVehicle(null)} onSave={saveVehicle} />}
    </AppShell>
  );
}

function ensureCover(images: VehicleImage[]) {
  if (images.length === 0) return images;
  if (images.some((image) => image.isCover)) return images;
  return images.map((image, index) => ({ ...image, isCover: index === 0 }));
}

function AdminStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="label">{label}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="grid h-9 w-9 place-items-center rounded-lg border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
    >
      {children}
    </button>
  );
}

function VehicleForm({ vehicle, onClose, onSave }: { vehicle: Vehicle; onClose: () => void; onSave: (vehicle: Vehicle) => void }) {
  const [form, setForm] = useState(vehicle);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/60 p-3 backdrop-blur-sm sm:items-center">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl dark:bg-zinc-950">
        <ModalHeader title={vehicle.id ? "Edit Vehicle Details" : "Add New Vehicle"} onClose={onClose} />
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Vehicle Name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
          <label><span className="label">Vehicle Type</span><select className="field mt-2" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as VehicleType })}><option>5 Seater</option><option>7 Seater</option><option>7 Seater SUV</option></select></label>
          <label><span className="label">Fuel Type</span><select className="field mt-2" value={form.fuelType} onChange={(event) => setForm({ ...form, fuelType: event.target.value as FuelType })}><option>Petrol</option><option>Diesel</option><option>Hybrid</option></select></label>
          <label><span className="label">Transmission</span><select className="field mt-2" value={form.transmission} onChange={(event) => setForm({ ...form, transmission: event.target.value as Transmission })}><option>Manual</option><option>Automatic</option></select></label>
          <Field label="Daily Rental Price" type="number" value={String(form.dailyRentalPrice)} onChange={(value) => setForm({ ...form, dailyRentalPrice: Number(value) })} />
          <Field label="Chauffeur Rate Per KM" type="number" value={String(form.chauffeurRatePerKm)} onChange={(value) => setForm({ ...form, chauffeurRatePerKm: Number(value) })} />
          <label className="flex items-center gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <input type="checkbox" checked={form.isAvailable} onChange={(event) => setForm({ ...form, isAvailable: event.target.checked })} />
            <span className="font-bold">Mark Vehicle Available</span>
          </label>
          <label className="sm:col-span-2"><span className="label">Vehicle Description</span><textarea className="field mt-2 min-h-28" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
        </div>
        <p className="mt-4 rounded-xl bg-zinc-100 p-3 text-sm text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
          Save the vehicle first, then open the gallery manager from the table to upload, replace, caption, reorder, and set cover images.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn-primary" onClick={() => onSave(form)}><Check className="h-4 w-4" /> Save Vehicle</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; type?: string; onChange: (value: string) => void }) {
  return (
    <label>
      <span className="label">{label}</span>
      <input className="field mt-2" type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-zinc-200 pb-4 dark:border-zinc-800">
      <h2 className="text-xl font-black">{title}</h2>
      <button type="button" aria-label="Close modal" className="grid h-10 w-10 place-items-center rounded-lg border border-zinc-200 dark:border-zinc-800" onClick={onClose}>
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}

function GalleryManager({ vehicle, onClose, onSave }: { vehicle: Vehicle; onClose: () => void; onSave: (vehicle: Vehicle) => void }) {
  const [working, setWorking] = useState(vehicle);
  const [error, setError] = useState("");

  async function ingestFiles(fileList: FileList | null) {
    if (!fileList) return;
    const files = Array.from(fileList);
    const nextImages: VehicleImage[] = [];
    for (const file of files) {
      if (!acceptedTypes.includes(file.type)) {
        setError("Only JPG, PNG, and WEBP images are allowed.");
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("Each image must be 10MB or smaller.");
        continue;
      }
      if (working.images.length + nextImages.length >= 5) {
        setError("Upload up to 5 images per vehicle.");
        break;
      }
      nextImages.push({
        id: `img-${Date.now()}-${file.name}`,
        url: await compressToDataUrl(file),
        caption: file.name.replace(/\.[^.]+$/, ""),
        isCover: working.images.length + nextImages.length === 0
      });
    }
    setWorking((current) => ({ ...current, images: [...current.images, ...nextImages] }));
  }

  function updateImage(id: string, patch: Partial<VehicleImage>) {
    setWorking((current) => ({
      ...current,
      images: current.images.map((image) =>
        image.id === id
          ? { ...image, ...patch, isCover: patch.isCover ? true : image.isCover }
          : { ...image, isCover: patch.isCover ? false : image.isCover }
      )
    }));
  }

  async function replaceImage(id: string, file: File | undefined) {
    if (!file) return;
    if (!acceptedTypes.includes(file.type)) {
      setError("Only JPG, PNG, and WEBP images are allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Each image must be 10MB or smaller.");
      return;
    }

    updateImage(id, {
      url: await compressToDataUrl(file),
      caption: file.name.replace(/\.[^.]+$/, "")
    });
    setError("");
  }

  function moveImage(index: number, direction: -1 | 1) {
    const images = [...working.images];
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    [images[index], images[target]] = [images[target], images[index]];
    setWorking({ ...working, images });
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    void ingestFiles(event.dataTransfer.files);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/60 p-3 backdrop-blur-sm sm:items-center">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl dark:bg-zinc-950">
        <ModalHeader title={`Image Gallery Manager - ${working.name}`} onClose={onClose} />
        <label
          onDragOver={(event) => event.preventDefault()}
          onDrop={onDrop}
          className="mt-5 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-teal-300 bg-teal-50 p-6 text-center dark:border-teal-900 dark:bg-teal-950/30"
        >
          <UploadCloud className="h-10 w-10 text-teal-700" />
          <p className="mt-3 font-black">Drag-and-drop images or select files</p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">JPG, PNG, WEBP. Max 10MB each. Automatic browser compression is applied before storing mock URLs.</p>
          <input className="hidden" type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={(event: ChangeEvent<HTMLInputElement>) => void ingestFiles(event.target.files)} />
        </label>
        {error && <p className="mt-3 rounded-lg bg-rose-100 p-3 text-sm font-bold text-rose-800">{error}</p>}

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {working.images.map((image, index) => (
            <article key={image.id} className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
              <img src={image.url} alt={image.caption} className="h-44 w-full rounded-lg object-cover" />
              <div className="mt-3 grid gap-3">
                <input className="field" value={image.caption} onChange={(event) => updateImage(image.id, { caption: event.target.value })} placeholder="Image caption" />
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="btn-secondary" onClick={() => updateImage(image.id, { isCover: true })}>
                    <ImagePlus className="h-4 w-4" /> {image.isCover ? "Cover Image" : "Set Primary"}
                  </button>
                  <label className="btn-secondary cursor-pointer">
                    <UploadCloud className="h-4 w-4" /> Replace
                    <input className="hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void replaceImage(image.id, event.target.files?.[0])} />
                  </label>
                  <IconButton label="Move up" onClick={() => moveImage(index, -1)}><GripVertical className="h-4 w-4 rotate-90" /></IconButton>
                  <IconButton label="Move down" onClick={() => moveImage(index, 1)}><GripVertical className="h-4 w-4 -rotate-90" /></IconButton>
                  <IconButton label="Delete image" onClick={() => setWorking((current) => ({ ...current, images: current.images.filter((item) => item.id !== image.id) }))}><Trash2 className="h-4 w-4" /></IconButton>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn-primary" onClick={() => onSave(working)}><Check className="h-4 w-4" /> Save Gallery</button>
        </div>
      </div>
    </div>
  );
}

function compressToDataUrl(file: File) {
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(1, 1400 / Math.max(image.width, image.height));
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/webp", 0.82));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
