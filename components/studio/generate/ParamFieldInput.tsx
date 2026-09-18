"use client";

import type { ParamField } from "@/lib/types/generate";
import { optionLabel, optionValue, optionCreditCost } from "@/lib/types/generate";
import { SettingsRow } from "./SettingsRow";

export function ParamFieldInput({
  field,
  value,
  onChange,
}: {
  field: ParamField;
  value: string;
  onChange: (value: string) => void;
}) {
  const label = (
    <label className="text-[11.5px] text-dim">
      {field.label}
      {field.required && <span className="text-accent"> *</span>}
    </label>
  );

  if (field.type === "select") {
    const options = field.options ?? [];
    const current = options.find((o) => optionValue(o) === value);
    const currentBadge = current ? optionCreditCost(current) : undefined;
    return (
      <SettingsRow
        label={field.label}
        currentLabel={current ? optionLabel(current) : "None"}
        currentBadge={currentBadge != null ? `${currentBadge}cr` : undefined}
        options={options.map((o) => ({
          value: optionValue(o),
          label: optionLabel(o),
          badge: optionCreditCost(o) != null ? `${optionCreditCost(o)}cr` : undefined,
        }))}
        onSelect={onChange}
      />
    );
  }

  if (field.type === "number") {
    const min = field.min ?? 1;
    const max = field.max ?? 99;
    const num = Number(value) || min;
    return (
      <div className="flex flex-col gap-2">
        {label}
        <div className="flex w-max items-center gap-3 border border-border bg-surface px-3 py-2">
          <button
            onClick={() => onChange(String(Math.max(min, num - 1)))}
            className="text-lg text-muted hover:text-text"
            aria-label={`Fewer ${field.label}`}
          >
            −
          </button>
          <span className="w-5 text-center font-mono text-sm">{num}</span>
          <button
            onClick={() => onChange(String(Math.min(max, num + 1)))}
            className="text-lg text-muted hover:text-text"
            aria-label={`More ${field.label}`}
          >
            +
          </button>
        </div>
      </div>
    );
  }

  if (field.type === "color") {
    return (
      <div className="flex flex-col gap-2">
        {label}
        <div className="flex items-center gap-3 border border-border bg-surface px-3.5 py-3">
          <input
            type="color"
            value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#c8ff00"}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 w-9 flex-none cursor-pointer border border-border-strong bg-transparent p-0.5"
          />
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g. red, or a hex code"
            className="flex-1 bg-transparent text-[13px]"
          />
        </div>
      </div>
    );
  }

  // "text" — using a textarea since these fields (prompt/target_area) tend
  // to hold a sentence or two, not a single short value.
  return (
    <div className="flex flex-col gap-2">
      {label}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className="resize-none border border-border bg-surface px-3 py-2.5 text-[13px]"
      />
    </div>
  );
}
