export function MetricCard({
  label,
  value,
  detail
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="glass-panel rounded-xl p-4">
      <p className="label">{label}</p>
      <p className="mt-2 text-2xl font-black tracking-tight">{value}</p>
      {detail && <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{detail}</p>}
    </div>
  );
}
