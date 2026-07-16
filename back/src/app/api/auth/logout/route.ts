import { deleteCurrentSession, expiredSessionCookie } from "@/lib/auth";
import { json, options } from "@/lib/http";

export async function POST(request: Request) {
  await deleteCurrentSession();
  const cookie = expiredSessionCookie();
  const response = json(request, { ok: true });
  response.headers.append("Set-Cookie", `${cookie.name}=; HttpOnly; Path=/; Max-Age=0`);
  return response;
}

export async function OPTIONS(request: Request) { return options(request); }
