import { CarFront } from "lucide-react";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-11 w-11 place-items-center rounded-lg bg-teal-700 text-white shadow-lg shadow-teal-700/20">
        <CarFront className="h-6 w-6" />
      </div>
      {!compact && (
        <div>
          <p className="text-lg font-extrabold tracking-tight">SLNS Enterprises</p>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Premium car rentals</p>
        </div>
      )}
    </div>
  );
}
