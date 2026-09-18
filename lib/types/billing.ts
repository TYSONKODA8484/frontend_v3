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
