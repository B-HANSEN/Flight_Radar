import { describe, expect, it } from 'vitest'
import {
  addDays,
  addWeeks,
  formatWeekRangeLabel,
  isoWeekNumber,
  startOfWeek,
  toISODate,
} from './weekGrid'

describe('startOfWeek', () => {
  it('returns the same date when given a Monday', () => {
    // 2026-08-24 is a Monday
    expect(toISODate(startOfWeek(new Date(2026, 7, 24)))).toBe('2026-08-24')
  })

  it('rolls back to the preceding Monday for a mid-week date', () => {
    // 2026-08-27 is a Thursday
    expect(toISODate(startOfWeek(new Date(2026, 7, 27)))).toBe('2026-08-24')
  })

  it('rolls back to the preceding Monday for a Sunday', () => {
    expect(toISODate(startOfWeek(new Date(2026, 7, 30)))).toBe('2026-08-24')
  })
})

describe('addDays / addWeeks', () => {
  it('adds calendar days', () => {
    expect(toISODate(addDays(new Date(2026, 7, 24), 6))).toBe('2026-08-30')
  })

  it('adds whole weeks', () => {
    expect(toISODate(addWeeks(new Date(2026, 7, 24), 1))).toBe('2026-08-31')
    expect(toISODate(addWeeks(new Date(2026, 7, 24), -1))).toBe('2026-08-17')
  })
})

describe('isoWeekNumber', () => {
  it('numbers a mid-year week (Monday and the rest of that week match)', () => {
    expect(isoWeekNumber(new Date(2026, 7, 24))).toBe(35) // Mon 24 Aug 2026
    expect(isoWeekNumber(new Date(2026, 7, 27))).toBe(35) // Thu, same week
    expect(isoWeekNumber(new Date(2026, 7, 30))).toBe(35) // Sun, same week
    expect(isoWeekNumber(new Date(2026, 7, 31))).toBe(36) // next Monday
  })

  it('keeps a year-end date in the trailing week of the year it belongs to', () => {
    // 2026 starts on a Thursday, so it has 53 ISO weeks; 1 Jan 2027 is a
    // Friday and still belongs to week 53 of 2026.
    expect(isoWeekNumber(new Date(2027, 0, 1))).toBe(53)
    expect(isoWeekNumber(new Date(2027, 0, 4))).toBe(1) // first Monday of 2027
  })
})

describe('formatWeekRangeLabel', () => {
  it('formats a week within a single month', () => {
    expect(formatWeekRangeLabel(new Date(2026, 7, 24), 'en')).toBe(
      '24 – 30 August 2026',
    )
  })

  it('formats a week spanning two months', () => {
    expect(formatWeekRangeLabel(new Date(2026, 7, 31), 'en')).toBe(
      '31 August – 06 September 2026',
    )
  })
})
