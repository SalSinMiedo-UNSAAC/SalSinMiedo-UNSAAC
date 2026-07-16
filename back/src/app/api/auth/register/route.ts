import { createSession, sessionCookie } from "@/lib/auth";
import { db } from "@/lib/db";
import { json, options } from "@/lib/http";
import { hashPassword } from "@/lib/password";

type RegisterInput = { email?: unknown; password?: unknown };

function validate(input: RegisterInput) {
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const password = typeof input.password === "string" ? input.password : "";
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Ingresa un correo válido." };
  if (password.length < 12 || password.length > 128) return { error: "La contraseña debe tener entre 12 y 128 caracteres." };
  return { email, password };
}

export async function POST(request: Request) {
  const parsed = validate((await request.json().catch(() => ({}))) as RegisterInput);
  if ("error" in parsed) return json(request, { error: parsed.error }, { status: 400 });

  const existing = await db.user.findUnique({ where: { email: parsed.email } });
  if (existing) return json(request, { error: "El correo ya está registrado." }, { status: 409 });

  const { hash, salt } = await hashPassword(parsed.password);
  const user = await db.user.create({ data: { email: parsed.email, passwordHash: hash, passwordSalt: salt } });
  const session = await createSession(user.id);
  const response = json(request, { user: { id: user.id, email: user.email } }, { status: 201 });
  response.headers.append("Set-Cookie", `${sessionCookie(session.token, session.expiresAt).name}=${session.token}; HttpOnly; Path=/; SameSite=Lax; Expires=${session.expiresAt.toUTCString()}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`);
  return response;
}

export async function OPTIONS(request: Request) { return options(request); }
