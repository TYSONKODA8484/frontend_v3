import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LEGAL_LAST_UPDATED, type LegalSection } from "@/content/legal";

export function LegalPage({ title, sections }: { title: string; sections: LegalSection[] }) {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-5 pb-24 pt-32">
        <span className="font-mono text-[11px] tracking-widest text-accent-dim">LEGAL</span>
        <h1 className="mt-3 font-heading text-[clamp(32px,4vw,44px)] font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-[13px] text-dim">Last updated {LEGAL_LAST_UPDATED}</p>
        <div className="mt-10 flex flex-col gap-8">
          {sections.map((s) => (
            <section key={s.heading}>
              <h2 className="font-heading text-lg font-semibold tracking-tight">{s.heading}</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{s.body}</p>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
