"use client";

import type { ParamField } from "@/lib/types/generate";
import { optionLabel, optionValue } from "@/lib/types/generate";

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
    return (
      <div className="flex flex-col gap-2">
        {label}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="border border-border bg-surface px-3 py-2.5 text-[13px] text-text"
        >
          {!field.required && <option value="">None</option>}
          {(field.options ?? []).map((opt) => (
            <option key={optionValue(opt)} value={optionValue(opt)}>
              {optionLabel(opt)}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === "color") {
    return (
      <div className="flex flex-col gap-2">
        {label}
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#c8ff00"}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 w-10 flex-none cursor-pointer border border-border-strong bg-transparent p-0.5"
          />
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g. red, or a hex code"
            className="flex-1 border border-border bg-surface px-3 py-2.5 text-[13px]"
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
