// Hardcoded syllabus reference content for the agenda. Like tail numbers and
// airfield codes this is domain data, not UI copy, so it is intentionally not
// in the next-intl message bundles — it renders the same in every locale.
//
// A flight lesson carries a `trainingCode` (e.g. VBD15) that resolves to a
// title + briefing checklist. A Theory lesson carries none: the agenda card
// shows the instructor's free-text comment as-is, and the detail modal shows
// a fuller blurb matched from that comment (getTheoryBlurb).

export type TrainingDetail = string | string[]

type FlightContent = {
  // Short title for the agenda day card (kept terse; the card truncates it).
  shortLabel: string
  // Briefing rundown for the detail modal — a string renders as a paragraph,
  // a string[] renders as a list.
  detail: TrainingDetail
}

export const TRAINING_CONTENT: Record<string, FlightContent> = {
  VTD01: {
    shortLabel: 'VTD01 · Precautionary landing & map reading',
    detail: [
      'Review local-area chart, features and danger zones.',
      'Field selection: the five S’s (size, shape, surface, surround, slope).',
      'Low-level inspection circuit and go-around.',
      'Simulated precautionary approach to a chosen field.',
    ],
  },
  VTD03: {
    shortLabel: 'VTD03 · Dual instruction sortie',
    detail: [
      'Departure and area brief.',
      'Consolidate the exercises from the previous lesson.',
      'Introduce the next syllabus item and demonstrate.',
      'Student practice with a debrief on the ground.',
    ],
  },
  VTD04: {
    shortLabel: 'VTD04 · Navigation & diversion practice',
    detail: [
      'Pre-flight route planning and fuel check.',
      'Track-keeping and revised ETAs en route.',
      'In-flight diversion to a nominated alternate.',
      'Lost procedure and rejoin.',
    ],
  },
  VBD03: {
    shortLabel: 'VBD03 · Circuit consolidation',
    detail: [
      'Normal circuit: speeds, checks and radio calls.',
      'Flapless and glide approaches.',
      'Go-around from the flare.',
    ],
  },
  VBD10: {
    shortLabel: 'VBD10 · Circuit training',
    detail:
      'Standard circuit detail: climb, level, base, final and landing, with an emphasis on a stable approach.',
  },
  VBD11: {
    shortLabel: 'VBD11 · Circuit training',
    detail:
      'Circuit consolidation with crosswind technique and flapless approaches.',
  },
  VBD12: {
    shortLabel: 'VBD12 · Circuit emergencies',
    detail: [
      'Engine failure after take-off.',
      'Glide approach to land.',
      'Go-around and balked landing.',
    ],
  },
  VBD13: {
    shortLabel: 'VBD13 · Circuit consolidation',
    detail:
      'Circuit polish ahead of the pre-solo check — accuracy, judgement and self-correction.',
  },
  VBD15: {
    shortLabel: 'VBD15 · Final check before first solo',
    detail: [
      'EXERCISE 13) Approach and landing circuit:',
      '(A) To learn the airfield arrival procedures.',
      '(B) To learn a normal powered approach and landing.',
      '(C) To learn the approach and landing technique in the event of a complete or partial engine failure.',
      '(D) To learn the take-off and landing technique for conditions of crosswind.',
      '(E) To learn the approach & landing technique for a steep (obstacle) approach.',
      '(F) To practise advanced circuit manoeuvres (circling).',
    ],
  },
  VBD16: {
    shortLabel: 'VBD16 · Pre-solo review',
    detail: [
      'Pre-solo written test review.',
      'Emergency briefings: EFATO, radio failure, go-around.',
      'Solo circuit briefing and weather limits.',
    ],
  },
  VBD18: {
    shortLabel: 'VBD18 · Solo consolidation circuits',
    detail:
      'Supervised solo circuits to build consistency — instructor monitors from the ground.',
  },
  VBD19: {
    shortLabel: 'VBD19 · Instrument appreciation',
    detail: [
      'Full and partial-panel attitude flying.',
      'Rate-1 turns, climbs and descents on instruments.',
      'Unusual attitude recoveries.',
    ],
  },
  SOLO01: {
    shortLabel: 'SOLO01 · First solo (supervised circuits)',
    detail: [
      'Dual check circuits to confirm readiness.',
      'Instructor steps out; one solo circuit to a full stop.',
      'Debrief and log the first solo.',
    ],
  },
  NAV06: {
    shortLabel: 'NAV06 · Navigation exercise, diversion planning',
    detail: [
      'Plan the route: headings, ETAs, fuel and weather.',
      'Departure, setting heading and establishing on track.',
      'Map reading and revised ETAs at each turning point.',
      'Instructor-nominated diversion and rejoin.',
    ],
  },
  NAV08: {
    shortLabel: 'NAV08 · Cross-country qualifier briefing',
    detail: [
      'Route study: LELL–LEVD–LERS–LELL.',
      'Full-route fuel plan and alternates.',
      'Airfield procedures at each landing point.',
    ],
  },
  NIT02: {
    shortLabel: 'NIT02 · Night navigation exercise',
    detail: [
      'Night pre-flight and lighting checks.',
      'Departure and en-route navigation using lit features.',
      'Circuit and landing at night.',
    ],
  },
}

// First match wins. `match` is tested case-insensitively against the Theory
// lesson's comment; the blurb is the fuller explanation shown in the detail
// modal. The agenda day card just shows the comment text itself.
const THEORY_BLURBS: { match: RegExp; blurb: string }[] = [
  {
    match: /cross[- ]?country|\bxc\b|qualifier/,
    blurb:
      'Cross-country theory: route planning, fuel and weather minima, airspace, and airfield procedures at each landing point.',
  },
  {
    match: /nav(igation)?|chart|map reading|diversion|drift/,
    blurb:
      "Let's go through the navigation theory: map reading, visual reference points, drift calculation, ETAs and the diversion technique.",
  },
  {
    match: /radio|r\/?t|comm(unication|s)?|phraseology/,
    blurb:
      'Radio theory: standard R/T phraseology, frequency changes, position reporting, and read-back discipline.',
  },
  {
    match: /circuit|traffic pattern|go[- ]?around/,
    blurb:
      'Circuit theory: the legs of the pattern, speeds and configuration changes, spacing, and the go-around decision.',
  },
  {
    match: /weather|met(eorology)?|tafs?|metars?/,
    blurb:
      'Meteorology theory: reading METARs and TAFs, cloud and visibility limits, wind, and go/no-go decision making.',
  },
  {
    match: /mass|balance|weight|w&b|loading/,
    blurb:
      'Mass & balance theory: working the loading sheet, the CG envelope, and the effect of an out-of-limits load.',
  },
  {
    match: /emerg(ency)?|efato|pfl|forced landing|failure/,
    blurb:
      'Emergencies theory: engine failure after take-off, the practice forced landing, fire drills, and radio-failure procedure.',
  },
  {
    match: /stall|spin|slow flight/,
    blurb:
      'Stalling theory: recognition, the incipient and full stall, recovery with minimum height loss, and the approach-configuration stall.',
  },
  {
    match: /air ?law|regulation|rules of the air/,
    blurb:
      'Air law theory: rules of the air, airspace classes, light signals, and documentation requirements.',
  },
]

// The explanatory paragraph for a Theory lesson's detail modal — a known
// topic gets a fuller blurb, otherwise the instructor's own comment stands.
export function getTheoryBlurb(comments?: string): string {
  const text = comments?.trim() ?? ''
  const matched = THEORY_BLURBS.find((entry) =>
    entry.match.test(text.toLowerCase()),
  )
  return matched?.blurb || text || 'Ground-school lesson.'
}

// Resolves a flight lesson's `trainingCode` (and/or the instructor's comment)
// to a short label + briefing rundown, with a graceful fallback for an
// unknown code.
export function getFlightContent(
  code?: string,
  comments?: string,
): FlightContent {
  if (code && TRAINING_CONTENT[code]) return TRAINING_CONTENT[code]

  const note = comments?.trim()
  if (code) {
    return {
      shortLabel: note ? `${code} · ${note}` : code,
      detail: note || 'Briefing details to be confirmed with your instructor.',
    }
  }
  return {
    shortLabel: note || 'Flight lesson',
    detail: note || 'Briefing details to be confirmed with your instructor.',
  }
}
