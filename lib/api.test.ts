import { apiErrorMessage, fetchApi, FlightRadarApiError } from './api'

function jsonResponse(body: unknown, ok = true, status = 200) {
  return { ok, status, json: () => Promise.resolve(body) } as Response
}

function errorResponse(body: unknown, status = 400) {
  return {
    ok: false,
    status,
    json: () => Promise.resolve(body),
  } as Response
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

  it('throws a FlightRadarApiError carrying the backend message and status', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        errorResponse(
          { statusCode: 409, message: 'EC-ERV is already booked 10:00–11:00' },
          409,
        ),
      )
    vi.stubGlobal('fetch', fetchMock)

    const error = (await fetchApi('/bookings').catch(
      (e) => e,
    )) as FlightRadarApiError

    expect(error).toBeInstanceOf(FlightRadarApiError)
    expect(error.statusCode).toBe(409)
    expect(error.serverMessage).toBe('EC-ERV is already booked 10:00–11:00')
    expect(error.message).toBe('EC-ERV is already booked 10:00–11:00')
    expect(error.isExpected).toBe(true)
  })

  it('joins a ValidationPipe message array into serverMessage', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      errorResponse({
        statusCode: 400,
        message: ['date is required', 'bad id'],
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const error = (await fetchApi('/bookings').catch(
      (e) => e,
    )) as FlightRadarApiError

    expect(error.serverMessage).toBe('date is required, bad id')
  })

  it('leaves serverMessage null and marks a 5xx unexpected', async () => {
    const fetchMock = vi.fn().mockResolvedValue(errorResponse('not json', 500))
    vi.stubGlobal('fetch', fetchMock)

    const error = (await fetchApi('/weather').catch(
      (e) => e,
    )) as FlightRadarApiError

    expect(error).toBeInstanceOf(FlightRadarApiError)
    expect(error.serverMessage).toBeNull()
    expect(error.isExpected).toBe(false)
  })
})

describe('apiErrorMessage', () => {
  it('returns the backend message for an expected API error', () => {
    const error = new FlightRadarApiError('Slot taken', {
      path: '/bookings',
      statusCode: 409,
      serverMessage: 'Slot taken',
    })

    expect(apiErrorMessage(error, 'generic')).toBe('Slot taken')
  })

  it('falls back to the generic message for a 5xx, a network error, or a non-error', () => {
    const serverError = new FlightRadarApiError('boom', {
      path: '/bookings',
      statusCode: 500,
      serverMessage: null,
    })

    expect(apiErrorMessage(serverError, 'generic')).toBe('generic')
    expect(apiErrorMessage(new TypeError('fetch failed'), 'generic')).toBe(
      'generic',
    )
    expect(apiErrorMessage('nope', 'generic')).toBe('generic')
  })
})
