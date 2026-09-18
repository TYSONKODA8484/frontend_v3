"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { getMyTeams } from "@/lib/api/teams";
import type { MyTeam } from "@/lib/types/team";

const ACTIVE_TEAM_STORAGE_KEY = "shootpx:active-team-id";

type TeamContextValue = {
  teams: MyTeam[];
  activeTeamId: string | null;
  activeTeam: MyTeam | null;
  loading: boolean;
  setActiveTeamId: (id: string) => void;
  refetchTeams: () => void;
};

const TeamContext = createContext<TeamContextValue | null>(null);

export function TeamProvider({ children }: { children: ReactNode }) {
  const { firebaseUser } = useAuth();
  const [teams, setTeams] = useState<MyTeam[]>([]);
  const [activeTeamId, setActiveTeamIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function load() {
    // Only needs a valid Firebase ID token, not the backend profile — fetch
    // as soon as sign-in is known instead of waiting on that extra request.
    if (!firebaseUser) return;
    setLoading(true);
    getMyTeams()
      .then(({ teams: fetched }) => {
        setTeams(fetched);
        const stored = window.localStorage.getItem(ACTIVE_TEAM_STORAGE_KEY);
        const stillValid = fetched.find((t) => t.id === stored);
        setActiveTeamIdState(stillValid ? stillValid.id : fetched[0]?.id ?? null);
      })
      .catch(() => setTeams([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching teams once Firebase sign-in state is known
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseUser]);

  function setActiveTeamId(id: string) {
    setActiveTeamIdState(id);
    try {
      window.localStorage.setItem(ACTIVE_TEAM_STORAGE_KEY, id);
    } catch {
      // localStorage unavailable — the choice just won't persist across reloads
    }
  }

  const activeTeam = teams.find((t) => t.id === activeTeamId) ?? null;

  return (
    <TeamContext.Provider
      value={{ teams, activeTeamId, activeTeam, loading, setActiveTeamId, refetchTeams: load }}
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
