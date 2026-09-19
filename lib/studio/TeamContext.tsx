"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  createTeam as createTeamApi,
  deleteTeam as deleteTeamApi,
  getMyTeams,
  renameTeam as renameTeamApi,
  restoreTeam as restoreTeamApi,
} from "@/lib/api/teams";
import { readCache, writeCache } from "@/lib/studio/session-cache";
import { readDeletedTeams, writeDeletedTeams, type DeletedTeam } from "@/lib/studio/deleted-teams";
import type { MyTeam } from "@/lib/types/team";

const ACTIVE_TEAM_STORAGE_KEY = "shootpx:active-team-id";
const TEAMS_CACHE_KEY = "teams";

function readStoredActiveId(): string | null {
  try {
    return window.localStorage.getItem(ACTIVE_TEAM_STORAGE_KEY);
  } catch {
    return null;
  }
}

function pickActiveId(teams: MyTeam[]): string | null {
  const stored = readStoredActiveId();
  const stillValid = teams.find((t) => t.id === stored);
  return stillValid ? stillValid.id : teams[0]?.id ?? null;
}

type TeamContextValue = {
  teams: MyTeam[];
  activeTeamId: string | null;
  activeTeam: MyTeam | null;
  loading: boolean;
  setActiveTeamId: (id: string) => void;
  refetchTeams: () => void;
  renameTeam: (id: string, name: string) => Promise<void>;
  createTeam: (name: string) => Promise<MyTeam>;
  deleteTeam: (id: string) => Promise<{ recoverableUntil: string }>;
  deletedTeams: DeletedTeam[];
  restoreTeam: (id: string) => Promise<void>;
};

const TeamContext = createContext<TeamContextValue | null>(null);

export function TeamProvider({ children }: { children: ReactNode }) {
  const { firebaseUser } = useAuth();
  // Hydrate straight from last session's cached teams so a reload shows the
  // team switcher/name immediately instead of a blank state, while the real
  // fetch below silently revalidates it.
  const [teams, setTeams] = useState<MyTeam[]>(() => readCache<MyTeam[]>(TEAMS_CACHE_KEY) ?? []);
  const [activeTeamId, setActiveTeamIdState] = useState<string | null>(() => {
    const cached = readCache<MyTeam[]>(TEAMS_CACHE_KEY) ?? [];
    return pickActiveId(cached);
  });
  const [loading, setLoading] = useState(() => readCache<MyTeam[]>(TEAMS_CACHE_KEY) == null);

  const [deletedTeams, setDeletedTeams] = useState<DeletedTeam[]>([]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only readable after mount
    setDeletedTeams(readDeletedTeams());
  }, []);

  function load() {
    // Only needs a valid Firebase ID token, not the backend profile — fetch
    // as soon as sign-in is known instead of waiting on that extra request.
    if (!firebaseUser) return;
    getMyTeams()
      .then(({ teams: fetched }) => {
        setTeams(fetched);
        writeCache(TEAMS_CACHE_KEY, fetched);
        setActiveTeamIdState(pickActiveId(fetched));
      })
      .catch(() => {
        // Keep whatever we already have (cache or previous state) rather
        // than wiping the team switcher just because a refresh failed.
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
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

  async function renameTeam(id: string, name: string) {
    const res = await renameTeamApi(id, name);
    setTeams((prev) => prev.map((t) => (t.id === id ? { ...t, name: res.name } : t)));
  }

  async function createTeam(name: string) {
    const newTeam = await createTeamApi(name);
    setTeams((prev) => [newTeam, ...prev]);
    setActiveTeamId(newTeam.id);
    return newTeam;
  }

  async function deleteTeam(id: string) {
    const res = await deleteTeamApi(id);
    const gone = teams.find((t) => t.id === id);
    if (gone) {
      const next = [...deletedTeams, { id, name: gone.name, recoverableUntil: res.recoverableUntil }];
      setDeletedTeams(next);
      writeDeletedTeams(next);
    }
    const remaining = teams.filter((t) => t.id !== id);
    setTeams(remaining);
    writeCache(TEAMS_CACHE_KEY, remaining);
    if (activeTeamId === id) {
      if (remaining[0]) setActiveTeamId(remaining[0].id);
      else setActiveTeamIdState(null); // that was the last team
    }
    return { recoverableUntil: res.recoverableUntil };
  }

  async function restoreTeam(id: string) {
    await restoreTeamApi(id);
    const next = deletedTeams.filter((t) => t.id !== id);
    setDeletedTeams(next);
    writeDeletedTeams(next);
    // Refetch so the restored team returns to the list, then switch to it.
    const { teams: fetched } = await getMyTeams();
    setTeams(fetched);
    writeCache(TEAMS_CACHE_KEY, fetched);
    if (fetched.some((t) => t.id === id)) setActiveTeamId(id);
    else setActiveTeamIdState(pickActiveId(fetched));
  }

  return (
    <TeamContext.Provider
      value={{
        teams,
        activeTeamId,
        activeTeam,
        loading,
        setActiveTeamId,
        refetchTeams: load,
        renameTeam,
        createTeam,
        deleteTeam,
        deletedTeams,
        restoreTeam,
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
