export type HealthStatus = {
  service: "sal-sin-miedo-back";
  status: "ok";
  timestamp: string;
};

export function getHealthStatus(): HealthStatus {
  return {
    service: "sal-sin-miedo-back",
    status: "ok",
    timestamp: new Date().toISOString(),
  };
}
