// Checkout endpoints return raw snake_case — unlike every other authed
// endpoint in this app, which returns camelCase.

export type CreditPackCheckout = {
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
};

export type SubscriptionCheckout = {
  razorpay_subscription_id: string;
  key_id: string;
};

export type CancelSubscriptionResponse = {
  status: string;
  teamId: string;
};
