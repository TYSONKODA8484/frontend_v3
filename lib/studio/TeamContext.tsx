"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import type { Team, TeamMember, TeamRole } from "./team-types";

type TeamState = { id: string; name: string; invited: TeamMember[] };

type TeamContextValue = {
  teams: Team[];
  activeTeamId: string;
  activeTeamName: string;
  members: TeamMember[];
  setActiveTeamId: (id: string) => void;
  createTeam: (name: string) => void;
  renameTeam: (name: string) => void;
  deleteTeam: () => void;
  canDeleteActiveTeam: boolean;
  invite: (email: string, role: TeamRole) => void;
  removeMember: (id: string) => void;
};

const TeamContext = createContext<TeamContextValue | null>(null);

/**
 * No team/billing backend exists yet — this is local-only state seeded from
 * the real signed-in user (never fake demo people), matching the reference
 * design's own client-only behavior for this section.
 */
export function TeamProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const [teamStates, setTeamStates] = useState<TeamState[]>([
    { id: "personal", name: "My Team", invited: [] },
  ]);
  const [activeTeamId, setActiveTeamId] = useState("personal");

  const owner: TeamMember = useMemo(
    () => ({
      id: "me",
      name: profile?.name || profile?.email || "You",
      email: profile?.email || "",
      role: "Owner",
      canRemove: false,
    }),
    [profile],
  );

  const activeTeam = teamStates.find((t) => t.id === activeTeamId) ?? teamStates[0];

  function createTeam(name: string) {
    const id = `team-${Date.now()}`;
    setTeamStates((prev) => [...prev, { id, name, invited: [] }]);
    setActiveTeamId(id);
  }

  function renameTeam(name: string) {
    setTeamStates((prev) => prev.map((t) => (t.id === activeTeamId ? { ...t, name } : t)));
  }

  function deleteTeam() {
    if (teamStates.length <= 1) return;
    setTeamStates((prev) => {
      const remaining = prev.filter((t) => t.id !== activeTeamId);
      setActiveTeamId(remaining[0].id);
      return remaining;
    });
  }

  function invite(email: string, role: TeamRole) {
    const member: TeamMember = {
      id: `invited-${Date.now()}`,
      name: email.split("@")[0],
      email,
      role,
      canRemove: true,
    };
    setTeamStates((prev) =>
      prev.map((t) => (t.id === activeTeamId ? { ...t, invited: [...t.invited, member] } : t)),
    );
  }

  function removeMember(id: string) {
    setTeamStates((prev) =>
      prev.map((t) =>
        t.id === activeTeamId ? { ...t, invited: t.invited.filter((m) => m.id !== id) } : t,
      ),
    );
  }

  return (
    <TeamContext.Provider
      value={{
        teams: teamStates.map((t) => ({ id: t.id, name: t.name })),
        activeTeamId,
        activeTeamName: activeTeam.name,
        members: [owner, ...activeTeam.invited],
        setActiveTeamId,
        createTeam,
        renameTeam,
        deleteTeam,
        canDeleteActiveTeam: teamStates.length > 1,
        invite,
        removeMember,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const ctx = useContext(TeamContext);
  if (!ctx) throw new Error("useTeam must be used within a TeamProvider");
  return ctx;
}
