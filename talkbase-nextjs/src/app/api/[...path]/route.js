/**
 * Catch-all proxy route: /api/* → http://localhost:8000/api/*
 * Also handles expired JWT — returns 401 with expired:true so the
 * frontend can redirect to /login automatically.
 */

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

async function handler(req, { params }) {
  const pathStr    = params.path.join("/");
  const { search } = new URL(req.url);
  const backendUrl = `${BACKEND}/api/${pathStr}${search}`;

  const headers = {};
  const ct   = req.headers.get("content-type");
  const auth = req.headers.get("authorization");
  if (ct)   headers["content-type"]  = ct;
  if (auth) headers["authorization"] = auth;

  const opts = { method: req.method, headers, cache: "no-store" };
  if (!["GET", "HEAD"].includes(req.method)) {
    opts.body = await req.text();
  }

  try {
    const res  = await fetch(backendUrl, opts);
    const body = await res.text();
    return new Response(body, {
      status: res.status,
      headers: { "content-type": res.headers.get("content-type") || "application/json" },
    });
  } catch {
    return new Response(
      JSON.stringify({ message: "Backend unreachable" }),
      { status: 502, headers: { "content-type": "application/json" } }
    );
  }
}

export const GET    = handler;
export const POST   = handler;
export const PUT    = handler;
export const DELETE = handler;
export const PATCH  = handler;
