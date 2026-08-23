// No Users module yet (no auth) — this cookie is just a client-set "which
// view am I previewing" preference, not a real session. It's what lets
// gated routes (e.g. /instructor) tell instructor-view from student-view.
export const CURRENT_ROLE_COOKIE = 'fr-current-role'

// Legacy/default sentinel meaning "the first instructor" — kept so any
// cookie set before multi-instructor support still resolves correctly.
export const INSTRUCTOR_ROLE_VALUE = 'instructor'
const INSTRUCTOR_ROLE_PREFIX = 'instructor:'

export function encodeInstructorRole(instructorId: string): string {
  return `${INSTRUCTOR_ROLE_PREFIX}${instructorId}`
}

export function isInstructorRoleValue(value: string | undefined): boolean {
  return (
    value === INSTRUCTOR_ROLE_VALUE ||
    (value?.startsWith(INSTRUCTOR_ROLE_PREFIX) ?? false)
  )
}

// Returns the specific instructor id encoded in the cookie, or null when
// the value is the legacy sentinel (or not an instructor value at all) —
// callers should fall back to the first/default instructor in that case.
export function instructorIdFromRoleValue(
  value: string | undefined,
): string | null {
  return value?.startsWith(INSTRUCTOR_ROLE_PREFIX)
    ? value.slice(INSTRUCTOR_ROLE_PREFIX.length)
    : null
}
