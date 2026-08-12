export async function fetchApi<T>(path: string): Promise<T> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`API request to ${path} failed with status ${res.status}`)
  }

  return res.json() as Promise<T>
}
