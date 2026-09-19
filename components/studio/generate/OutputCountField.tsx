"use client";

const DEFAULT_MAX = 8;

export function OutputCountField({
  value,
  onChange,
  max = DEFAULT_MAX,
}: {
  value: number;
  onChange: (n: number) => void;
  max?: number;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[11.5px] text-dim">Output images</label>
      <div className="flex w-max items-center gap-3 border border-border bg-surface px-3 py-2">
        <button
          onClick={() => onChange(Math.max(1, value - 1))}
          className="text-lg text-muted hover:text-text"
          aria-label="Fewer images"
        >
          −
        </button>
        <span className="w-5 text-center font-mono text-sm">{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="text-lg text-muted hover:text-text"
          aria-label="More images"
        >
          +
        </button>
      </div>
    </div>
  );
}
