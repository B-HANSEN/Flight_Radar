import type { FlightEvaluation } from '@/components/Signatures.types'

export function mockFlightEvaluationSign(flights: FlightEvaluation[]) {
  const originalFetch = window.fetch

  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input.toString()
    const match = /\/flight-evaluations\/([^/]+)\/sign$/.exec(url)

    if (match && init?.method === 'PATCH') {
      const flight = flights.find((item) => item.id === match[1])
      return new Response(JSON.stringify({ ...flight, signed: true }), {
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
