const MAX_ATTEMPTS = 3
const RETRY_DELAY_MS = 500

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  attemptsLeft: number,
): Promise<Response> {
  try {
    return await fetch(url, options)
  } catch (error) {
    if (attemptsLeft <= 1) {
      throw error
    }
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS))
    return fetchWithRetry(url, options, attemptsLeft - 1)
  }
}

export async function fetchApi<T>(
  path: string,
  options: RequestInit = { cache: 'no-store' },
): Promise<T> {
  const res = await fetchWithRetry(
    `${process.env.NEXT_PUBLIC_API_URL}${path}`,
    options,
    MAX_ATTEMPTS,
  )

  if (!res.ok) {
    throw new Error(`API request to ${path} failed with status ${res.status}`)
  }

  return res.json() as Promise<T>
}
