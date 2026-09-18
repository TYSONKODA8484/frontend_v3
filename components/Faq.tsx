"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const FAQS = [
  {
    q: "What is ShootPX?",
    a: "ShootPX is an AI product photoshoot and video platform. Upload one product photo and generate studio-quality scenes, product motion clips and AI UGC-style ad videos without booking a studio, camera or creator.",
  },
  {
    q: "How does ShootPX keep my product looking accurate?",
    a: "Precise mode locks your product pixel-for-pixel where you place it, preserving logos, labels and fine details. Creative mode lets the model restage and rescale the product for more expressive scenes when exact placement matters less.",
  },
  {
    q: "Can ShootPX generate product videos?",
    a: "Product Motion and UGC Avatar Ads are coming soon. Product Motion will turn a still image into a short clip using camera presets like orbit, push-in and pan. UGC Avatar Ads will pair a script with an AI actor to produce vertical 9:16 ads with burned-in captions.",
  },
  {
    q: "Does ShootPX work for large catalogs?",
    a: "Batch Studio, which will apply one scene preset consistently across up to 250 products per job, is launching soon. Today, catalogs are processed one product at a time through the Photoshoot editor.",
  },
  {
    q: "Which marketplaces are supported for export?",
    a: "ShootPX exports at marketplace-ready sizes for Shopify, Amazon, Etsy and paid social, including 4K masters on higher credit packs. Aspect presets cover 1:1, 4:5, 16:9 and 9:16.",
  },
  {
    q: "How does ShootPX pricing work?",
    a: "ShootPX runs on credits, not a subscription. Buy a credit pack once and spend credits only on the generations you use — there is no recurring charge and unused credits never expire.",
  },
];

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
          {FAQS.map((f, i) => {
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
