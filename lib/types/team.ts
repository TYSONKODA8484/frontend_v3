export type TeamRole = "owner" | "editor";

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
  role: TeamRole;
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
