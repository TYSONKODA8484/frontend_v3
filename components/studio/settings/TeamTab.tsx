"use client";

import { useEffect, useRef, useState } from "react";
import { useTeam } from "@/lib/studio/TeamContext";
import { useToast } from "@/lib/studio/ToastContext";
import { getTeamMembers, getTeamInvites, inviteToTeam, cancelInvite } from "@/lib/api/teams";
import { Plus } from "lucide-react";
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

function friendlyCreateError(err: unknown): string {
  if (err instanceof ApiError && err.status === 400) return "Team name can't be empty.";
  return "Couldn't create the team.";
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
  const {
    teams,
    activeTeamId,
    activeTeam,
    loading: teamsLoading,
    setActiveTeamId,
    renameTeam,
    createTeam,
    deleteTeam,
    deletedTeams,
    restoreTeam,
  } = useTeam();
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
  const [creatingOpen, setCreatingOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmOwnerInvite, setConfirmOwnerInvite] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

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

  async function handleCreateTeam() {
    const name = newTeamName.trim();
    if (!name) return say("Team name can't be empty.");
    setCreating(true);
    try {
      const team = await createTeam(name);
      say(`Created ${team.name} — switched to it`);
      setNewTeamName("");
      setCreatingOpen(false);
    } catch (err) {
      say(friendlyCreateError(err));
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteTeam() {
    if (!activeTeamId || !activeTeam) return;
    setDeleting(true);
    try {
      const { recoverableUntil } = await deleteTeam(activeTeamId);
      const until = new Date(recoverableUntil).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      say(`Deleted ${activeTeam.name}. It can be recovered until ${until}.`);
      setConfirmDelete(false);
      setDeleteConfirmText("");
    } catch (err) {
      say(
        err instanceof ApiError && err.status === 403
          ? "Only the team owner can delete this team."
          : "Couldn't delete the team.",
      );
    } finally {
      setDeleting(false);
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

  async function handleRestore(id: string, name: string) {
    setRestoringId(id);
    try {
      await restoreTeam(id);
      say(`Restored ${name}. Its subscription doesn't resume — subscribe again once its credits run out.`);
    } catch (err) {
      say(
        err instanceof ApiError && err.status === 400
          ? "This team can't be restored any more."
          : "Couldn't restore the team.",
      );
    } finally {
      setRestoringId(null);
    }
  }

  function handleInvite() {
    if (!inviteEmail || inviteEmail.indexOf("@") < 1) return say("Enter a valid email to invite");
    if (inviteRole === "owner") setConfirmOwnerInvite(true);
    else sendInvite();
  }

  async function sendInvite() {
    if (!activeTeamId) return;
    setConfirmOwnerInvite(false);
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
          <button
            onClick={() => setCreatingOpen((o) => !o)}
            className="flex items-center gap-1.5 rounded-full border border-dashed border-border-strong px-4 py-2 text-[13px] text-muted hover:border-accent hover:text-text"
          >
            <Plus size={13} />
            New team
          </button>
        </div>

        {creatingOpen && (
          <div className="mt-3 flex flex-col gap-2">
            <div className="flex gap-2.5">
              <div className="flex-1 border border-border bg-surface px-3.5 py-2.5">
                <input
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="Team name"
                  className="w-full text-[13.5px]"
                />
              </div>
              <button
                onClick={handleCreateTeam}
                disabled={creating}
                className="whitespace-nowrap rounded-full bg-accent px-5 py-2.5 text-[13.5px] font-semibold text-accent-ink hover:bg-accent-hover disabled:opacity-60"
              >
                {creating ? "Creating…" : "Create"}
              </button>
            </div>
            <p className="text-[11.5px] text-dim">
              Starts with 0 credits — you&apos;ll need to buy a pack or subscribe before it can generate.
            </p>
          </div>
        )}
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
                  type="email"
                  autoComplete="off"
                  className="w-full text-[13.5px]"
                />
              </div>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as InviteRole)}
                className="border border-border bg-surface px-3 text-[13px] text-text"
              >
                <option value="editor">Editor</option>
                <option value="owner">Owner</option>
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

      {isOwner && (
        <div className="border-t border-border pt-[18px]">
          <label className="font-mono text-[10.5px] tracking-wide text-dim">DANGER ZONE</label>
          <div className="mt-2.5">
            <button
              onClick={() => {
                setDeleteConfirmText("");
                setConfirmDelete(true);
              }}
              className="rounded-full border border-[#ff5c4d] px-[18px] py-2.5 text-[13px] text-[#ff8a6b] hover:bg-[#ff5c4d]/10"
            >
              Delete team
            </button>
          </div>
        </div>
      )}

      {deletedTeams.length > 0 && (
        <div className="border-t border-border pt-[18px]">
          <label className="font-mono text-[10.5px] tracking-wide text-dim">RECENTLY DELETED TEAMS</label>
          <div className="mt-2.5 border border-border">
            {deletedTeams.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3.5 border-b border-border px-4 py-3 text-[13px] last:border-b-0"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{t.name}</div>
                  <div className="text-[11.5px] text-dim">
                    Recoverable until{" "}
                    {new Date(t.recoverableUntil).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                </div>
                <button
                  onClick={() => handleRestore(t.id, t.name)}
                  disabled={restoringId === t.id}
                  className="rounded-full border border-border-strong px-4 py-2 text-[12.5px] font-medium hover:border-accent disabled:opacity-60"
                >
                  {restoringId === t.id ? "Restoring…" : "Restore"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {confirmOwnerInvite && (
        <div
          onClick={() => setConfirmOwnerInvite(false)}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex w-full max-w-[420px] flex-col gap-3.5 border border-border-strong bg-bg p-7"
          >
            <div className="font-heading text-[17px] font-semibold">Invite {inviteEmail} as an owner?</div>
            <p className="text-[13.5px] leading-relaxed text-muted">
              Owners can delete the team, buy or cancel subscriptions, and invite or remove people. Any one owner
              can delete the team without asking the others.
            </p>
            <div className="mt-1.5 flex gap-2.5">
              <button
                onClick={() => setConfirmOwnerInvite(false)}
                className="flex-1 rounded-full border border-border-strong py-2.5 text-[13.5px] font-medium hover:border-accent"
              >
                Cancel
              </button>
              <button
                onClick={sendInvite}
                className="flex-1 rounded-full bg-accent py-2.5 text-[13.5px] font-semibold text-accent-ink hover:bg-accent-hover"
              >
                Invite as owner
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && activeTeam && (
        <div
          onClick={() => !deleting && setConfirmDelete(false)}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex w-full max-w-[420px] flex-col gap-3.5 border border-border-strong bg-bg p-7"
          >
            <div className="font-heading text-[17px] font-semibold">Delete {activeTeam.name}?</div>
            <p className="text-[13.5px] leading-relaxed text-muted">
              The team will be removed immediately and its subscription cancelled. Every member loses access.
              Nothing is erased for 15 days, so you can recover the team and its credits until then. A
              recovered team needs a new subscription once its existing balance runs out.
            </p>
            {teams.length === 1 && (
              <p className="border border-[#ff5c4d]/40 bg-[#ff5c4d]/10 px-3 py-2 text-[12.5px] leading-relaxed text-[#ff8a6b]">
                This is your only team. After deleting it you won&apos;t have a workspace until you create a new
                one or restore this one.
              </p>
            )}
            <label className="flex flex-col gap-2 text-[12.5px] text-dim">
              Type <span className="font-semibold text-text">{activeTeam.name}</span> to confirm
              <input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                disabled={deleting}
                autoFocus
                className="border border-border bg-surface px-3 py-2.5 text-[13.5px] text-text focus:border-[#ff5c4d]"
              />
            </label>
            <div className="mt-1.5 flex gap-2.5">
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="flex-1 rounded-full border border-border-strong py-2.5 text-[13.5px] font-medium hover:border-accent disabled:opacity-60"
              >
                Keep team
              </button>
              <button
                onClick={handleDeleteTeam}
                disabled={deleting || deleteConfirmText.trim() !== activeTeam.name}
                className="flex-1 rounded-full border border-[#ff5c4d] py-2.5 text-[13.5px] text-[#ff8a6b] hover:bg-[#ff5c4d]/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {deleting ? "Deleting…" : "Delete team"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
