import { createHash, randomBytes, randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

const SESSION_COOKIE = "ssm_session";
const SESSION_DAYS = 7;
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.session.create({ data: { id: randomUUID(), userId, tokenHash: hashToken(token), expiresAt } });
  return { token, expiresAt };
}

export function sessionCookie(token: string, expiresAt: Date) {
  return { name: SESSION_COOKIE, value: token, options: { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, expires: expiresAt, path: "/" } };
}

export async function getCurrentUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({ where: { tokenHash: hashToken(token) }, include: { user: true } });
  if (!session || session.expiresAt <= new Date()) return null;
  return session.user;
}

export async function deleteCurrentSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { tokenHash: hashToken(token) } });
}

export const expiredSessionCookie = () => ({ name: SESSION_COOKIE, value: "", options: { httpOnly: true, expires: new Date(0), path: "/" } });
