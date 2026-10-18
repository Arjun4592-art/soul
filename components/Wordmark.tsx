import Link from "next/link";

export default function Wordmark({ light = false, className = "" }: { light?: boolean; className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-baseline gap-2 ${className}`} aria-label="Preeti Soulpreneur, home">
      <span className={`font-display text-[1.7rem] leading-none ${light ? "text-paper" : "text-ink"}`}>Preeti</span>
      <span className={`font-mono text-[0.62rem] uppercase tracking-[0.2em] ${light ? "text-paper/60" : "text-ink-soft"}`}>
        Soulpreneur
      </span>
    </Link>
  );
}
