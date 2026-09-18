export type TeamRole = "owner" | "editor" | "viewer";
// Invites can only ever create editor/viewer members — the backend rejects
// "owner" on POST /teams/{id}/invite with a 422 (there's exactly one owner
// per team, set at creation).
export type InviteRole = "editor" | "viewer";

export type MyTeam = {
  id: string;
  name: string;
  role: TeamRole;
};

export type MyTeamsResponse = {
  teams: MyTeam[];
};

export type TeamInvite = {
  id: string;
  email: string;
  role: InviteRole;
  createdAt: string;
};

export type TeamInvitesResponse = {
  invites: TeamInvite[];
};

export type TeamMember = {
  userId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: TeamRole;
  joinedAt: string;
};

export type TeamMembersResponse = {
  id: string;
  name: string;
  members: TeamMember[];
};

export type TeamBilling = {
  totalCredits: number;
  subscriptionCredits: number;
  topupCredits: number;
  plan: string | null;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
};

export type TeamUsagePeriod = "week" | "month";

export type TeamUsageByMember = {
  userId: string;
  name: string;
  credits: number;
};

export type TeamUsageByTool = {
  featureType: string;
  displayName: string;
  credits: number;
};

export type TeamUsage = {
  creditsUsed: number;
  byMember: TeamUsageByMember[];
  byTool: TeamUsageByTool[];
};
