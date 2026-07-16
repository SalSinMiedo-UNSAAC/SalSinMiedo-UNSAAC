import { getHealthStatus } from "@/lib/health";
import { json, options } from "@/lib/http";

export async function GET(request: Request) { return json(request, getHealthStatus()); }
export async function OPTIONS(request: Request) { return options(request); }
