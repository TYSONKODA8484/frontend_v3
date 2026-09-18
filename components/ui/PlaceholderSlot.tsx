export function PlaceholderSlot({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`absolute inset-0 flex items-center justify-center bg-surface-2 text-center text-xs text-dim ${className}`}
    >
      {label}
    </div>
  );
}
