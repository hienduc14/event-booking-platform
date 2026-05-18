export type ApiErrorShape = {
  message: string;
  status: number;
  details?: unknown;
};

export type ListParams = {
  skip?: number;
  limit?: number;
};

