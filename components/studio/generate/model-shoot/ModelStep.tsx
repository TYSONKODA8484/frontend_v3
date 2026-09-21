"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Check, Loader2, Upload } from "lucide-react";
import { Credits } from "@/components/ui/CreditIcon";
import {
  generate,
  getBatch,
  getCachedModelPresets,
  getCachedToolSchema,
  getModelPresets,
  getToolSchema,
} from "@/lib/api/generate";
import { useTeam } from "@/lib/studio/TeamContext";
import { useTeamBilling } from "@/lib/studio/TeamBillingContext";
import { useToast } from "@/lib/studio/ToastContext";
import { generationCeilingMs } from "@/lib/tools/generation-timeouts";
import { describeShootError, filterUploads, type ModelChoice } from "@/lib/tools/model-shoot";
import { optionLabel, optionValue, type ModelPreset, type ParamField } from "@/lib/types/generate";

type Source = "presets" | "generate" | "upload";
const TABS: { id: Source; label: string }[] = [
  { id: "presets", label: "Presets" },
  { id: "generate", label: "Generate" },
  { id: "upload", label: "Upload" },
];

const selectCls =
  "mt-1.5 w-full border border-border bg-surface px-3 py-2.5 text-[13px] text-text outline-none focus:border-accent";

// The schema lists skin tones light → deep; paint them from the design's
// four-stop range so any number of options still reads as a scale.
const SKIN_RANGE = ["#f0d5bd", "#e0b394", "#b57a4e", "#6d4028"];
function skinSwatch(index: number, count: number): string {
  return SKIN_RANGE[count <= 1 ? 0 : Math.round((index / (count - 1)) * (SKIN_RANGE.length - 1))];
}

// The form opens pre-filled (Female, ~25, White/Caucasian, Slim, Fair) rather than
// empty. Options come from the schema, so match by meaning, not exact value.
const PREFERRED: Record<string, RegExp> = {
  gender: /^female$/i,
  age_bracket: /25/, // the bracket that contains 25, e.g. "25-34"
  ethnicity: /white|caucasian|western/i,
  body_type: /slim/i,
  skin_tone: /fair/i,
};

function pickOption(field: ParamField, pattern: RegExp): string | undefined {
  const hit = (field.options ?? []).find((o) => pattern.test(optionValue(o)) || pattern.test(optionLabel(o)));
  return hit ? optionValue(hit) : undefined;
}

function pollDelay(elapsedMs: number) {
  return elapsedMs < 15_000 ? 2000 : elapsedMs < 60_000 ? 4000 : 8000;
}

export function ModelStep({
  model,
  onChange,
}: {
  model: ModelChoice | null;
  onChange: (m: ModelChoice) => void;
}) {
  const [source, setSource] = useState<Source>("presets");

  return (
    <>
      <div className="font-heading text-[19px] font-semibold">Choose your model</div>
      <div className="flex w-max gap-0.5 border border-border bg-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setSource(t.id)}
            className={`px-4 py-2 text-[12.5px] ${
              source === t.id ? "bg-accent font-semibold text-accent-ink" : "bg-surface text-muted"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {source === "presets" && <Presets model={model} onChange={onChange} />}
      {source === "generate" && <GenerateModel onChange={onChange} />}
      {source === "upload" && <UploadModel onChange={onChange} />}

      {model && <SelectedModel model={model} />}
    </>
  );
}

function Presets({ model, onChange }: { model: ModelChoice | null; onChange: (m: ModelChoice) => void }) {
  const [presets, setPresets] = useState<ModelPreset[] | null>(() => getCachedModelPresets());
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    getModelPresets()
      .then((r) => setPresets(r.presets))
      .catch(() => {
        if (!getCachedModelPresets()) setFailed(true);
      });
  }, []);

  if (failed) return <p className="text-[13px] text-dim">Couldn&apos;t load preset models right now.</p>;
  if (!presets) return <Loader2 size={18} className="animate-spin text-dim" />;
  if (presets.length === 0) return <p className="text-[13px] text-dim">No preset models available.</p>;

  return (
    <div className="grid grid-cols-3 gap-2">
      {presets.map((p) => {
        const on = model?.kind === "preset" && model.id === p.id;
        return (
          <button
            key={p.id}
            onClick={() => onChange({ kind: "preset", id: p.id, name: p.name, thumbnailUrl: p.thumbnailUrl })}
            className={`relative aspect-[3/4] overflow-hidden border-2 ${on ? "border-accent" : "border-transparent"}`}
          >
            <Image src={p.thumbnailUrl} alt={p.name} fill sizes="120px" className="object-cover" />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-1.5 pb-1 pt-4 text-left text-[10.5px] text-white">
              {p.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function UploadModel({ onChange }: { onChange: (m: ModelChoice) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  function pick(files: FileList | null) {
    if (!files?.length) return;
    const { accepted, error: err } = filterUploads([files[0]]);
    setError(err);
    if (accepted[0]) onChange({ kind: "upload", file: accepted[0] });
  }

  return (
    <div>
      <button
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          pick(e.dataTransfer.files);
        }}
        className={`flex w-full flex-col items-center gap-1.5 border-[1.5px] border-dashed px-4 py-6 hover:border-accent ${
          dragging ? "border-accent bg-accent/5" : "border-border-strong"
        }`}
      >
        <Upload size={18} className="text-dim" />
        <span className="text-[13px] text-muted">
          Drop a model photo or <span className="text-accent">select an image</span>
        </span>
      </button>
      {error && <p className="mt-2 text-[12px] text-[#ff8a6b]">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          pick(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// "Create a model": model_shoot_generate_model takes attributes and no images.
// Its form is built from that tool's own schema so option lists never drift.
function GenerateModel({ onChange }: { onChange: (m: ModelChoice) => void }) {
  const { activeTeamId } = useTeam();
  const { refetch: refetchBilling, openBuyModal } = useTeamBilling();
  const { say } = useToast();

  const cachedFields = getCachedToolSchema("model_shoot_generate_model")?.paramSchema ?? null;
  const defaultsOf = (fs: ParamField[]) => {
    const initial: Record<string, string> = {};
    for (const f of fs) {
      const preferred = PREFERRED[f.name] ? pickOption(f, PREFERRED[f.name]) : undefined;
      if (preferred) initial[f.name] = preferred;
      else if (f.default != null) initial[f.name] = String(f.default);
      else if (f.name === "skin_tone" && f.options?.length) initial[f.name] = optionValue(f.options[0]); // lightest
    }
    return initial;
  };
  const [fields, setFields] = useState<ParamField[] | null>(cachedFields);
  const [loadError, setLoadError] = useState(false);
  const [values, setValues] = useState<Record<string, string>>(() => (cachedFields ? defaultsOf(cachedFields) : {}));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ message: string; credits: boolean } | null>(null);
  const [candidate, setCandidate] = useState<{ jobId: string; url: string } | null>(null);
  const cancelled = useRef(false);

  useEffect(() => {
    cancelled.current = false;
    getToolSchema("model_shoot_generate_model")
      .then((s) => {
        setFields(s.paramSchema);
        // Don't clobber choices the user already made from the cached form.
        setValues((prev) => (Object.keys(prev).length ? prev : defaultsOf(s.paramSchema)));
      })
      .catch(() => {
        if (!getCachedToolSchema("model_shoot_generate_model")) setLoadError(true);
      });
    return () => {
      cancelled.current = true;
    };
  }, []);

  async function run() {
    if (!activeTeamId || busy || !fields) return;
    const missing = fields.find((f) => f.required && !values[f.name]);
    if (missing) return setError({ message: `${missing.label} is required.`, credits: false });

    const fd = new FormData();
    fd.append("team_id", activeTeamId);
    fd.append("feature_type", "model_shoot_generate_model");
    for (const [k, v] of Object.entries(values)) if (v) fd.append(k, v);

    setBusy(true);
    setError(null);
    setCandidate(null);
    try {
      const res = await generate(fd);
      refetchBilling();
      const started = Date.now();
      // Poll until this single job settles.
      const ceiling = generationCeilingMs("model_shoot_generate_model");
      for (;;) {
        // Never wait forever: past the ceiling hand the button back so the
        // user can retry (the job may still finish and show in the Library).
        if (Date.now() - started > ceiling) {
          setError({
            message: "This is taking longer than expected. Try again in a moment — if it finishes it will appear in your Library.",
            credits: false,
          });
          break;
        }
        await new Promise((r) => setTimeout(r, pollDelay(Date.now() - started)));
        if (cancelled.current) return;
        const batch = await getBatch(res.batchId);
        const job = batch.jobs[0];
        if (job?.status === "completed" && job.outputUrl) {
          setCandidate({ jobId: job.jobId, url: job.outputUrl });
          break;
        }
        if (job?.status === "failed") {
          setError({ message: job.errorMessage || "Model generation failed.", credits: false });
          break;
        }
      }
      refetchBilling();
    } catch (err) {
      const d = describeShootError(err);
      setError({ message: d.message, credits: d.kind === "credits" });
    } finally {
      if (!cancelled.current) setBusy(false);
    }
  }

  if (loadError) return <p className="text-[13px] text-dim">Couldn&apos;t load the model options right now.</p>;
  if (!fields) return <Loader2 size={18} className="animate-spin text-dim" />;

  const byName = (n: string) => fields.find((f) => f.name === n);
  const notes = fields.find((f) => f.type === "text");
  const skin = byName("skin_tone");
  // Design order: Gender / Age, Ethnicity / Body type, then Skin tone. Any
  // other select the schema adds later still shows, after those.
  const ordered = ["gender", "age_bracket", "ethnicity", "body_type"]
    .map(byName)
    .filter((f): f is ParamField => !!f);
  const extras = fields.filter(
    (f) => f.type === "select" && f.name !== "skin_tone" && !ordered.includes(f),
  );
  const dropdowns = [...ordered, ...extras];
  const set = (name: string, v: string) => setValues((prev) => ({ ...prev, [name]: v }));

  return (
    <div className="flex flex-col gap-3.5">
      <div className="grid grid-cols-2 gap-x-2.5 gap-y-3.5">
        {dropdowns.map((f) => (
          <label key={f.name} className="text-[11.5px] text-dim">
            {f.label}
            <select
              value={values[f.name] ?? ""}
              onChange={(e) => set(f.name, e.target.value)}
              className={selectCls}
            >
              {!f.default && <option value="">Select…</option>}
              {(f.options ?? []).map((o) => (
                <option key={optionValue(o)} value={optionValue(o)}>
                  {optionLabel(o)}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      {skin && (
        <div>
          <div className="mb-2 text-[13px] font-medium">{skin.label}</div>
          <div className="flex gap-3">
            {(skin.options ?? []).map((o, i, all) => {
              const v = optionValue(o);
              const on = values[skin.name] === v;
              return (
                <button
                  key={v}
                  onClick={() => set(skin.name, v)}
                  title={optionLabel(o)}
                  aria-label={optionLabel(o)}
                  aria-pressed={on}
                  className="relative h-9 flex-1 rounded-lg"
                  style={{ background: skinSwatch(i, all.length) }}
                >
                  {on && (
                    <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full border border-black/20 bg-white text-[#111]">
                      <Check size={10} strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {notes && (
        <label className="text-[11.5px] text-dim">
          {notes.label} <span>(optional)</span>
          <textarea
            value={values[notes.name] ?? ""}
            onChange={(e) => set(notes.name, e.target.value)}
            placeholder="Describe your creative ideas for the model, e.g. warm smile, shoulder-length brown hair"
            className="mt-1.5 h-[70px] w-full resize-none border border-border bg-surface p-[11px] text-[12.5px] text-text outline-none focus:border-accent"
          />
        </label>
      )}

      <button
        onClick={run}
        disabled={busy}
        className="rounded-full bg-accent py-3 text-[13.5px] font-semibold text-accent-ink hover:bg-accent-hover disabled:opacity-60"
      >
        {busy ? "Generating… (about 75s)" : candidate ? "Regenerate model" : "Generate model preview"}
      </button>
      <span className="-mt-2 flex items-center justify-center gap-1 text-[11.5px] text-dim">
        <Credits amount={2} size={12} /> per model
      </span>

      {error && (
        <p className="text-[12.5px] text-[#ff8a6b]">
          {error.message}{" "}
          {error.credits && (
            <button onClick={() => openBuyModal("credits")} className="text-accent underline">
              Buy credits
            </button>
          )}
        </p>
      )}

      {candidate && (
        <div className="flex flex-col gap-2">
          <div className="relative aspect-[3/4] w-full border border-border bg-surface">
            <Image src={candidate.url} alt="Generated model" fill sizes="340px" className="object-cover" />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                onChange({ kind: "job", jobId: candidate.jobId, url: candidate.url });
                say("Model approved");
              }}
              className="flex-1 bg-accent py-2.5 text-[13px] font-semibold text-accent-ink hover:bg-accent-hover"
            >
              Use this model
            </button>
            <button
              onClick={run}
              disabled={busy}
              className="border border-border-strong px-4 py-2.5 text-[13px] text-muted hover:text-text disabled:opacity-60"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SelectedModel({ model }: { model: ModelChoice }) {
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  useEffect(() => {
    if (model.kind !== "upload") return;
    const u = URL.createObjectURL(model.file);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- blob URL lifecycle
    setUploadUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [model]);

  const src = model.kind === "preset" ? model.thumbnailUrl : model.kind === "job" ? model.url : uploadUrl;
  const summary =
    model.kind === "preset" ? model.name : model.kind === "job" ? "Generated model" : "Uploaded photo";

  return (
    <div className="flex items-center gap-2.5 border border-accent bg-surface px-3 py-2.5">
      <div className="h-[42px] w-[34px] flex-none overflow-hidden bg-surface-2">
        {/* eslint-disable-next-line @next/next/no-img-element -- may be a local blob preview */}
        {src && <img src={src} alt="" className="h-full w-full object-cover" />}
      </div>
      <div className="min-w-0">
        <div className="text-[12.5px] font-semibold">Model selected</div>
        <div className="truncate text-[11.5px] text-dim">{summary}</div>
      </div>
    </div>
  );
}
