"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import { navItems } from "./Header.nav-items";

export function Header() {
  const [openNav, setOpenNav] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (openNav && navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenNav(null);
      }
    }
    document.addEventListener("click", handleOutsideClick, true);
    return () => document.removeEventListener("click", handleOutsideClick, true);
  }, [openNav]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-5 px-5 py-3.5">
        <Link href="#top" className="flex flex-none items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 28 28" className="flex-none">
            <rect width="28" height="28" rx="7" fill="var(--color-accent)" />
            <circle cx="14" cy="14" r="6.4" fill="none" stroke="var(--color-accent-ink)" strokeWidth="2.6" />
            <circle cx="14" cy="14" r="1.8" fill="var(--color-accent-ink)" />
          </svg>
          <span className="whitespace-nowrap font-heading text-lg font-bold tracking-tight">ShootPX</span>
        </Link>

        <nav ref={navRef} className="hidden min-w-0 flex-1 justify-center lg:flex">
          <div className="flex items-center gap-1 rounded-full border border-border bg-surface p-1.5">
            {navItems.map((n) => {
              const isOpen = openNav === n.id && !!n.items;
              return (
                <div key={n.id} className="relative">
                  {n.items ? (
                    <>
                      <button
                        onClick={() => setOpenNav((cur) => (cur === n.id ? null : n.id))}
                        className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
                          isOpen ? "bg-surface-2 text-text" : "text-muted hover:bg-surface-2 hover:text-text"
                        }`}
                      >
                        {n.label}
                        {isOpen ? (
                          <ChevronUp size={11} className="text-accent" />
                        ) : (
                          <ChevronDown size={11} className="text-dim" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="animate-drop absolute left-1/2 top-[calc(100%+12px)] min-w-[280px] -translate-x-1/2 rounded-2xl border border-border-strong bg-surface p-2.5 shadow-2xl shadow-black/75">
                          {n.items.map((sub) => (
                            <Link
                              key={sub.name}
                              href={sub.href}
                              className="flex gap-2.5 rounded-lg p-2.5 hover:bg-surface-2"
                              onClick={() => setOpenNav(null)}
                            >
                              <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-accent" />
                              <span className="min-w-0 flex-1">
                                <span className="flex items-center gap-2 text-sm font-medium">
                                  {sub.name}
                                  {sub.badge && (
                                    <span className="rounded-full bg-accent px-1.5 py-0.5 font-mono text-[9px] tracking-wide text-accent-ink">
                                      {sub.badge}
                                    </span>
                                  )}
                                </span>
                                <span className="mt-0.5 block text-xs leading-relaxed text-dim">{sub.desc}</span>
                              </span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={n.href}
                      className="block whitespace-nowrap rounded-full px-4 py-2.5 text-sm text-muted hover:bg-surface-2 hover:text-text"
                    >
                      {n.label}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        <div className="ml-auto flex flex-none items-center gap-3.5">
          <Link
            href="#start"
            className="hidden whitespace-nowrap font-mono text-[11.5px] tracking-wide text-muted sm:inline"
          >
            BOOK DEMO
          </Link>
          <Link
            href="/auth"
            className="whitespace-nowrap rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink hover:bg-accent-hover"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
