// No Users module yet (no auth) — this cookie is just a client-set "which
// view am I previewing" preference, not a real session. It's what lets
// gated routes (e.g. /instructor) tell instructor-view from student-view.
export const CURRENT_ROLE_COOKIE = 'fr-current-role'
export const INSTRUCTOR_ROLE_VALUE = 'instructor'
