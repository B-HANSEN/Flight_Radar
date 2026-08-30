import { describe, expect, it } from 'vitest'
import {
  TRAINING_CONTENT,
  getFlightContent,
  getTheoryBlurb,
} from './trainingContent'

describe('getTheoryBlurb', () => {
  it('maps a known topic to its fuller explanation', () => {
    expect(getTheoryBlurb('Navigation theory — map reading and drift')).toMatch(
      /navigation theory/i,
    )
    expect(getTheoryBlurb('Radio procedures and RT')).toMatch(
      /R\/T phraseology/,
    )
    expect(getTheoryBlurb('Circuit pattern')).toMatch(/legs of the pattern/)
  })

  it('is case-insensitive', () => {
    expect(getTheoryBlurb('MASS AND BALANCE')).toMatch(/loading sheet/)
  })

  it('falls back to the instructor comment for an unknown topic', () => {
    expect(getTheoryBlurb('Upset recovery briefing')).toBe(
      'Upset recovery briefing',
    )
  })

  it('handles an empty comment', () => {
    expect(getTheoryBlurb()).toBe('Ground-school lesson.')
  })
})

describe('getFlightContent', () => {
  it('returns the hardcoded content for a known code', () => {
    expect(getFlightContent('VBD15')).toBe(TRAINING_CONTENT.VBD15)
  })

  it('falls back to the code + comment when the code is unknown', () => {
    expect(getFlightContent('ZZZ99', 'short field practice')).toEqual({
      shortLabel: 'ZZZ99 · short field practice',
      detail: 'short field practice',
    })
  })

  it('falls back to the comment alone when there is no code', () => {
    const result = getFlightContent(undefined, 'weather hold — rebooking')
    expect(result.shortLabel).toBe('weather hold — rebooking')
  })

  it('has a generic label when nothing is known', () => {
    expect(getFlightContent().shortLabel).toBe('Flight lesson')
  })
})
