"use client";

import { useState } from "react";
import { useTeam } from "@/lib/studio/TeamContext";
import { useToast } from "@/lib/studio/ToastContext";
import type { TeamRole } from "@/lib/studio/team-types";

export function TeamTab() {
  const {
    teams,
    activeTeamId,
    activeTeamName,
    members,
    setActiveTeamId,
    createTeam,
    renameTeam,
    deleteTeam,
    canDeleteActiveTeam,
    invite,
    removeMember,
  } = useTeam();
  const { say } = useToast();

  const [newTeamName, setNewTeamName] = useState("");
  const [renameValue, setRenameValue] = useState(activeTeamName);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamRole>("Editor");

  // Re-seed the rename field when the active team changes, by adjusting
  // state during render rather than in an effect (React's documented
  // pattern for deriving state from a prop change).
  const [prevActiveTeamName, setPrevActiveTeamName] = useState(activeTeamName);
  if (activeTeamName !== prevActiveTeamName) {
    setPrevActiveTeamName(activeTeamName);
    setRenameValue(activeTeamName);
  }

  function handleCreate() {
    const name = newTeamName.trim();
    if (!name) return say("Enter a team name first");
    createTeam(name);
    setNewTeamName("");
    say(`Created team "${name}"`);
  }

  function handleRename() {
    const name = renameValue.trim();
    if (!name) return;
    renameTeam(name);
    say(`Team renamed to "${name}"`);
  }

  function handleInvite() {
    if (!inviteEmail || inviteEmail.indexOf("@") < 1) return say("Enter a valid email to invite");
    invite(inviteEmail, inviteRole);
    say(`Invite sent to ${inviteEmail}`);
    setInviteEmail("");
  }

  function handleDelete() {
    const name = activeTeamName;
    deleteTeam();
    say(`Deleted team "${name}"`);
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className="font-mono text-[10.5px] tracking-wide text-dim">
          YOUR TEAMS ({teams.length})
        </label>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {teams.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTeamId(t.id)}
              className={`rounded-full px-4 py-2 text-[13px] ${
                t.id === activeTeamId
                  ? "bg-accent font-semibold text-accent-ink"
                  : "border border-border-strong text-muted hover:border-accent hover:text-text"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <label className="font-mono text-[10.5px] tracking-wide text-dim">CREATE A NEW TEAM</label>
        <div className="mt-2.5 flex gap-2.5">
          <div className="flex-1 border border-border bg-surface px-3.5 py-2.5">
            <input
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="Team name"
              className="w-full text-[13.5px]"
            />
          </div>
          <button
            onClick={handleCreate}
            className="whitespace-nowrap rounded-full border border-border-strong bg-surface px-5 py-2.5 text-[13.5px] font-medium hover:border-accent"
          >
            Create
          </button>
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <label className="font-mono text-[10.5px] tracking-wide text-dim">
          RENAME &quot;{activeTeamName}&quot;
        </label>
        <div className="mt-2.5 flex gap-2.5">
          <div className="flex-1 border border-border bg-surface px-3.5 py-2.5">
            <input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="w-full text-[13.5px]"
            />
          </div>
          <button
            onClick={handleRename}
            className="whitespace-nowrap rounded-full border border-border-strong bg-surface px-5 py-2.5 text-[13.5px] font-medium hover:border-accent"
          >
            Rename
          </button>
        </div>
      </div>

      <div className="flex gap-2.5">
        <div className="flex-1 border border-border bg-surface px-3.5 py-2.5">
          <input
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="teammate@brandco.com"
            className="w-full text-[13.5px]"
          />
        </div>
        <select
          value={inviteRole}
          onChange={(e) => setInviteRole(e.target.value as TeamRole)}
          className="border border-border bg-surface px-3 text-[13px] text-text"
        >
          <option value="Editor">Editor</option>
          <option value="Viewer">Viewer</option>
        </select>
        <button
          onClick={handleInvite}
          className="whitespace-nowrap rounded-full bg-accent px-5 py-2.5 text-[13.5px] font-semibold text-accent-ink hover:bg-accent-hover"
        >
          Invite
        </button>
      </div>

      <div className="border border-border">
        {members.map((m) => (
          <div key={m.id} className="flex items-center gap-3.5 border-b border-border px-4 py-3.5 last:border-b-0">
            <div className="flex h-8 w-8 flex-none items-center justify-center border border-border-strong bg-surface-2 text-[11px] font-medium">
              {m.name
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13.5px] font-medium">{m.name}</div>
              <div className="text-xs text-dim">{m.email}</div>
            </div>
            <span className="rounded-full border border-border px-2.5 py-1 font-mono text-[10.5px] tracking-wide text-muted">
              {m.role}
            </span>
            {m.canRemove ? (
              <button
                onClick={() => removeMember(m.id)}
                className="w-16 text-right text-xs text-dim hover:text-[#ff8a6b]"
              >
                Remove
              </button>
            ) : (
              <span className="w-16" />
            )}
          </div>
        ))}
      </div>

      {canDeleteActiveTeam && (
        <div className="border-t border-border pt-4">
          <label className="font-mono text-[10.5px] tracking-wide text-dim">DANGER ZONE</label>
          <button
            onClick={handleDelete}
            className="mt-2.5 inline-block rounded-full border border-[#ff5c4d] px-4 py-2.5 text-[13px] text-[#ff8a6b] hover:bg-[#ff5c4d]/10"
          >
            Delete team
          </button>
        </div>
      )}
    </div>
  );
}
