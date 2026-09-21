import { CreditIcon } from "@/components/ui/CreditIcon";

export function CreditCostBadge({
  perImage,
  count,
  fixedCost,
}: {
  perImage: number | null;
  count: number;
  fixedCost?: boolean;
}) {
  if (perImage == null) {
    return (
      <span className="text-center text-[12.5px] text-dim">
        {fixedCost
          ? "Credit cost is fixed for this tool — shown after generation."
          : "Credit cost depends on your selections above."}
      </span>
    );
  }

  return (
    <div className="flex items-center justify-center gap-1.5 text-[12.5px] text-dim">
      1 generation = <CreditIcon size={13} />
      {perImage * count} credits
    </div>
  );
}
