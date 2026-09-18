import { authedJson } from "@/lib/api/authed-fetch";
import type {
  InviteRole,
  MyTeamsResponse,
  TeamBilling,
  TeamInvitesResponse,
  TeamMembersResponse,
  TeamUsage,
  TeamUsagePeriod,
} from "@/lib/types/team";
import type { GenerationsPeriod, GenerationsResponse } from "@/lib/types/generation";

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

export function inviteToTeam(teamId: string, email: string, role: InviteRole = "editor") {
  return authedJson<{ sent: boolean; email: string; role: InviteRole }>(`/teams/${teamId}/invite`, {
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
  return authedJson<{ joinedTeamId: string; role: InviteRole }>(`/invites/${token}/accept`, {
    method: "POST",
  });
}

export function getTeamUsage(teamId: string, params?: { period?: TeamUsagePeriod }) {
  const qs = params?.period ? `?period=${params.period}` : "";
  return authedJson<TeamUsage>(`/teams/${teamId}/usage${qs}`);
}

export function getTeamGenerations(
  teamId: string,
  params?: {
    limit?: number;
    offset?: number;
    featureType?: string;
    userId?: string;
    period?: GenerationsPeriod;
  },
) {
  const qs = new URLSearchParams();
  if (params?.limit != null) qs.set("limit", String(params.limit));
  if (params?.offset != null) qs.set("offset", String(params.offset));
  if (params?.featureType) qs.set("feature_type", params.featureType);
  if (params?.userId) qs.set("user_id", params.userId);
  if (params?.period) qs.set("period", params.period);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return authedJson<GenerationsResponse>(`/teams/${teamId}/generations${suffix}`);
}
