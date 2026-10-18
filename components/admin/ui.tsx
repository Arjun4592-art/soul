"use client";

import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import Modal from "./Modal";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="mb-4 block">
      <span className="mb-1.5 block text-[0.82rem] font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}

const fieldClass =
  "w-full border border-ink/30 bg-white px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-soft/70 focus:border-ink focus:shadow-[2px_2px_0_0_var(--gold-soft)]";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${fieldClass} ${props.className ?? ""}`} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${fieldClass} min-h-24 ${props.className ?? ""}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${fieldClass} ${props.className ?? ""}`} />;
}

export function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 border border-ink bg-ink px-4 py-2.5 text-sm font-medium text-paper transition hover:bg-ink-2 disabled:opacity-50 ${props.className ?? ""}`}
    />
  );
}

export function GhostButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 border border-ink/40 px-4 py-2.5 text-sm font-medium text-ink transition hover:border-ink hover:bg-ink/5 disabled:opacity-50 ${props.className ?? ""}`}
    />
  );
}

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "success" | "warning" | "danger" | "gold" | "info";
  children: ReactNode;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-ink/10 text-ink-soft",
    success: "bg-sage text-[#2f4a29]",
    warning: "bg-gold-soft text-gold-ink",
    danger: "bg-rose-100 text-rose-800",
    gold: "bg-gold-soft text-gold-ink",
    info: "bg-mist text-ink-2",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 font-mono text-[0.68rem] uppercase tracking-[0.08em] ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  onCancel,
  onConfirm,
  confirmLabel = "Delete",
}: {
  open: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="mb-6 text-sm text-ink-soft">{message}</p>
      <div className="flex justify-end gap-3">
        <GhostButton onClick={onCancel}>Cancel</GhostButton>
        <button onClick={onConfirm} className="border border-rose-700 bg-rose-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-rose-800">
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
