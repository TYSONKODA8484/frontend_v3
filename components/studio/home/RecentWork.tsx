import Link from "next/link";

export function RecentWork() {
  return (
    <div className="flex flex-col gap-2.5 px-11 py-7">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[11px] tracking-widest text-dim">RECENT WORK</span>
        <Link href="/studio/library" className="text-[13px] text-muted hover:text-accent">
          View all →
        </Link>
      </div>
      <div className="flex flex-col items-center gap-3 border border-border py-16 text-dim">
        <span className="text-3xl opacity-50">▢</span>
        <span className="text-[15px] font-semibold text-muted">No projects yet</span>
        <span className="text-[13px]">Run a tool to generate your first shoot.</span>
      </div>
    </div>
  );
}
