export function UsageTab() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between border border-border px-5 py-3.5">
        <span className="font-mono text-[10.5px] tracking-wide text-dim">CREDITS USED</span>
        <span className="font-heading text-xl font-bold">0</span>
      </div>
      <p className="text-xs text-dim">
        A usage breakdown by teammate and by tool isn&apos;t available yet.
      </p>
    </div>
  );
}
