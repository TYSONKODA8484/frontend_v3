export type Tool = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  status: string;
  sortOrder: number;
};

export type ToolsResponse = {
  tools: Tool[];
};
