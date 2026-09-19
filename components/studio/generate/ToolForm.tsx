"use client";

import { useState } from "react";
import { ImageDropzone } from "./ImageDropzone";
import { ParamFieldInput } from "./ParamFieldInput";
import { OutputCountField } from "./OutputCountField";
import { EnhancePromptButton } from "./EnhancePromptButton";
import { CreditCostBadge } from "./CreditCostBadge";
import type { ToolSchema } from "@/lib/types/generate";
import { optionValue } from "@/lib/types/generate";
import { estimateCreditsPerImage, hasNoCostVaryingFields } from "@/lib/tools/credit-estimate";

const BRAND_COLOR = "#C8FF00"; // --color-accent

export function ToolForm({
  schema,
  onSubmit,
  submitting,
  running = false,
  initialImages = [],
}: {
  schema: ToolSchema;
  /** `expectedCount` is how many results to draw boxes for while waiting. */
  onSubmit: (formData: FormData, expectedCount: number) => void;
  submitting: boolean;
  /** A generation is in flight — Generate stays off until it completes or fails. */
  running?: boolean;
  /** Images handed over from another tool via "Send to…". */
  initialImages?: File[];
}) {
  // output_count is always sent as its own dedicated form field — when the
  // schema declares it (as a "number" field, e.g. listing_photoshoot), its
  // min/max/default drive the stepper; otherwise fall back to a sensible default.
  const outputCountField = schema.paramSchema.find((f) => f.name === "output_count");
  // Selects/color/number settle first, free-text prompt fields last — matches
  // the reference layout (Quality/Size rows above, Prompt textarea at the
  // bottom), rather than whatever order the schema happens to declare fields in.
  const otherFields = schema.paramSchema
    .filter((f) => f.name !== "output_count")
    .slice()
    .sort((a, b) => (a.type === "text" ? 1 : 0) - (b.type === "text" ? 1 : 0));
  const outputMax = outputCountField?.max ?? 8;

  // Creative reads top to bottom as: Idea, then Settings (aspect ratio,
  // resolution, quality), then Prompt. Other tools have no Idea, so they get
  // Settings then Prompt.
  const SETTINGS_ORDER = [/aspect|size/i, /resolution/i, /quality/i];
  const rank = (name: string) => {
    const i = SETTINGS_ORDER.findIndex((re) => re.test(name));
    return i === -1 ? SETTINGS_ORDER.length : i;
  };
  const leadFields = otherFields.filter((f) => f.name === "idea");
  const promptFields = otherFields.filter((f) => f.type === "text");
  const settingsFields = otherFields
    .filter((f) => f.name !== "idea" && f.type !== "text")
    .sort((a, b) => (schema.featureType === "creative_photoshoot" ? rank(a.name) - rank(b.name) : 0));

  const [images, setImages] = useState<File[]>(() => initialImages.slice(0, schema.maxInputImages));
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const f of otherFields) {
      initial[f.name] = f.default != null ? String(f.default) : "";
      // Recolor starts on the site's accent lime unless the schema says otherwise, so
      // leaving the colour untouched still sends a real colour.
      if (f.type === "color" && !initial[f.name]) initial[f.name] = BRAND_COLOR;
      // The Idea dropdown starts on its first option rather than "Select…".
      if (f.name === "idea" && !initial[f.name] && f.options?.length) initial[f.name] = optionValue(f.options[0]);
    }
    return initial;
  });
  const [outputCount, setOutputCount] = useState(() =>
    outputCountField?.default != null ? Number(outputCountField.default) : 1,
  );
  const [error, setError] = useState("");
  // The backend allows one active job per user; an enhance counts as one.
  const [enhancing, setEnhancing] = useState(false);
  const uploadTitle = schema.featureType === "recolor" ? "Upload your design" : "Upload product photos";
  const hasEnhance = schema.featureType === "creative_photoshoot" || schema.featureType === "listing_photoshoot";

  const perImageCost = estimateCreditsPerImage(schema.featureType, schema, values);
  const fixedCost = hasNoCostVaryingFields(schema.featureType, schema);
  const needsImages = schema.maxInputImages > 0;

  function setValue(name: string, v: string) {
    setValues((prev) => ({ ...prev, [name]: v }));
    setError("");
  }

  function handleSubmit() {
    if (needsImages && images.length === 0) {
      setError("Add at least one image.");
      return;
    }
    for (const field of otherFields) {
      if (field.required && !values[field.name]) {
        setError(`${field.label} is required.`);
        return;
      }
    }
    // Backend-enforced rule that's worth catching client-side too.
    if (schema.featureType === "creative_photoshoot" && !values.idea && !values.prompt) {
      setError("Describe your scene or pick an idea.");
      return;
    }

    const fd = new FormData();
    fd.append("feature_type", schema.featureType);
    for (const f of images) fd.append("images", f);
    for (const [key, val] of Object.entries(values)) {
      if (val) fd.append(key, val);
    }
    fd.append("output_count", String(Math.min(outputCount, outputMax)));
    const count = Math.min(outputCount, outputMax);
    // No output_count field means one result per uploaded image.
    onSubmit(fd, outputCountField ? count : Math.max(images.length, 1));
  }

  const renderField = (field: (typeof otherFields)[number]) => (
    <div key={field.name} className="flex flex-col gap-2">
      <ParamFieldInput
        field={field}
        featureType={schema.featureType}
        values={values}
        value={values[field.name] ?? ""}
        onChange={(v) => setValue(field.name, v)}
      />
      {field.name === "prompt" && hasEnhance && (
        <EnhancePromptButton
          value={values.prompt ?? ""}
          featureType={schema.featureType}
          onApply={(p) => setValue("prompt", p)}
          onBusyChange={setEnhancing}
        />
      )}
    </div>
  );

  return (
    <div className="flex h-full w-[380px] flex-none flex-col border-r border-border">
      <div className="flex-1 overflow-auto px-[26px] pb-5 pt-[26px]">
        {needsImages && (
          <div className="mb-6 mt-0">
            <h2 className="font-heading text-[19px] font-semibold tracking-tight">{uploadTitle}</h2>
            <div className="mt-3">
              <ImageDropzone
                files={images}
                onChange={setImages}
                maxFiles={schema.maxInputImages}
                hint={schema.maxInputImages > 1 ? "Upload as many as you need — each one generates its own result" : undefined}
              />
            </div>
          </div>
        )}

        {leadFields.length > 0 && <div className="mb-6 flex flex-col gap-2.5">{leadFields.map(renderField)}</div>}

        {(outputCountField || settingsFields.length > 0) && (
          <div className="mb-6 flex flex-col gap-2.5">
            <span className="text-[13px] font-medium text-muted">Settings</span>
            {outputCountField && (
              <OutputCountField value={outputCount} onChange={setOutputCount} max={outputMax} />
            )}
            {settingsFields.map(renderField)}
          </div>
        )}

        {promptFields.length > 0 && <div className="flex flex-col gap-2.5">{promptFields.map(renderField)}</div>}
      </div>

      <div className="flex-none border-t border-border px-[26px] py-4 flex flex-col gap-2">
        {error && <p className="text-sm text-[#ff8a6b]">{error}</p>}
        <button
          onClick={handleSubmit}
          disabled={submitting || running || enhancing}
          className="rounded-full bg-accent py-3 text-sm font-semibold text-accent-ink hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-accent"
        >
          {submitting ? "Starting…" : running ? "Generating…" : enhancing ? "Enhancing prompt…" : "Generate"}
        </button>
        <CreditCostBadge perImage={perImageCost} count={outputCount} fixedCost={fixedCost} />
      </div>
    </div>
  );
}
