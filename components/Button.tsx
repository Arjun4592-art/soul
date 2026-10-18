import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "outline" | "light";

const base =
  "inline-flex items-center justify-center gap-2.5 px-6 py-3 text-[0.95rem] font-medium leading-none transition duration-200 disabled:opacity-60";

const variants: Record<Variant, string> = {
  // Solid navy with a hard gold offset shadow that "presses" on click.
  primary:
    "border border-ink bg-ink text-paper shadow-[4px_4px_0_0_var(--gold)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--gold)] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0_0_var(--gold)]",
  outline: "border border-ink text-ink hover:bg-ink hover:text-paper",
  light:
    "border border-paper bg-paper text-ink shadow-[4px_4px_0_0_var(--gold)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--gold)] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0_0_var(--gold)]",
};

/** Class string for use on a plain <button> that should look like a site button. */
export function btnClass(variant: Variant = "primary", extra = "") {
  return `${base} ${variants[variant]} ${extra}`;
}

export default function Button({
  href,
  children,
  variant = "primary",
  arrow = true,
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  arrow?: boolean;
  className?: string;
}) {
  return (
    <Link href={href} className={btnClass(variant, className)}>
      {children}
      {arrow && <span aria-hidden>→</span>}
    </Link>
  );
}
