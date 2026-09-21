"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";

function useObjectUrls(files: File[]): string[] {
  const [urls, setUrls] = useState<string[]>([]);
  useEffect(() => {
    const created = files.map((f) => URL.createObjectURL(f));
    // Object URLs are created/revoked as the file list changes — an effect is
    // the right tool, not derived state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUrls(created);
    return () => created.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);
  return urls;
}

/** Thumbnails plus a "+" tile that opens the file picker. */
export function ImageSlot({
  files,
  onAdd,
  onRemove,
  disabled,
}: {
  files: File[];
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const urls = useObjectUrls(files);
  const [dragging, setDragging] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        if (disabled) return;
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (!disabled && e.dataTransfer.files.length) onAdd(Array.from(e.dataTransfer.files));
      }}
      className={`flex flex-wrap gap-2 ${dragging ? "outline outline-1 outline-dashed outline-accent" : ""}`}
    >
      {files.map((f, i) => (
        <div key={`${f.name}-${i}`} className="group relative h-[52px] w-[52px] border border-border bg-surface">
          {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
          {urls[i] && <img src={urls[i]} alt="" className="h-full w-full object-cover" />}
          <button
            onClick={() => onRemove(i)}
            aria-label="Remove image"
            className="absolute -right-1.5 -top-1.5 hidden h-4 w-4 items-center justify-center rounded-full bg-black text-white group-hover:flex"
          >
            <X size={10} />
          </button>
        </div>
      ))}
      <button
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        aria-label="Add images"
        className="flex h-[52px] w-[52px] items-center justify-center border-[1.5px] border-dashed border-border-strong text-dim hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus size={18} />
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) onAdd(Array.from(e.target.files));
          e.target.value = "";
        }}
      />
    </div>
  );
}
