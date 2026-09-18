import { CircleDollarSign } from "lucide-react";

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
      <span className="text-[12.5px] text-dim">
        {fixedCost
          ? "Credit cost is fixed for this tool — shown after generation."
          : "Credit cost depends on your selections above."}
      </span>
    );
  }

  const total = perImage * count;
  return (
    <div className="flex items-center gap-2 text-[12.5px] text-dim">
      <CircleDollarSign size={14} className="flex-none text-accent" />
      <span>
        {perImage} credit{perImage === 1 ? "" : "s"}/image × {count} = <span className="font-semibold text-accent">{total} credits</span>
      </span>
    </div>
  );
}
