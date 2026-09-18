"use client";

import { useState } from "react";
import { ImageDropzone } from "./ImageDropzone";
import { ParamFieldInput } from "./ParamFieldInput";
import { OutputCountField } from "./OutputCountField";
import { CreditCostBadge } from "./CreditCostBadge";
import type { ToolSchema } from "@/lib/types/generate";
import { estimateCreditsPerImage } from "@/lib/tools/credit-estimate";

export function ToolForm({
  schema,
  onSubmit,
  submitting,
}: {
  schema: ToolSchema;
  onSubmit: (formData: FormData) => void;
  submitting: boolean;
}) {
  const [images, setImages] = useState<File[]>([]);
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const f of schema.paramSchema) initial[f.name] = f.default ?? "";
    return initial;
  });
  const [outputCount, setOutputCount] = useState(1);
  const [error, setError] = useState("");

  const perImageCost = estimateCreditsPerImage(schema.featureType, schema, values);

  function setValue(name: string, v: string) {
    setValues((prev) => ({ ...prev, [name]: v }));
    setError("");
  }

  function handleSubmit() {
    if (images.length === 0) {
      setError("Add at least one image.");
      return;
    }
    for (const field of schema.paramSchema) {
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
    fd.append("output_count", String(outputCount));
    onSubmit(fd);
  }

  return (
    <div className="flex flex-col gap-5">
      <ImageDropzone files={images} onChange={setImages} maxFiles={schema.maxInputImages} />

      {schema.paramSchema.map((field) => (
        <ParamFieldInput
          key={field.name}
          field={field}
          value={values[field.name] ?? ""}
          onChange={(v) => setValue(field.name, v)}
        />
      ))}

      <OutputCountField value={outputCount} onChange={setOutputCount} />
      <CreditCostBadge perImage={perImageCost} count={outputCount} />

      {error && <p className="text-sm text-[#ff8a6b]">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="rounded-full bg-accent py-3 text-sm font-semibold text-accent-ink hover:bg-accent-hover disabled:opacity-60"
      >
        {submitting ? "Starting…" : "Generate"}
      </button>
    </div>
  );
}
