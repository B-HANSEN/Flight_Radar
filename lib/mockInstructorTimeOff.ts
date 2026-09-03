import type { InstructorTimeOffEntry } from '@/components/InstructorAvailability.types'

// Storybook-only fetch stub for the InstructorAvailability stories, so the
// request / approve / deny / cancel actions resolve locally instead of
// hitting the API (which also rejects Storybook's origin via CORS). Mirrors
// the server rule: a regular day off is granted on request; personal leave
// is pending unless the requester is the Chief Flight Instructor.
export function mockInstructorTimeOff({ isChief = false } = {}) {
  const originalFetch = window.fetch
  let nextId = 0

  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input.toString()

    if (url.includes('/instructor-time-off')) {
      if (init?.method === 'POST') {
        const body = JSON.parse(init.body as string) as {
          instructorId: string
          date: string
          type: InstructorTimeOffEntry['type']
          reason?: string
        }
        const created: InstructorTimeOffEntry = {
          id: `story-ito-${(nextId += 1)}`,
          instructorId: body.instructorId,
          date: body.date,
          type: body.type,
          status: body.type === 'personal' && !isChief ? 'pending' : 'approved',
          ...(body.reason ? { reason: body.reason } : {}),
        }
        return new Response(JSON.stringify(created), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      // PATCH (approve/deny) and DELETE (cancel) — fetchApi() always calls
      // res.json(), which throws on an empty body, so this must be valid JSON.
      return new Response('{}', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return originalFetch(input, init)
  }

  return () => {
    window.fetch = originalFetch
  }
}
