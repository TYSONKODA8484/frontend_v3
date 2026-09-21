export type GenerationStatus = "pending" | "processing" | "completed" | "failed";

export type GenerationDeeplink = {
  type: string;
  route: string;
  params: Record<string, string>;
};

export type Generation = {
  jobId: string;
  batchId: string;
  title: string;
  featureType: string;
  userId?: string; // who ran it, if the backend includes it
  status: GenerationStatus;
  createdAt: string;
  outputUrl: string | null;
  deeplink?: GenerationDeeplink;
};

export type GenerationsResponse = {
  generations: Generation[];
  limit: number;
  offset: number;
};

export type GenerationsPeriod = "last_7_days" | "last_30_days" | "all_time";
