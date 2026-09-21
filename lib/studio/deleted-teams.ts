// The backend drops a deleted team from GET /teams, so there is nothing to
// list for restoring it. Remember it locally (this browser only) until its
// grace period ends.
export type DeletedTeam = { id: string; name: string; recoverableUntil: string };

const KEY = "shootpx:deleted-teams";

export function readDeletedTeams(): DeletedTeam[] {
  try {
    const list = JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as DeletedTeam[];
    return list.filter((t) => new Date(t.recoverableUntil).getTime() > Date.now());
  } catch {
    return [];
  }
}

export function writeDeletedTeams(list: DeletedTeam[]): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // storage unavailable — the list just won't survive a reload
  }
}
