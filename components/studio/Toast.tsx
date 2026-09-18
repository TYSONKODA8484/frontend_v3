"use client";

import { useToast } from "@/lib/studio/ToastContext";

export function Toast() {
  const { toast } = useToast();
  if (!toast) return null;
  return (
    <div className="fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 rounded-lg border border-accent bg-surface px-5 py-2.5 text-[13px]">
      {toast}
    </div>
  );
}
