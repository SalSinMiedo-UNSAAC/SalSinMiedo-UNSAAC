const allowedOrigins = new Set(["http://localhost:4200", "http://localhost:8080", process.env.FRONTEND_ORIGIN].filter((origin): origin is string => Boolean(origin)));

export function corsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get("origin");
  return origin && allowedOrigins.has(origin) ? { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Credentials": "true", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", Vary: "Origin" } : {};
}

export function json(request: Request, body: unknown, init: ResponseInit = {}) {
  return Response.json(body, { ...init, headers: { ...corsHeaders(request), ...init.headers } });
}

export const options = (request: Request) => new Response(null, { status: 204, headers: corsHeaders(request) });
