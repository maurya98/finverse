export type HealthStatus = {
  status: "up" | "down";
  detail?: string;
  code?: string;
  reason?: string;
};

export type HealthResponse = {
  ok: boolean;
  database: HealthStatus;
  cache: HealthStatus;
};
