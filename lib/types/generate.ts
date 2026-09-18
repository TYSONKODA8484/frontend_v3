export type ParamFieldType = "select" | "text" | "color" | "number";

export type ParamOption =
  | string
  | { value: string; label: string; credit_cost?: number };

export type ParamField = {
  name: string;
  label: string;
  type: ParamFieldType;
  required: boolean;
  default?: string | number;
  options?: ParamOption[];
  min?: number;
  max?: number;
};

export type ToolSchema = {
  featureType: string;
  maxInputImages: number;
  paramSchema: ParamField[];
};

export type JobStatus = "pending" | "processing" | "completed" | "failed";

export type GenerateJob = {
  jobId: string;
  status: JobStatus;
  outputUrl?: string | null;
  outputText?: string | null;
  errorMessage?: string | null;
  creditsCharged?: number | null;
};

export type GenerateResponse = {
  batchId: string;
  jobs: { jobId: string; status: JobStatus }[];
  requestedCount: number;
  grantedCount: number;
  partial: boolean;
};

export type BatchResponse = {
  batchId: string;
  jobs: GenerateJob[];
};

export type ModelPreset = {
  id: string;
  name: string;
  thumbnailUrl: string;
};

export function optionValue(opt: ParamOption): string {
  return typeof opt === "string" ? opt : opt.value;
}

export function optionLabel(opt: ParamOption): string {
  return typeof opt === "string" ? opt : opt.label;
}

export function optionCreditCost(opt: ParamOption): number | undefined {
  return typeof opt === "string" ? undefined : opt.credit_cost;
}
