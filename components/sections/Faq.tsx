"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { faqs } from "@/content/faq";

export function Faq() {
  const [open, setOpen] = useState<number>(0);

  return (
    <section id="faq" aria-label="Frequently asked questions" className="border-t border-border">
      <div className="mx-auto max-w-3xl px-5 py-16">
        <div className="mb-9 text-center">
          <span className="font-mono text-[11px] tracking-widest text-accent-dim">FAQ</span>
          <h2 className="mt-3 font-heading text-[clamp(28px,3.2vw,40px)] font-semibold tracking-tight">
            Questions, answered.
          </h2>
        </div>
        <div className="flex flex-col gap-2.5">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className="overflow-hidden rounded-xl border border-border bg-surface">
                <button
                  onClick={() => setOpen((cur) => (cur === i ? -1 : i))}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <h3 className="text-[15px] font-semibold">{f.q}</h3>
                  {isOpen ? (
                    <Minus size={17} className="flex-none text-accent" />
                  ) : (
                    <Plus size={17} className="flex-none text-accent" />
                  )}
                </button>
                {isOpen && (
                  <p className="max-w-[70ch] px-5 pb-5 text-sm leading-relaxed text-muted">{f.a}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
