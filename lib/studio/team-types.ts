export type TeamRole = "Owner" | "Editor" | "Viewer";

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  canRemove: boolean;
};

export type Team = {
  id: string;
  name: string;
};
