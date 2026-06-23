// Cloudflare Pages Function — same-origin reverse proxy for the API.
//
// Why this exists: the admin panel authenticates with session + CSRF cookies.
// The frontend (Cloudflare Pages) and backend (Render) are different sites, so
// those cookies are cross-site — and Safari/iOS blocks cross-site cookies outright
// regardless of SameSite=None; Secure. By proxying `/api/*` through the frontend's
// own origin, the browser only ever talks to the Pages domain, the cookies become
// first-party, and authentication works everywhere (including iOS Safari / PWA).
//
// Public `/api/v1/**` traffic still goes straight to the backend from the client
// (no cookies, CORS `*`), so only the relative admin calls land here.

interface ProxyEnv {
  // Optional override; defaults to the production Render backend.
  API_BACKEND_URL?: string
}

interface ProxyContext {
  request: Request
  env: ProxyEnv
}

const DEFAULT_BACKEND = 'https://suhba-backend.onrender.com'

export async function onRequest(context: ProxyContext): Promise<Response> {
  const { request, env } = context
  const incoming = new URL(request.url)
  const backend = (env.API_BACKEND_URL ?? DEFAULT_BACKEND).replace(/\/+$/, '')
  const target = `${backend}${incoming.pathname}${incoming.search}`

  // Strip Origin/Host so the backend treats this as a non-CORS, same-origin call
  // (the browser already enforced same-origin against the Pages domain).
  const headers = new Headers(request.headers)
  headers.delete('origin')
  headers.delete('host')

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD'
  const backendResponse = await fetch(target, {
    method: request.method,
    headers,
    body: hasBody ? await request.arrayBuffer() : undefined,
    redirect: 'manual',
  })

  // Pass the response straight through so Set-Cookie (session + CSRF) reaches the
  // browser scoped to the frontend origin — first-party, so Safari keeps it.
  return new Response(backendResponse.body, backendResponse)
}
