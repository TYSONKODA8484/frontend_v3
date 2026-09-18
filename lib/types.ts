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

export type BillingPlan = {
  id: string;
  slug: string;
  name: string;
  price: number;
  billingPeriodDays?: number;
  periodLabel?: string;
  credits: number;
  info: string[];
  tag: string;
  sortOrder: number;
};

export type BillingResponse = {
  subscriptions: BillingPlan[];
  credits: BillingPlan[];
};
