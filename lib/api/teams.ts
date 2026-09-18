import { authedJson } from "@/lib/api/authed-fetch";
import type {
  MyTeamsResponse,
  TeamBilling,
  TeamInvitesResponse,
  TeamMembersResponse,
  TeamRole,
} from "@/lib/types/team";

export function getMyTeams() {
  return authedJson<MyTeamsResponse>("/teams");
}

export function getTeamMembers(teamId: string) {
  return authedJson<TeamMembersResponse>(`/teams/${teamId}/members`);
}

export function getTeamBilling(teamId: string) {
  return authedJson<TeamBilling>(`/teams/${teamId}/billing`);
}

export function getTeamInvites(teamId: string) {
  return authedJson<TeamInvitesResponse>(`/teams/${teamId}/invites`);
}

export function inviteToTeam(teamId: string, email: string, role: TeamRole = "editor") {
  return authedJson<{ sent: boolean; email: string; role: TeamRole }>(`/teams/${teamId}/invite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, role }),
  });
}

export function cancelInvite(teamId: string, inviteId: string) {
  return authedJson<{ cancelled: string }>(`/teams/${teamId}/invites/${inviteId}`, {
    method: "DELETE",
  });
}

export function acceptInvite(token: string) {
  return authedJson<{ joinedTeamId: string; role: TeamRole }>(`/invites/${token}/accept`, {
    method: "POST",
  });
}
