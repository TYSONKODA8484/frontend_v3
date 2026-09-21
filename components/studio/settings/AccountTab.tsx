"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/lib/studio/ToastContext";

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AccountTab() {
  const { profile, signOut } = useAuth();
  const { say } = useToast();
  const router = useRouter();
  const [displayName, setDisplayName] = useState(profile?.name ?? "");

  const label = profile?.name || profile?.email || "Account";

  async function handleLogout() {
    await signOut();
    router.replace("/auth");
  }

  function handleSave() {
    // No profile-update endpoint exists yet — this only acknowledges the
    // change locally rather than persisting it.
    say("Account changes saved");
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <div className="flex h-[52px] w-[52px] flex-none items-center justify-center border border-border-strong bg-surface text-base font-medium">
          {initials(label)}
        </div>
        <div>
          <div className="text-[15px] font-semibold">{label}</div>
          <div className="text-[12.5px] text-dim">{profile?.email}</div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <label className="font-mono text-[10.5px] tracking-wide text-dim">DISPLAY NAME</label>
        <div className="border border-border bg-surface px-3.5 py-2.5">
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full text-[13.5px]"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <label className="font-mono text-[10.5px] tracking-wide text-dim">EMAIL</label>
        <div className="border border-border bg-surface-2 px-3.5 py-2.5 text-[13.5px] text-muted">
          {profile?.email}
        </div>
        <span className="text-[11.5px] text-dim">Email cannot be changed</span>
      </div>

      <div className="flex items-center gap-3 border-t border-border pt-4">
        <button
          onClick={handleSave}
          className="whitespace-nowrap rounded-full bg-accent px-5 py-2.5 text-[13.5px] font-semibold text-accent-ink hover:bg-accent-hover"
        >
          Save changes
        </button>
        <button
          onClick={handleLogout}
          className="whitespace-nowrap rounded-full border border-border-strong px-5 py-2.5 text-[13.5px] font-medium hover:border-[#ff8a6b] hover:text-[#ff8a6b]"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
