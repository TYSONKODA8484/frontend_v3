"use client";

import { useState } from "react";
import { CreditIcon } from "@/components/ui/CreditIcon";
import { generate } from "@/lib/api/generate";
import { useTeam } from "@/lib/studio/TeamContext";
import { useTeamBilling } from "@/lib/studio/TeamBillingContext";
import {
  MAX_TOTAL_IMAGES,
  describeShootError,
  filterUploads,
  modelShootCost,
  type ModelChoice,
  type ShootError,
} from "@/lib/tools/model-shoot";
import type { GenerateResponse, ToolSchema } from "@/lib/types/generate";
import { ModelStep } from "./ModelStep";
import { ProductsStep, emptyProducts, productImageCount, type ProductsState } from "./ProductsStep";
import { OutputStep, type OutputValues } from "./OutputStep";

const STEPS = ["Model", "Products", "Output"];

export function ModelShootFlow({
  schema,
  running,
  onStarted,
  onSubmitting,
  initialGarments = [],
}: {
  schema: ToolSchema;
  /** A previous shoot is still generating — the backend allows one at a time. */
  running: boolean;
  onStarted: (res: GenerateResponse) => void;
  /** Called with the output count when Generate is hit, and null once the server has answered. */
  onSubmitting?: (count: number | null) => void;
  /** Images handed over from another tool via "Send to…" — start in the garment slot. */
  initialGarments?: File[];
}) {
  const { activeTeamId } = useTeam();
  const { billing, openBuyModal } = useTeamBilling();

  const fieldDefault = (name: string, fallback: string) => {
    const d = schema.paramSchema.find((f) => f.name === name)?.default;
    return d != null ? String(d) : fallback;
  };

  const [step, setStep] = useState(1);
  const [model, setModel] = useState<ModelChoice | null>(null);
  const [products, setProducts] = useState<ProductsState>(() => ({
    ...emptyProducts(),
    files: { single: initialGarments.slice(0, MAX_TOTAL_IMAGES - 1) },
  }));
  const [output, setOutput] = useState<OutputValues>(() => ({
    aspectRatio: fieldDefault("aspect_ratio", "1:1"),
    resolution: fieldDefault("resolution", "1k"),
    outputCount: Number(fieldDefault("output_count", "4")),
    prompt: "",
  }));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ShootError | null>(null);
  const [uploadNote, setUploadNote] = useState("");
  const [enhancing, setEnhancing] = useState(false);

  const total = 1 + productImageCount(products) + products.refs.length;
  const garments = productImageCount(products);
  const cost = modelShootCost(output.resolution, output.outputCount);
  const short = cost != null && billing != null && billing.totalCredits < cost;

  const canAdvance = step === 1 ? !!model : step === 2 ? garments > 0 && total <= MAX_TOTAL_IMAGES : true;

  // Validates type/size and caps the additions at the remaining image budget.
  function addFiles(current: File[], incoming: File[]): File[] {
    const { accepted, error: err } = filterUploads(incoming);
    const room = MAX_TOTAL_IMAGES - total;
    const kept = accepted.slice(0, Math.max(0, room));
    setUploadNote(
      err || (kept.length < accepted.length ? `Limit is ${MAX_TOTAL_IMAGES} images in total — some weren't added.` : ""),
    );
    return [...current, ...kept];
  }

  function advance() {
    setError(null);
    if (step === 1 && !model) return setError({ message: "Pick or generate a model first.", kind: "other" });
    if (step === 2 && garments === 0) return setError({ message: "Upload at least one product image.", kind: "other" });
    if (step === 2 && total > MAX_TOTAL_IMAGES) {
      return setError({ message: `Over the ${MAX_TOTAL_IMAGES}-image limit — remove ${total - MAX_TOTAL_IMAGES}.`, kind: "other" });
    }
    setStep(step + 1);
  }

  async function submit() {
    if (!activeTeamId || !model || submitting || running) return;
    const fd = new FormData();
    fd.append("team_id", activeTeamId);
    fd.append("feature_type", "model_shoot");
    if (model.kind === "preset") fd.append("model_preset_id", model.id);
    else if (model.kind === "upload") fd.append("model_image", model.file);
    else fd.append("model_source_job_id", model.jobId);

    // Slots stay separate — the planner relies on "same slot = same item".
    const slotFiles = (id: string) => products.files[id] ?? [];
    if (products.mode === "single") {
      slotFiles("single").forEach((f) => fd.append("top_images", f));
    } else {
      slotFiles("top").forEach((f) => fd.append("top_images", f));
      slotFiles("bottom").forEach((f) => fd.append("bottom_images", f));
      products.extras
        .filter((x) => slotFiles(x.id).length > 0)
        .forEach((x, i) => {
          const n = i + 1;
          if (x.label.trim()) fd.append(`extra_label_${n}`, x.label.trim());
          slotFiles(x.id).forEach((f) => fd.append(`extra_images_${n}`, f));
        });
    }
    products.refs.forEach((f) => fd.append("reference_images", f));
    fd.append("aspect_ratio", output.aspectRatio);
    fd.append("resolution", output.resolution);
    fd.append("output_count", String(output.outputCount));
    if (output.prompt.trim()) fd.append("prompt", output.prompt.trim());

    setSubmitting(true);
    setError(null);
    onSubmitting?.(output.outputCount);
    try {
      onStarted(await generate(fd));
    } catch (err) {
      setError(describeShootError(err));
    } finally {
      onSubmitting?.(null);
      setSubmitting(false);
    }
  }

  const primaryDisabled = step === 3 ? submitting || running || enhancing : !canAdvance;

  return (
    <div className="flex h-full w-[380px] flex-none flex-col border-r border-border">
      <div className="flex min-h-0 flex-1 flex-col gap-[22px] overflow-auto px-6 py-6">
        <div className="flex items-stretch border border-border">
          {STEPS.map((label, i) => {
            const n = i + 1;
            const active = n === step;
            const done = n < step;
            return (
              <button
                key={label}
                onClick={() => done && setStep(n)}
                className={`flex flex-1 items-center justify-center gap-1.5 border-r border-border px-1.5 py-2.5 last:border-r-0 ${
                  active ? "bg-surface text-text" : done ? "cursor-pointer text-muted" : "cursor-default text-dim"
                }`}
              >
                <span
                  className={`flex h-[18px] w-[18px] flex-none items-center justify-center rounded-full text-[10.5px] font-bold ${
                    active ? "bg-accent text-accent-ink" : done ? "bg-border-strong text-dim" : "text-dim"
                  }`}
                >
                  {n}
                </span>
                <span className="text-[11.5px] font-semibold tracking-wide">{label}</span>
              </button>
            );
          })}
        </div>

        {step === 1 && <ModelStep model={model} onChange={setModel} />}
        {step === 2 && (
          <>
            <ProductsStep state={products} onChange={setProducts} totalImages={total} onAddFiles={addFiles} />
            {uploadNote && <p className="-mt-3 text-[12px] text-[#ff8a6b]">{uploadNote}</p>}
          </>
        )}
        {step === 3 && <OutputStep
            fields={schema.paramSchema}
            values={output}
            onChange={setOutput}
            onEnhancingChange={setEnhancing}
          />}
      </div>

      <div className="flex flex-none flex-col gap-2 border-t border-border px-6 py-4">
        {error && (
          <p className="text-[13px] text-[#ff8a6b]">
            {error.message}{" "}
            {error.kind === "credits" && (
              <button onClick={() => openBuyModal("credits")} className="text-accent underline">
                Buy credits
              </button>
            )}
          </p>
        )}
        {step === 3 && running && (
          <p className="text-[12px] text-dim">A shoot is already generating — you can start another when it finishes.</p>
        )}
        <div className="flex gap-2.5">
          {step > 1 && (
            <button
              onClick={() => {
                setError(null);
                setStep(step - 1);
              }}
              className="flex-none rounded-full border border-border-strong px-[22px] py-3.5 text-sm text-muted hover:text-text"
            >
              Back
            </button>
          )}
          <button
            onClick={step === 3 ? submit : advance}
            disabled={primaryDisabled}
            className={`flex-1 rounded-full py-3.5 text-[14.5px] font-semibold ${
              primaryDisabled
                ? "cursor-not-allowed bg-border-strong text-accent-ink opacity-55"
                : "bg-accent text-accent-ink hover:bg-accent-hover"
            }`}
          >
            {step === 3 ? (submitting ? "Starting…" : running ? "Generating…" : enhancing ? "Enhancing prompt…" : "Generate on-model shots") : "Continue"}
          </button>
        </div>
        {step === 3 && cost != null && (
          <div className="flex flex-col items-center gap-1 text-[12.5px] text-dim">
            <span className="flex items-center gap-1.5">
              <CreditIcon size={14} />
              {output.outputCount} output{output.outputCount === 1 ? "" : "s"} ={" "}
              <span className="font-semibold text-accent">{cost} credits</span>
            </span>
            {short && (
              <span className="text-[#ff8a6b]">
                You have {billing?.totalCredits} — some outputs may not be generated.{" "}
                <button onClick={() => openBuyModal("credits")} className="text-accent underline">
                  Buy credits
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
