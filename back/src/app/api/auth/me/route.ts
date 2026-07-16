import { getCurrentUser } from "@/lib/auth";
import { json, options } from "@/lib/http";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return json(request, { error: "No autenticado." }, { status: 401 });
  return json(request, { user: { id: user.id, email: user.email } });
}

export async function OPTIONS(request: Request) { return options(request); }
