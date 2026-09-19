"use client";

import { useState } from "react";
import { AccountTab } from "./AccountTab";
import { TeamTab } from "./TeamTab";
import { BillingTab } from "./BillingTab";
import { UsageTab } from "./UsageTab";

const TABS = [
  { id: "account", name: "Account" },
  { id: "team", name: "Team" },
  { id: "usage", name: "Usage" },
  { id: "billing", name: "Billing" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function SettingsTabs() {
  const [tab, setTab] = useState<TabId>("account");

  return (
    <div className="max-w-3xl px-11 py-8">
      <div className="mb-7 flex gap-[22px] border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`border-b-2 pb-3 text-[13.5px] ${
              tab === t.id ? "border-accent text-white" : "border-transparent text-dim"
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {tab === "account" && <AccountTab />}
      {tab === "team" && <TeamTab />}
      {tab === "billing" && <BillingTab />}
      {tab === "usage" && <UsageTab />}
    </div>
  );
}
