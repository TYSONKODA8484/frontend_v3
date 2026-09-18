export function EmptyResults() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-dim">
      <span className="h-8 w-8 border border-dim opacity-50" />
      <span className="text-sm text-muted">Nothing generated yet this session</span>
      <span className="text-[12.5px]">Set up your options on the left, then hit Generate.</span>
    </div>
  );
}
