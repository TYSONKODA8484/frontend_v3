// Teams have exactly two roles. A team can have several owners; the last
// owner can't be removed.
export type TeamRole = "owner" | "editor";
export type InviteRole = TeamRole;

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
