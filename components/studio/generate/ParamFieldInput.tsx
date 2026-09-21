"use client";

import type { ParamField } from "@/lib/types/generate";
import { optionLabel, optionValue, optionCreditCost } from "@/lib/types/generate";
import { SettingsRow } from "./SettingsRow";
import { PROMPT_MAX_LENGTH } from "./EnhancePromptButton";
import { ColorField } from "./ColorField";
import { creditsForQuality, resolutionMultipliers, usesQualityPricing } from "@/lib/tools/credit-estimate";
import { SizeField } from "./SizeField";

const PROMPT_PLACEHOLDERS: Record<string, string> = {
  listing_photoshoot: "Describe the scene, e.g. 'wet stone ledge, cold morning light'",
  creative_photoshoot: "Describe the scene in your own words, e.g. 'wet stone ledge, cold morning light'",
  recolor: "e.g. 'the shirt', or leave blank to auto-detect",
};

export function ParamFieldInput({
  field,
  value,
  onChange,
  featureType,
  values,
}: {
  featureType?: string;
  /** All current form values — quality prices depend on the chosen resolution. */
  values?: Record<string, string>;
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

  if (field.type === "select" && /size|aspect/i.test(field.name)) {
    return (
      <SizeField
        label={field.label}
        value={value}
        options={(field.options ?? []).map((o) => ({ value: optionValue(o), label: optionLabel(o) }))}
        onChange={onChange}
      />
    );
  }

  if (field.type === "select" && field.name === "idea") {
    return (
      <div className="flex flex-col gap-1.5">
        {label}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-border bg-surface px-3 py-[11px] text-[13px] text-text outline-none focus:border-accent"
        >
          {!field.default && <option value="">Select…</option>}
          {(field.options ?? []).map((o) => (
            <option key={optionValue(o)} value={optionValue(o)}>
              {optionLabel(o)}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // Resolution shows how much each step multiplies the price (1x, 2x, 3x).
  if (field.type === "select" && field.name === "resolution" && featureType && usesQualityPricing(featureType)) {
    const options = field.options ?? [];
    const mult = resolutionMultipliers(options.map(optionValue));
    const current = options.find((o) => optionValue(o) === value);
    return (
      <SettingsRow
        label={field.label}
        currentValue={value}
        currentLabel={current ? optionLabel(current) : "None"}
        currentMultiplier={mult[value]}
        options={options.map((o) => ({ value: optionValue(o), label: optionLabel(o), multiplier: mult[optionValue(o)] }))}
        onSelect={onChange}
      />
    );
  }

  // Quality (low → max) shows what each level costs per image at the
  // currently chosen resolution.
  if (field.type === "select" && field.name === "quality" && featureType && usesQualityPricing(featureType)) {
    const resolution = values?.resolution ?? "1k";
    const options = field.options ?? [];
    const cost = (v: string) => creditsForQuality(v, resolution) ?? undefined;
    const current = options.find((o) => optionValue(o) === value);
    return (
      <SettingsRow
        label={field.label}
        currentValue={value}
        currentLabel={current ? optionLabel(current) : "None"}
        currentCredits={cost(value)}
        options={options.map((o) => ({ value: optionValue(o), label: optionLabel(o), credits: cost(optionValue(o)) }))}
        onSelect={onChange}
      />
    );
  }

  if (field.type === "select") {
    const options = field.options ?? [];
    const current = options.find((o) => optionValue(o) === value);
    const currentBadge = current ? optionCreditCost(current) : undefined;
    return (
      <SettingsRow
        label={field.label}
        currentValue={value}
        currentLabel={current ? optionLabel(current) : "None"}
        currentCredits={currentBadge}
        options={options.map((o) => ({
          value: optionValue(o),
          label: optionLabel(o),
          credits: optionCreditCost(o),
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
    return <ColorField label={field.label} value={value} onChange={onChange} />;
  }

  // "text" — using a textarea since these fields (prompt/target_area) tend
  // to hold a sentence or two, not a single short value.
  return (
    <div className="flex flex-col gap-2">
      {label}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={PROMPT_PLACEHOLDERS[featureType ?? ""]}
        maxLength={PROMPT_MAX_LENGTH}
        className={`${featureType === "recolor" ? "h-[70px]" : "h-16"} resize-none border border-border bg-surface p-3 text-[13px] text-text outline-none focus:border-accent`}
      />
    </div>
  );
}
