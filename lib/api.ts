const MAX_ATTEMPTS = 3
const RETRY_DELAY_MS = 500
// Render's free tier spins the API down after inactivity; a cold start can
// take 30s+, and build-time page rendering fetches from it, so the timeout
// needs enough headroom to survive a cold start rather than fail the build.
const TIMEOUT_MS = 30_000

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

export async function fetchApi<T>(
  path: string,
  options: RequestInit = { cache: 'no-store' },
): Promise<T> {
  const res = await fetchWithRetry(apiUrl(path), options, MAX_ATTEMPTS)

  if (!res.ok) {
    throw new Error(`API request to ${path} failed with status ${res.status}`)
  }

  return res.json() as Promise<T>
}
