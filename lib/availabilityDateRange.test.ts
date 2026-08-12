import {
  getAvailabilityDateRange,
  isValidAvailabilityDate,
} from './availabilityDateRange'

describe('getAvailabilityDateRange', () => {
  it('clamps the 6-months-ahead date to the last day of the target month when the day does not exist there', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 4, 31)) // 31 May 2026

    const { max } = getAvailabilityDateRange()

    // 31 Nov doesn't exist, so it must clamp to 30 Nov, not roll over into December.
    expect(max.getMonth()).toBe(10)
    expect(max.getDate()).toBe(30)

    vi.useRealTimers()
  })

  it('does not clamp when the day exists in the target month', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 0, 15)) // 15 Jan 2026

    const { max } = getAvailabilityDateRange()

    expect(max.getMonth()).toBe(6)
    expect(max.getDate()).toBe(15)

    vi.useRealTimers()
  })
})

describe('isValidAvailabilityDate', () => {
  it('rejects a date exactly one day past the clamped 6-month boundary', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 4, 31)) // 31 May 2026

    expect(isValidAvailabilityDate('30/11/2026')).toBe(true)
    expect(isValidAvailabilityDate('01/12/2026')).toBe(false)

    vi.useRealTimers()
  })
})
