"use client";

import { ImageSlot } from "./ImageSlot";
import { MAX_EXTRA_SLOTS, MAX_TOTAL_IMAGES, type ExtraSlot } from "@/lib/tools/model-shoot";

export type ProductMode = "single" | "multi";

export type SlotFiles = Record<string, File[]>;

export type ProductsState = {
  mode: ProductMode;
  files: SlotFiles; // keyed by slot id: single | top | bottom | <extra id>
  extras: ExtraSlot[];
  refs: File[];
};

export const emptyProducts = (): ProductsState => ({ mode: "single", files: {}, extras: [], refs: [] });

/** The slots that are visible (and therefore sent) for the current mode. */
export function visibleSlotIds(p: ProductsState): string[] {
  return p.mode === "single" ? ["single"] : ["top", "bottom", ...p.extras.map((x) => x.id)];
}

export function productImageCount(p: ProductsState): number {
  return visibleSlotIds(p).reduce((n, id) => n + (p.files[id]?.length ?? 0), 0);
}

const MODES: { id: ProductMode; label: string }[] = [
  { id: "single", label: "Single garment" },
  { id: "multi", label: "Multiple garments" },
];

export function ProductsStep({
  state,
  onChange,
  totalImages,
  onAddFiles,
}: {
  state: ProductsState;
  onChange: (next: ProductsState) => void;
  totalImages: number;
  /** Validates and caps the incoming files against the 10-image budget. */
  onAddFiles: (current: File[], incoming: File[]) => File[];
}) {
  const atLimit = totalImages >= MAX_TOTAL_IMAGES;
  const over = totalImages > MAX_TOTAL_IMAGES;

  const setSlot = (id: string, files: File[]) => onChange({ ...state, files: { ...state.files, [id]: files } });

  const slotRow = (id: string, label: React.ReactNode) => {
    const files = state.files[id] ?? [];
    return (
      <div key={id} className="flex flex-col gap-2.5 border border-border bg-surface p-3.5">
        <div className="flex items-center gap-2.5">
          {label}
          <span className="ml-auto font-mono text-[10.5px] text-dim">{files.length} img</span>
        </div>
        <ImageSlot
          files={files}
          disabled={atLimit}
          onAdd={(incoming) => setSlot(id, onAddFiles(files, incoming))}
          onRemove={(i) => setSlot(id, files.filter((_, j) => j !== i))}
        />
        <span className="text-[11px] text-dim">Front, back, side, detail — as many angles as you have</span>
      </div>
    );
  };

  return (
    <>
      <div className="font-heading text-[19px] font-semibold">Garments &amp; products</div>
      <div className="flex w-max gap-0.5 border border-border bg-border">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => onChange({ ...state, mode: m.id })}
            className={`whitespace-nowrap px-4 py-2 text-[12.5px] ${
              state.mode === m.id ? "bg-accent font-semibold text-accent-ink" : "bg-surface text-muted"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3.5">
        {state.mode === "single" ? (
          slotRow("single", <span className="text-[13px] font-semibold">Garment</span>)
        ) : (
          <>
            {slotRow("top", <span className="text-[13px] font-semibold">Top</span>)}
            {slotRow("bottom", <span className="text-[13px] font-semibold">Bottom</span>)}
            {state.extras.map((x) =>
              slotRow(
                x.id,
                <>
                  <input
                    value={x.label}
                    onChange={(e) =>
                      onChange({
                        ...state,
                        extras: state.extras.map((y) => (y.id === x.id ? { ...y, label: e.target.value } : y)),
                      })
                    }
                    placeholder="e.g. Watch, Hat, Shoes, Bag"
                    maxLength={40}
                    className="min-w-0 flex-1 border border-border bg-bg px-2.5 py-1.5 text-[12.5px] text-text outline-none focus:border-accent"
                  />
                  <button
                    onClick={() => {
                      const { [x.id]: _removed, ...rest } = state.files;
                      void _removed;
                      onChange({ ...state, files: rest, extras: state.extras.filter((y) => y.id !== x.id) });
                    }}
                    className="text-[12px] text-dim hover:text-text"
                  >
                    Remove
                  </button>
                </>,
              ),
            )}
            {state.extras.length < MAX_EXTRA_SLOTS && (
              <button
                onClick={() =>
                  onChange({ ...state, extras: [...state.extras, { id: `x${Date.now()}`, label: "" }] })
                }
                className="border border-dashed border-border-strong py-2.5 text-center text-[12.5px] text-muted hover:border-accent hover:text-accent"
              >
                + Add garment
              </button>
            )}
          </>
        )}

        <div className="flex flex-col gap-2 border border-border bg-surface p-3.5">
          <div className="text-[13px] font-semibold">
            Reference images <span className="font-normal text-dim">optional</span>
          </div>
          <span className="text-[11px] text-dim">Style and pose guidance only — never product identity</span>
          <ImageSlot
            files={state.refs}
            disabled={atLimit}
            onAdd={(incoming) => onChange({ ...state, refs: onAddFiles(state.refs, incoming) })}
            onRemove={(i) => onChange({ ...state, refs: state.refs.filter((_, j) => j !== i) })}
          />
        </div>

        <div className={`flex items-center justify-between text-[11.5px] ${over ? "text-[#ff6b5e]" : "text-dim"}`}>
          <span>
            {totalImages} / {MAX_TOTAL_IMAGES} images
          </span>
          <span>
            {over
              ? `Remove ${totalImages - MAX_TOTAL_IMAGES} to continue`
              : `1 model + ${productImageCount(state)} product + ${state.refs.length} reference`}
          </span>
        </div>
      </div>
    </>
  );
}
