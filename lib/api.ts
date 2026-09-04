const MAX_ATTEMPTS = 3
const RETRY_DELAY_MS = 500
// Render's free tier spins the API down after inactivity; a cold start can
// take 30s+, and build-time page rendering fetches from it, so the timeout
// needs enough headroom to survive a cold start rather than fail the build.
const TIMEOUT_MS = 30_000

// A non-2xx response from the API. Carries the backend's own message when it
// sent one (`serverMessage`) so a caller can surface it verbatim, plus the
// HTTP status so it can branch on "expected" (a 4xx it can act on) vs. an
// unexpected server-side failure. A network/timeout failure is not this — it
// propagates as the raw fetch error, so `instanceof` alone tells the two
// apart.
export class FlightRadarApiError extends Error {
  readonly path: string
  readonly statusCode: number
  // The human-readable message pulled from the response body, or null when
  // the body carried nothing usable. `message` always has something (this
  // when present, a generic string otherwise) for logs.
  readonly serverMessage: string | null

  constructor(
    message: string,
    init: { path: string; statusCode: number; serverMessage: string | null },
  ) {
    super(message)
    this.name = 'FlightRadarApiError'
    this.path = init.path
    this.statusCode = init.statusCode
    this.serverMessage = init.serverMessage
  }

  // A 4xx the caller can meaningfully handle or show (bad input, a conflict,
  // a missing record) rather than an unexpected 5xx defect.
  get isExpected(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500
  }
}

// Nest error responses look like `{ statusCode, message, error }`, where
// `message` is a string for most exceptions and a string[] from a failed
// ValidationPipe. Returns the readable part, or null when the body isn't
// JSON or has nothing usable.
async function readServerErrorMessage(res: Response): Promise<string | null> {
  let body: unknown
  try {
    body = await res.json()
  } catch {
    return null
  }

  if (typeof body !== 'object' || body === null) return null
  const { message } = body as { message?: unknown }

  if (typeof message === 'string' && message.trim() !== '') {
    return message
  }
  if (Array.isArray(message)) {
    const parts = message.filter(
      (part): part is string => typeof part === 'string' && part.trim() !== '',
    )
    if (parts.length > 0) return parts.join(', ')
  }
  return null
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  attemptsLeft: number,
): Promise<Response> {
  try {
    return await fetch(url, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      ...options,
    })
  } catch (error) {
    if (attemptsLeft <= 1) {
      throw error
    }
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS))
    return fetchWithRetry(url, options, attemptsLeft - 1)
  }
}

// Builds a full API URL for cases that need the raw address rather than a
// fetchApi() JSON round-trip — e.g. a direct <a href> download link.
export function apiUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_API_URL}${path}`
}

// Picks the message to show a user: the backend's own text when the failure
// was an expected one (a 4xx the API described), the generic fallback
// otherwise — a 5xx, a network drop, or a non-API throw all carry nothing a
// user should see.
export function apiErrorMessage(error: unknown, fallback: string): string {
  return error instanceof FlightRadarApiError && error.serverMessage
    ? error.serverMessage
    : fallback
}

export async function fetchApi<T>(
  path: string,
  options: RequestInit = { cache: 'no-store' },
): Promise<T> {
  const res = await fetchWithRetry(apiUrl(path), options, MAX_ATTEMPTS)

  if (!res.ok) {
    const serverMessage = await readServerErrorMessage(res)
    throw new FlightRadarApiError(
      serverMessage ??
        `API request to ${path} failed with status ${res.status}`,
      { path, statusCode: res.status, serverMessage },
    )
  }

  return res.json() as Promise<T>
}
