/**
 * The backend sleeps on Render's free tier and takes the better part of a minute to wake
 * up. A single `fetch` against a cold instance times out or 502s, and every read in the
 * app turned that into a permanent error state — a reviewer opening the app on a quiet
 * morning saw a dead screen. Reads go through `apiGet`, so a cold start costs a wait
 * instead of a failure.
 *
 * Writes deliberately do not use this: re-sending a submission that may already have
 * landed would duplicate it.
 */

const MAX_ATTEMPTS = 4
const REQUEST_TIMEOUT_MS = 15_000
const BACKOFF_MS: readonly number[] = [1_000, 3_000, 6_000]
const SERVER_ERROR_FLOOR = 500
const REQUEST_TIMEOUT_STATUS = 408
const TOO_MANY_REQUESTS_STATUS = 429
const NOT_FOUND_STATUS = 404

/** A response the server will keep giving us — a bad request of ours, not a cold start. */
class PermanentError extends Error {}

/** 5xx, 408 and 429 are a server that is not ready yet. Other 4xx are our own fault. */
function isTransient(status: number): boolean {
  return (
    status >= SERVER_ERROR_FLOOR ||
    status === REQUEST_TIMEOUT_STATUS ||
    status === TOO_MANY_REQUESTS_STATUS
  )
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * The deadline has to cover reading the body, not just the headers. `fetch` resolves the
 * moment headers arrive, so clearing the timer there disarms the abort while `json()` is
 * still streaming — a backend that dies mid-response then hangs the screen forever with
 * no error and no retry, which is the exact failure this file exists to prevent.
 */
async function fetchWithin<T>(
  url: string,
  read: (res: Response) => Promise<T>,
  init?: RequestInit,
  timeoutMs: number = REQUEST_TIMEOUT_MS,
): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await read(await fetch(url, { ...init, signal: controller.signal }))
  } finally {
    clearTimeout(timer)
  }
}

export interface ApiGetOptions {
  /** Treat a 404 as "nothing there" and resolve to `undefined` instead of throwing. */
  allowNotFound?: boolean
}

function attemptGet<T>(url: string, options: ApiGetOptions): Promise<T | undefined> {
  return fetchWithin(url, async (res) => {
    if (options.allowNotFound === true && res.status === NOT_FOUND_STATUS) return undefined
    if (res.ok) return (await res.json()) as T

    const message = `Request to ${url} failed: ${res.status}`
    throw isTransient(res.status) ? new Error(message) : new PermanentError(message)
  })
}

/**
 * GETs `url`, retrying a sleeping or overloaded backend with a backoff. Resolves to
 * `undefined` only when `allowNotFound` is set and the server answered 404.
 */
export async function apiGet<T>(url: string, options: ApiGetOptions = {}): Promise<T | undefined> {
  let lastError: Error = new Error(`Request to ${url} never ran`)

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      return await attemptGet<T>(url, options)
    } catch (e: unknown) {
      if (e instanceof PermanentError) throw e
      lastError = e instanceof Error ? e : new Error(String(e))
    }

    const backoff = BACKOFF_MS[attempt]
    if (backoff !== undefined) await wait(backoff)
  }

  throw lastError
}

/** A submission against a cold backend needs room to wake it, but not forever. */
const SUBMIT_TIMEOUT_MS = 45_000

/**
 * POSTs `body` as JSON, once. Writes deliberately do not retry: re-sending a submission
 * that may already have landed would duplicate it. They do get a deadline, so the button
 * cannot sit in its loading state indefinitely against a backend that never answers.
 */
export function apiPost(url: string, body: unknown): Promise<void> {
  return fetchWithin(
    url,
    async (res) => {
      if (!res.ok) throw new Error(`POST to ${url} failed: ${res.status}`)
    },
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    SUBMIT_TIMEOUT_MS,
  )
}
