"use server";

import { getHealthStatus } from "@/lib/health";

/** For Next.js-owned views, such as a future admin panel. */
export async function getHealthStatusAction() {
  return getHealthStatus();
}
