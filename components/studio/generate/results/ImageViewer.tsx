"use client";

import { useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";

/** Centered lightbox for one generated image, with Download. */
export function ImageViewer({
  url,
  onClose,
  onDownload,
}: {
  url: string;
  onClose: () => void;
  onDownload: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-10"
    >
      <div onClick={(e) => e.stopPropagation()} className="flex max-w-[520px] flex-col items-center gap-4">
        <div className="relative w-full">
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute -right-3.5 -top-3.5 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-border-strong bg-surface hover:border-accent"
          >
            <X size={14} />
          </button>
          <div className="relative h-[60vh] w-[min(520px,80vw)] border border-border bg-surface">
            <Image src={url} alt="Generated image" fill sizes="520px" className="object-contain" />
          </div>
        </div>
        <button
          onClick={onDownload}
          className="rounded-full bg-accent px-7 py-3 text-sm font-semibold text-accent-ink hover:bg-accent-hover"
        >
          Download
        </button>
      </div>
    </div>
  );
}
