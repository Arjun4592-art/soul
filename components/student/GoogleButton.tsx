"use client";

export default function GoogleButton({
  onClick,
  disabled,
  label = "Continue with Google",
}: {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center justify-center gap-2.5 rounded-[3px] border border-ink/15 bg-white px-5 py-3 text-sm font-medium text-ink transition hover:border-ink/30 hover:bg-paper/60 disabled:opacity-50"
    >
      <svg className="h-4 w-4" viewBox="0 0 48 48" aria-hidden="true">
        <path
          fill="#FFC107"
          d="M43.6 20.5H42V20.4H24v7.2h11.3c-1.6 4.6-6 7.9-11.3 7.9-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.1-5.1C33.6 6 29 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"
        />
        <path
          fill="#FF3D00"
          d="m6.3 14.7 5.9 4.3c1.6-4.7 6-8 11.2-8 3.1 0 5.9 1.2 8 3.1l5.1-5.1C33.6 6 29 4 24 4c-7.6 0-14.1 4.3-17.7 10.7z"
        />
        <path
          fill="#4CAF50"
          d="M24 44c4.9 0 9.4-1.9 12.8-4.9l-5.9-5c-2 1.4-4.5 2.2-6.9 2.2-5.3 0-9.7-3.3-11.3-8l-5.9 4.6C10 39.6 16.5 44 24 44z"
        />
        <path
          fill="#1976D2"
          d="M43.6 20.5H42V20.4H24v7.2h11.3c-.8 2.3-2.2 4.2-4.1 5.6l5.9 5C40.9 35.5 44 30.2 44 24c0-1.2-.1-2.4-.4-3.5z"
        />
      </svg>
      {label}
    </button>
  );
}
