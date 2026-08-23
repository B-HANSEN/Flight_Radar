import type { EmergencyContact } from '@/components/ProfileCard'

export function mockEmergencyContact(initial: EmergencyContact) {
  const originalFetch = window.fetch
  let current = initial

  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input.toString()

    if (url.includes('/emergency-contact')) {
      if (init?.method === 'PUT') {
        current = JSON.parse(init.body as string) as EmergencyContact
      } else if (init?.method === 'DELETE') {
        current = { name: '', relation: '', phone: '' }
      }
      return new Response(JSON.stringify(current), {
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
