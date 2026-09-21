/**
 * The credit mark from the design: a lime disc with a dark lightning bolt.
 * Use it next to every credit amount so credits look the same everywhere.
 * `.credit-amount` (globals.css) lays out "icon + number" inline.
 */
export function CreditIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      aria-hidden="true"
      className={`block flex-none ${className}`}
    >
      <circle cx="10" cy="10" r="9.5" fill="var(--color-accent)" />
      <path d="M10.6 3.6 6.2 11h3l-.7 5.4 4.7-7.6h-3.1l.5-5.2z" fill="var(--color-accent-ink)" />
    </svg>
  );
}

/** "⚡ 12" — the icon followed by an amount, optionally with a unit word. */
export function Credits({
  amount,
  unit,
  size = 14,
  className = "",
}: {
  amount: number | string;
  unit?: string;
  size?: number;
  className?: string;
}) {
  return (
    <span className={`credit-amount ${className}`}>
      <CreditIcon size={size} />
      {amount}
      {unit ? ` ${unit}` : ""}
    </span>
  );
}
