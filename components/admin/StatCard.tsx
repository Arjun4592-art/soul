import type { LucideIcon } from "lucide-react";

export default function StatCard({
  label,
  value,
  icon: Icon,
  trend,
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
  trend?: { value: string; positive: boolean };
}) {
  return (
    <div className="border border-ink/30 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-ink-soft">{label}</p>
        {Icon && <Icon className="h-4 w-4 text-ink-soft" strokeWidth={1.5} />}
      </div>
      <p className="mt-4 font-display text-4xl leading-none">{value}</p>
      {trend && <p className={`mt-2 text-[0.78rem] font-medium ${trend.positive ? "text-leaf" : "text-rose-700"}`}>{trend.positive ? "▲" : "▼"} {trend.value}</p>}
    </div>
  );
}
