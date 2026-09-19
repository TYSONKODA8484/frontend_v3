"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { CreditIcon } from "@/components/ui/CreditIcon";
import { useAuth } from "@/lib/auth/AuthContext";
import { useTeam } from "@/lib/studio/TeamContext";
import { useTeamBilling } from "@/lib/studio/TeamBillingContext";

function titleCaseSlug(slug: string) {
  return slug
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

function section(pathname: string): { title: string; toolBreadcrumb: boolean } {
  const toolMatch = pathname.match(/^\/studio\/tools\/(.+)$/);
  if (toolMatch) return { title: titleCaseSlug(toolMatch[1]), toolBreadcrumb: true };
  if (pathname.startsWith("/studio/tools")) return { title: "Tools", toolBreadcrumb: false };
  if (pathname.startsWith("/studio/library")) return { title: "Library", toolBreadcrumb: false };
  if (pathname.startsWith("/studio/settings")) return { title: "Settings", toolBreadcrumb: false };
  return { title: "Home", toolBreadcrumb: false };
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useAuth();
  const { activeTeam } = useTeam();
  const { billing, loading: billingLoading, openBuyModal } = useTeamBilling();

  const label = profile?.name || profile?.email || "Account";
  const { title, toolBreadcrumb } = section(pathname);

  return (
    <div className="flex h-[58px] flex-none items-center gap-4 border-b border-border bg-bg px-6">
      {toolBreadcrumb && (
        <Link
          href="/studio/tools"
          className="flex items-center gap-1.5 text-[13px] text-muted hover:text-text"
        >
          <ChevronLeft size={14} />
          Tools
        </Link>
      )}
      <span className="font-heading text-base font-semibold tracking-tight">{title}</span>

      <div className="ml-auto flex items-center gap-4">
        <button
          onClick={() => openBuyModal()}
          className="credit-pill"
        >
          <CreditIcon size={15} />
          {billingLoading ? "…" : `${billing?.totalCredits ?? 0} credits`}
        </button>
        <button
          onClick={() => router.push("/studio/settings")}
          className="flex items-center gap-2 border border-border bg-surface py-1.5 pl-1.5 pr-3"
        >
          <span className="flex h-6 w-6 flex-none items-center justify-center border border-border-strong bg-surface-2 text-[10px] font-semibold">
            {initials(label)}
          </span>
          <span className="text-left leading-tight">
            <span className="block text-xs font-medium">{activeTeam?.name ?? "Team"}</span>
            <span className="block font-mono text-[9px] tracking-wide text-dim">
              {activeTeam?.role ?? ""}
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}
