import { describe, expect, it } from 'vitest'
import {
  INSTRUCTOR_ROLE_VALUE,
  encodeInstructorRole,
  instructorIdFromRoleValue,
  isInstructorRoleValue,
} from './currentRole'

describe('isInstructorRoleValue', () => {
  it('treats the legacy sentinel as an instructor value', () => {
    expect(isInstructorRoleValue(INSTRUCTOR_ROLE_VALUE)).toBe(true)
  })

  it('treats an encoded specific-instructor value as an instructor value', () => {
    expect(isInstructorRoleValue(encodeInstructorRole('abc123'))).toBe(true)
  })

  it('treats a student id as not an instructor value', () => {
    expect(isInstructorRoleValue('student-1')).toBe(false)
  })

  it('treats an undefined cookie as not an instructor value', () => {
    expect(isInstructorRoleValue(undefined)).toBe(false)
  })
})

describe('instructorIdFromRoleValue', () => {
  it('extracts the id from an encoded value', () => {
    expect(instructorIdFromRoleValue(encodeInstructorRole('abc123'))).toBe(
      'abc123',
    )
  })

  it('returns null for the legacy sentinel', () => {
    expect(instructorIdFromRoleValue(INSTRUCTOR_ROLE_VALUE)).toBeNull()
  })

  it('returns null for a student id', () => {
    expect(instructorIdFromRoleValue('student-1')).toBeNull()
  })
})
