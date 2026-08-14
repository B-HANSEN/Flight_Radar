import { fetchApi } from './api'

function jsonResponse(body: unknown, ok = true, status = 200) {
  return { ok, status, json: () => Promise.resolve(body) } as Response
}

describe('fetchApi', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('returns parsed json on a successful first attempt', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await fetchApi('/weather')

    expect(result).toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('retries after a network failure and succeeds', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('fetch failed'))
      .mockResolvedValueOnce(jsonResponse({ ok: true }))
    vi.stubGlobal('fetch', fetchMock)

    const promise = fetchApi('/weather')
    await vi.runAllTimersAsync()

    await expect(promise).resolves.toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('throws once retries are exhausted', async () => {
    const networkError = new TypeError('fetch failed')
    const fetchMock = vi.fn().mockRejectedValue(networkError)
    vi.stubGlobal('fetch', fetchMock)

    const promise = fetchApi('/weather')
    promise.catch(() => {})
    await vi.runAllTimersAsync()

    await expect(promise).rejects.toBe(networkError)
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('does not retry on a non-ok HTTP response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}, false, 404))
    vi.stubGlobal('fetch', fetchMock)

    await expect(fetchApi('/weather')).rejects.toThrow(
      'API request to /weather failed with status 404',
    )
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
