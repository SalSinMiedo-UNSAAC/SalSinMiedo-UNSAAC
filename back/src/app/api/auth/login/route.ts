import { createSession, sessionCookie } from "@/lib/auth";
import { db } from "@/lib/db";
import { json, options } from "@/lib/http";
import { verifyPassword } from "@/lib/password";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { email?: unknown; password?: unknown };
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const user = email ? await db.user.findUnique({ where: { email } }) : null;

  if (!user || !(await verifyPassword(password, user.passwordSalt, user.passwordHash))) {
    return json(request, { error: "Correo o contraseña incorrectos." }, { status: 401 });
  }

  await db.session.deleteMany({ where: { userId: user.id, expiresAt: { lt: new Date() } } });
  const session = await createSession(user.id);
  const response = json(request, { user: { id: user.id, email: user.email } });
  response.headers.append("Set-Cookie", `${sessionCookie(session.token, session.expiresAt).name}=${session.token}; HttpOnly; Path=/; SameSite=Lax; Expires=${session.expiresAt.toUTCString()}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`);
  return response;
}

export async function OPTIONS(request: Request) { return options(request); }
