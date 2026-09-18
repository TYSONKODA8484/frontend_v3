"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { ImageDropzone } from "./ImageDropzone";
import { ParamFieldInput } from "./ParamFieldInput";
import { OutputCountField } from "./OutputCountField";
import { CreditCostBadge } from "./CreditCostBadge";
import type { ToolSchema } from "@/lib/types/generate";
import { estimateCreditsPerImage } from "@/lib/tools/credit-estimate";
import { useToast } from "@/lib/studio/ToastContext";

export function ToolForm({
  schema,
  onSubmit,
  submitting,
}: {
  schema: ToolSchema;
  onSubmit: (formData: FormData) => void;
  submitting: boolean;
}) {
  const { say } = useToast();

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

  const [images, setImages] = useState<File[]>([]);
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const f of otherFields) initial[f.name] = f.default != null ? String(f.default) : "";
    return initial;
  });
  const [outputCount, setOutputCount] = useState(() =>
    outputCountField?.default != null ? Number(outputCountField.default) : 1,
  );
  const [error, setError] = useState("");

  const perImageCost = estimateCreditsPerImage(schema.featureType, schema, values);
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
    onSubmit(fd);
  }

  return (
    <div className="flex h-full w-[380px] flex-none flex-col border-r border-border">
      <div className="flex-1 overflow-auto px-6 py-6">
        {needsImages && (
          <div className="mb-6">
            <h2 className="font-heading text-lg font-semibold tracking-tight">Upload photos</h2>
            <div className="mt-3">
              <ImageDropzone files={images} onChange={setImages} maxFiles={schema.maxInputImages} />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <span className="font-mono text-[11px] tracking-wide text-dim">SETTINGS</span>
          {otherFields.map((field) => (
            <div key={field.name} className="flex flex-col gap-2">
              <ParamFieldInput
                field={field}
                value={values[field.name] ?? ""}
                onChange={(v) => setValue(field.name, v)}
              />
              {/* Enhance is a real, upcoming tool (enhance_prompt) — shown here
                  to match the reference, but inert until that tool is built,
                  rather than faking an AI call. */}
              {field.name === "prompt" && schema.featureType === "creative_photoshoot" && (
                <button
                  onClick={() => say("Prompt enhancement is coming soon")}
                  className="flex items-center gap-1.5 self-start text-xs text-accent hover:text-accent-hover"
                >
                  <Sparkles size={13} />
                  Enhance prompt
                  <span className="text-dim">· Coming soon</span>
                </button>
              )}
            </div>
          ))}
          <OutputCountField value={outputCount} onChange={setOutputCount} max={outputMax} />
        </div>
      </div>

      <div className="flex-none border-t border-border px-6 py-4 flex flex-col gap-2.5">
        {error && <p className="text-sm text-[#ff8a6b]">{error}</p>}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="rounded-full bg-accent py-3 text-sm font-semibold text-accent-ink hover:bg-accent-hover disabled:opacity-60"
        >
          {submitting ? "Starting…" : "Generate"}
        </button>
        <CreditCostBadge perImage={perImageCost} count={outputCount} />
      </div>
    </div>
  );
}
