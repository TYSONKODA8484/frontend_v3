"use client";

import { usePathname, useRouter } from "next/navigation";
import { CircleDollarSign } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useTeam } from "@/lib/studio/TeamContext";
import { useCredits } from "@/lib/studio/CreditsContext";

function sectionTitle(pathname: string) {
  if (pathname.startsWith("/studio/tools")) return "Tools";
  if (pathname.startsWith("/studio/library")) return "Library";
  if (pathname.startsWith("/studio/settings")) return "Settings";
  return "Home";
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
  const { activeTeamName } = useTeam();
  const { credits, openBuyModal } = useCredits();

  const label = profile?.name || profile?.email || "Account";

  return (
    <div className="flex h-[58px] flex-none items-center gap-4 border-b border-border bg-bg px-6">
      <span className="font-heading text-base font-semibold tracking-tight">
        {sectionTitle(pathname)}
      </span>

      <div className="ml-auto flex items-center gap-4">
        <button
          onClick={() => openBuyModal()}
          className="flex items-center gap-1.5 whitespace-nowrap border border-border-strong px-3.5 py-1.5 font-mono text-xs text-accent hover:border-accent"
        >
          <CircleDollarSign size={15} className="flex-none" />
          {credits} credits
        </button>
        <button
          onClick={() => router.push("/studio/settings")}
          className="flex items-center gap-2 border border-border bg-surface py-1.5 pl-1.5 pr-3"
        >
          <span className="flex h-6 w-6 flex-none items-center justify-center border border-border-strong bg-surface-2 text-[10px] font-semibold">
            {initials(label)}
          </span>
          <span className="text-left leading-tight">
            <span className="block text-xs font-medium">{activeTeamName}</span>
            <span className="block font-mono text-[9px] tracking-wide text-dim">Owner</span>
          </span>
        </button>
      </div>
    </div>
  );
}
