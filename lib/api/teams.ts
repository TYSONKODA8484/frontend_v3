import { authedJson } from "@/lib/api/authed-fetch";
import type {
  InviteRole,
  MyTeam,
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

export function createTeam(name: string) {
  return authedJson<MyTeam>("/teams", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
}

export function renameTeam(teamId: string, name: string) {
  return authedJson<{ id: string; name: string }>(`/teams/${teamId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
}

// Owner only. Soft delete: the backend cancels the subscription and keeps the
// data recoverable until `recoverableUntil`.
export function deleteTeam(teamId: string) {
  return authedJson<{ deleted: string; recoverableUntil: string }>(`/teams/${teamId}`, {
    method: "DELETE",
  });
}

// Owner only, within the grace period. Data and credits come back as they
// were; the subscription does not resume.
export function restoreTeam(teamId: string) {
  return authedJson<unknown>(`/teams/${teamId}/restore`, { method: "POST" });
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
    status?: "queued" | "processing" | "completed" | "failed";
    period?: GenerationsPeriod;
    fromDate?: string; // ISO datetime; the backend ignores period when a date bound is sent
    toDate?: string;
    // "library" also includes model_shoot_generate_model results; the default ("recent") is Home's.
    view?: "recent" | "library";
  },
) {
  const qs = new URLSearchParams();
  if (params?.limit != null) qs.set("limit", String(params.limit));
  if (params?.offset != null) qs.set("offset", String(params.offset));
  if (params?.featureType) qs.set("feature_type", params.featureType);
  if (params?.userId) qs.set("user_id", params.userId);
  if (params?.status) qs.set("status", params.status);
  if (params?.period) qs.set("period", params.period);
  if (params?.fromDate) qs.set("from_date", params.fromDate);
  if (params?.toDate) qs.set("to_date", params.toDate);
  if (params?.view) qs.set("view", params.view);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return authedJson<GenerationsResponse>(`/teams/${teamId}/generations${suffix}`);
}
