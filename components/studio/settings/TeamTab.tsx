"use client";

import { useEffect, useRef, useState } from "react";
import { useTeam } from "@/lib/studio/TeamContext";
import { useToast } from "@/lib/studio/ToastContext";
import { getTeamMembers, getTeamInvites, inviteToTeam, cancelInvite } from "@/lib/api/teams";
import { ApiError } from "@/lib/api/authed-fetch";
import type { InviteRole, TeamInvite, TeamMember } from "@/lib/types/team";

function friendlyInviteError(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    if (err.status === 409) return "Team is full — 5 seats max, including pending invites.";
    if (err.status === 429) return "You're sending invites too fast. Wait a moment and try again.";
    if (err.status === 403) return "Only the team owner can do this.";
  }
  return fallback;
}

function friendlyRenameError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 400) return "Team name can't be empty.";
    if (err.status === 403) return "Only the team owner can rename this team.";
  }
  return "Couldn't rename the team.";
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function TeamTab() {
  const { teams, activeTeamId, activeTeam, loading: teamsLoading, setActiveTeamId, renameTeam } = useTeam();
  const { say } = useToast();

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [invites, setInvites] = useState<TeamInvite[]>([]);
  const [invitesLoading, setInvitesLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<InviteRole>("editor");
  const [inviting, setInviting] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [renaming, setRenaming] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const isOwner = activeTeam?.role === "owner";

  async function handleRename() {
    if (!activeTeamId || !nameInputRef.current) return;
    const name = nameInputRef.current.value.trim();
    if (!name) return say("Team name can't be empty.");
    setRenaming(true);
    try {
      await renameTeam(activeTeamId, name);
      say("Team renamed");
    } catch (err) {
      say(friendlyRenameError(err));
    } finally {
      setRenaming(false);
    }
  }

  function loadMembers() {
    if (!activeTeamId) {
      setMembers([]);
      setMembersLoading(false);
      return;
    }
    setMembersLoading(true);
    getTeamMembers(activeTeamId)
      .then((r) => setMembers(r.members))
      .catch(() => setMembers([]))
      .finally(() => setMembersLoading(false));
  }

  function loadInvites() {
    if (!activeTeamId || !isOwner) {
      setInvites([]);
      setInvitesLoading(false);
      return;
    }
    setInvitesLoading(true);
    getTeamInvites(activeTeamId)
      .then((r) => setInvites(r.invites))
      .catch(() => setInvites([]))
      .finally(() => setInvitesLoading(false));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching members/invites when the active team (or owner status) changes
    loadMembers();
    loadInvites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTeamId, isOwner]);

  async function handleInvite() {
    if (!activeTeamId) return;
    if (!inviteEmail || inviteEmail.indexOf("@") < 1) return say("Enter a valid email to invite");
    setInviting(true);
    try {
      await inviteToTeam(activeTeamId, inviteEmail, inviteRole);
      say(`Invite sent to ${inviteEmail}`);
      setInviteEmail("");
      loadInvites();
    } catch (err) {
      say(friendlyInviteError(err, "Couldn't send the invite"));
    } finally {
      setInviting(false);
    }
  }

  async function handleCancelInvite(id: string) {
    if (!activeTeamId) return;
    setCancellingId(id);
    try {
      await cancelInvite(activeTeamId, id);
      say("Invite cancelled");
      loadInvites();
    } catch (err) {
      say(friendlyInviteError(err, "Couldn't cancel the invite"));
    } finally {
      setCancellingId(null);
    }
  }

  if (teamsLoading) return <p className="text-sm text-dim">Loading teams…</p>;

  const seatsUsed = members.length + invites.length;

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
              {t.name} ({t.role})
            </button>
          ))}
        </div>
      </div>

      {isOwner && (
        <div className="border-t border-border pt-4">
          <label className="font-mono text-[10.5px] tracking-wide text-dim">TEAM NAME</label>
          <div className="mt-2.5 flex gap-2.5">
            <div className="flex-1 border border-border bg-surface px-3.5 py-2.5">
              <input
                key={activeTeamId}
                ref={nameInputRef}
                defaultValue={activeTeam?.name}
                className="w-full text-[13.5px]"
              />
            </div>
            <button
              onClick={handleRename}
              disabled={renaming}
              className="whitespace-nowrap rounded-full border border-border-strong px-5 py-2.5 text-[13.5px] font-medium hover:border-accent disabled:opacity-60"
            >
              {renaming ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      )}

      <div className="border-t border-border pt-4">
        <label className="font-mono text-[10.5px] tracking-wide text-dim">
          MEMBERS ({seatsUsed}/5 seats)
        </label>
        <div className="mt-3 border border-border">
          {membersLoading ? (
            <p className="p-4 text-center text-[13px] text-dim">Loading…</p>
          ) : members.length === 0 ? (
            <p className="p-4 text-center text-[13px] text-dim">No members yet.</p>
          ) : (
            members.map((m) => (
              <div
                key={m.userId}
                className="flex items-center gap-3.5 border-b border-border px-4 py-3 last:border-b-0"
              >
                <span className="flex h-8 w-8 flex-none items-center justify-center border border-border-strong bg-surface-2 text-[11px] font-medium">
                  {initials(m.name || m.email)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-medium">{m.name || m.email}</div>
                  <div className="text-xs text-dim">{m.email}</div>
                </div>
                <span className="rounded-full border border-border px-2.5 py-1 font-mono text-[10.5px] tracking-wide text-muted">
                  {m.role}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {isOwner ? (
        <>
          <div className="border-t border-border pt-4">
            <label className="font-mono text-[10.5px] tracking-wide text-dim">
              INVITE A TEAMMATE
            </label>
            <div className="mt-2.5 flex gap-2.5">
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
                onChange={(e) => setInviteRole(e.target.value as InviteRole)}
                className="border border-border bg-surface px-3 text-[13px] text-text"
              >
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
              <button
                onClick={handleInvite}
                disabled={inviting}
                className="whitespace-nowrap rounded-full bg-accent px-5 py-2.5 text-[13.5px] font-semibold text-accent-ink hover:bg-accent-hover disabled:opacity-60"
              >
                {inviting ? "Sending…" : "Invite"}
              </button>
            </div>
            <p className="mt-2 text-[11.5px] text-dim">5 seats max per team, including pending invites.</p>
          </div>

          <div>
            <span className="font-mono text-[11px] tracking-wide text-dim">PENDING INVITES</span>
            <div className="mt-3 border border-border">
              {invitesLoading ? (
                <p className="p-4 text-center text-[13px] text-dim">Loading…</p>
              ) : invites.length === 0 ? (
                <p className="p-4 text-center text-[13px] text-dim">No pending invites.</p>
              ) : (
                invites.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center gap-3.5 border-b border-border px-4 py-3 text-[13px] last:border-b-0"
                  >
                    <span className="flex-1">{inv.email}</span>
                    <span className="rounded-full border border-border px-2.5 py-1 font-mono text-[10.5px] tracking-wide text-muted">
                      {inv.role}
                    </span>
                    <button
                      onClick={() => handleCancelInvite(inv.id)}
                      disabled={cancellingId === inv.id}
                      className="text-xs text-dim hover:text-[#ff8a6b] disabled:opacity-60"
                    >
                      {cancellingId === inv.id ? "Cancelling…" : "Cancel"}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      ) : (
        <p className="text-[13px] text-dim">Only the team owner can invite teammates.</p>
      )}
    </div>
  );
}
