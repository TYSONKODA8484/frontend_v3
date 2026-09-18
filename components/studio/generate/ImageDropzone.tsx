"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import { Upload, X } from "lucide-react";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_BYTES = 10 * 1024 * 1024;

export function ImageDropzone({
  files,
  onChange,
  maxFiles,
  label = "Drop images or",
}: {
  files: File[];
  onChange: (files: File[]) => void;
  maxFiles: number;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    // Object URLs must be created/revoked as `files` changes and cleaned up
    // on unmount — an effect is the correct tool here, not derived state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreviewUrls(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  function addFiles(incoming: FileList | File[]) {
    const list = Array.from(incoming);
    const accepted: File[] = [];
    for (const f of list) {
      if (!ACCEPTED_TYPES.includes(f.type)) {
        setError(`${f.name} isn't a PNG, JPEG, or WEBP.`);
        continue;
      }
      if (f.size > MAX_BYTES) {
        setError(`${f.name} is over the 10MB limit.`);
        continue;
      }
      accepted.push(f);
    }
    const combined = [...files, ...accepted];
    if (combined.length > maxFiles) {
      setError(`Up to ${maxFiles} image${maxFiles === 1 ? "" : "s"} allowed.`);
      onChange(combined.slice(0, maxFiles));
      return;
    }
    if (accepted.length) setError("");
    onChange(combined);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  }

  function removeAt(index: number) {
    onChange(files.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer items-center justify-center gap-2 border-2 border-dashed px-4 py-4 ${
          dragging ? "border-accent bg-accent/5" : "border-border-strong hover:border-accent"
        }`}
      >
        <Upload size={16} className="text-dim" />
        <span className="text-[13.5px] text-muted">
          {label} <span className="text-accent">select images</span>
        </span>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_TYPES.join(",")}
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
      </div>

      {error && <span className="text-xs text-[#ff8a6b]">{error}</span>}

      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((f, i) => (
            <div key={`${f.name}-${i}`} className="group relative h-16 w-16 flex-none overflow-hidden border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element -- transient local blob preview, not worth next/image's overhead */}
              <img src={previewUrls[i]} alt={f.name} className="h-full w-full object-cover" />
              <button
                onClick={() => removeAt(i)}
                className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100"
                aria-label={`Remove ${f.name}`}
              >
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      <span className="text-[11px] text-dim">
        {files.length}/{maxFiles} images · PNG, JPEG or WEBP, up to 10MB each
      </span>
    </div>
  );
}
