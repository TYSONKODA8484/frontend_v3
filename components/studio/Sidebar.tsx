"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { studioNavItems } from "./Sidebar.nav-items";
import { useAuth } from "@/lib/auth/AuthContext";
import { useTeam } from "@/lib/studio/TeamContext";

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function isActive(pathname: string, href: string) {
  return href === "/studio" ? pathname === "/studio" : pathname.startsWith(href);
}

export function Sidebar() {
  const [open, setOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useAuth();
  const { activeTeam } = useTeam();

  const label = profile?.name || profile?.email || "Account";

  if (!open) {
    return (
      <div className="flex w-[76px] flex-none flex-col items-center gap-3.5 overflow-auto border-r border-border bg-bg py-4">
        <button onClick={() => setOpen(true)} title="Expand sidebar" className="flex-none">
          <svg width="26" height="26" viewBox="0 0 26 26">
            <rect width="26" height="26" rx="7" fill="var(--color-accent)" />
            <circle cx="13" cy="13" r="6" fill="none" stroke="var(--color-accent-ink)" strokeWidth="2.6" />
            <circle cx="13" cy="13" r="1.7" fill="var(--color-accent-ink)" />
          </svg>
        </button>
        <div className="flex w-full flex-col items-center gap-0.5">
          {studioNavItems.map((n) => {
            const active = isActive(pathname, n.href);
            const Icon = n.icon;
            return (
              <Link
                key={n.id}
                href={n.href}
                title={n.label}
                className={`flex w-16 flex-col items-center gap-1 py-1.5 ${
                  active ? "border-b-2 border-accent bg-surface" : "hover:bg-bg-alt"
                }`}
              >
                <Icon size={17} className={active ? "text-accent" : "text-muted"} />
                <span className={`text-[9px] leading-tight ${active ? "font-semibold text-accent" : "text-dim"}`}>
                  {n.label}
                </span>
              </Link>
            );
          })}
        </div>
        <button
          onClick={() => router.push("/studio/settings")}
          title={`${label} · ${activeTeam?.name ?? "Team"}`}
          className="mt-auto flex h-9 w-9 flex-none items-center justify-center border border-border-strong text-[11px] font-medium hover:border-accent"
        >
          {initials(label)}
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-[180px] flex-none flex-col gap-5 overflow-auto border-r border-border bg-bg px-3.5 py-4">
      <div className="flex items-center gap-2.5">
        <svg width="26" height="26" viewBox="0 0 26 26" className="flex-none">
          <rect width="26" height="26" rx="7" fill="var(--color-accent)" />
          <circle cx="13" cy="13" r="6" fill="none" stroke="var(--color-accent-ink)" strokeWidth="2.6" />
          <circle cx="13" cy="13" r="1.7" fill="var(--color-accent-ink)" />
        </svg>
        <span className="font-heading text-[17px] font-bold tracking-tight">ShootPX</span>
        <button
          onClick={() => setOpen(false)}
          title="Collapse sidebar"
          className="ml-auto border border-border p-1 text-dim hover:text-text"
        >
          <ChevronLeft size={13} />
        </button>
      </div>

      <div className="flex flex-col gap-px">
        {studioNavItems.map((n) => {
          const active = isActive(pathname, n.href);
          const Icon = n.icon;
          return (
            <Link
              key={n.id}
              href={n.href}
              className={`flex items-center gap-2.5 border-l-2 px-2.5 py-2 ${
                active
                  ? "border-accent bg-surface text-text"
                  : "border-transparent text-muted hover:bg-bg-alt hover:text-text"
              }`}
            >
              <Icon size={17} className={active ? "opacity-100" : "opacity-75"} />
              <span className="text-[13.5px] font-medium">{n.label}</span>
            </Link>
          );
        })}
      </div>

      <button
        onClick={() => router.push("/studio/settings")}
        className="mt-auto flex items-center gap-2.5 border border-border p-3 text-left hover:bg-surface"
      >
        <span className="flex h-8 w-8 flex-none items-center justify-center border border-border-strong bg-surface text-[11px] font-medium">
          {initials(label)}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[13px] font-medium">{label}</span>
          <span className="block truncate text-[11px] text-dim">{activeTeam?.name ?? "Team"}</span>
        </span>
      </button>
    </div>
  );
}
