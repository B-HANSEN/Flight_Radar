import { DUMMY_FLIGHT_EVALUATIONS } from './Signatures.data'
import type { Booking, NewsItem, WeatherReport } from './Homepage.types'

export const DUMMY_WEATHER: WeatherReport[] = [
  {
    code: 'LEDA',
    metar: '081630Z 24017KT 210V270 9999 TS VCSH SCT050 SCT070CB 27/14 Q1017',
    taf: '081400Z 0815/0915 10006KT 9999 FEW060 TX39/0914Z TN22/0905Z TEMPO 0815/0819 VRB18G35KT 2500 TSRAGR SCT060CB',
    observedAt: '2026-08-08T16:30:00.000Z',
  },
  {
    code: 'LEGE',
    metar: '081630Z 18010KT CAVOK 29/14 Q1015 NOSIG',
    taf: '081100Z 0812/0912 VRB03KT CAVOK TX38/0813Z TN22/0906Z BECMG 0812/0813 18010KT BECMG 0818/0821 VRB03KT',
    observedAt: '2026-08-08T16:30:00.000Z',
  },
  {
    code: 'LELL',
    metar: '081630Z 11008KT 060V150 CAVOK 31/23 Q1015',
    taf: '081400Z 0815/0915 14008KT CAVOK TX38/0913Z TN21/0905Z TEMPO 0816/0820 20008KT BECMG 0818/0820 VRB03KT',
    observedAt: '2026-08-08T16:30:00.000Z',
  },
  {
    code: 'LERS',
    metar: '081630Z 16005KT 130V230 9999 FEW025 31/23 Q1016',
    taf: '081400Z 0815/0915 16008KT 9999 FEW020 TX34/0912Z TN25/0905Z TEMPO 0816/0823 TS FEW030CB',
    observedAt: '2026-08-08T16:30:00.000Z',
  },
]

export const DUMMY_BOOKINGS: Booking[] = [
  {
    id: 'booking-1',
    type: 'Instruction',
    date: '15/08/2026',
    tail: 'EC-ERV',
    person: 'J. Whitfield',
    time: '10:00 - 11:30',
  },
  {
    id: 'booking-2',
    type: 'Instruction',
    date: '16/08/2026',
    tail: 'EC-ERV',
    person: 'K. Ashford',
    time: '15:00 - 17:00',
  },
  {
    id: 'booking-3',
    type: 'Instruction',
    date: '17/08/2026',
    tail: 'EC-ERV',
    person: 'J. Whitfield',
    time: '09:00 - 10:30',
  },
  {
    id: 'booking-4',
    type: 'Instruction',
    date: '18/08/2026',
    tail: 'EC-ERV',
    person: 'J. Whitfield',
    time: '13:00 - 14:30',
  },
]

export const DUMMY_SIGNATURES = DUMMY_FLIGHT_EVALUATIONS.filter(
  (flight) => !flight.signed,
)

export const DUMMY_NEWS: NewsItem[] = [
  {
    id: 'news-1',
    tag: 'operations',
    date: '06/08/2026',
    title: 'New self-briefing kiosk open in the ops room',
    summary:
      'A touchscreen briefing kiosk with live METAR/TAF, NOTAMs and the aircraft schedule is now available next to the flight-planning desk.',
    body: [
      "The kiosk pulls live weather and NOTAM data directly from AEMET and AIS España, so there's no need to share the one laptop during busy briefing slots.",
      'It also mirrors the aircraft schedule board, so you can check availability for EC-ERV, EC-EXL and EC-FED without leaving the desk.',
      'Instructors will keep using the paper mass-and-balance forms for now; the kiosk is for planning and weather only. Let the ops desk know if you spot any data mismatches.',
    ],
  },
  {
    id: 'news-2',
    tag: 'operations',
    date: '02/08/2026',
    title: 'Sabadell tower frequency change effective now',
    summary:
      'The 8.33 kHz channel spacing update is live at LELL: TWR now runs on 120.805 MHz and GND on 121.605 MHz.',
    body: [
      'As part of the wider 8.33 kHz channel-spacing rollout across Spanish controlled aerodromes, Sabadell TWR and GND have moved to their new frequencies with immediate effect.',
      'Update your kneeboard cards and any saved presets in your handheld radios before your next flight — the old 118.xxx/121.xxx pairing is no longer monitored.',
      "If you're flying with an older 25 kHz-only radio, speak to maintenance before your next booking; it will not be able to select the new channel.",
    ],
  },
  {
    id: 'news-3',
    tag: 'fuel',
    date: '28/07/2026',
    title: 'New BP supply agreement airports',
    summary:
      'AVGAS 100LL is now available under the BP / Aeroclub agreement at A Coruña, Algeciras and Alicante-Elche.',
    body: [
      "The academy's fuel agreement with BP / Aeroclub now extends to A Coruña (LECO), Algeciras (LEAG) and Alicante-Elche (LEAL), on top of the existing network.",
      'Use your Aeroclub fuel card as normal; the discounted in-agreement rate applies automatically at the pump, no separate authorisation needed.',
      "Keep the receipt from any of these stops — cross-country students should log it with their expense claim for reimbursement of the card's fixed monthly fee.",
    ],
  },
  {
    id: 'news-4',
    tag: 'atc',
    date: '19/07/2026',
    title: 'ATIS-SIMA now live at Reus',
    summary:
      'Pilots can hear updated operational and weather information for LERS on 120.250 MHz, easing radio load on approach.',
    body: [
      'Reus (LERS) has switched on its automated ATIS-SIMA broadcast, giving pilots current runway-in-use, wind, QNH and other operational information on 120.250 MHz before first contact.',
      'Listen out for the information letter and include it in your initial call to Reus Approach or Tower — this is now expected rather than optional.',
      'The change is aimed at reducing frequency congestion during busy weekend traffic; expect fewer routine weather read-outs from controllers as a result.',
    ],
  },
  {
    id: 'news-5',
    tag: 'fuel',
    date: '12/07/2026',
    title: 'Jet A-1 self-service pump now open weekends',
    summary:
      'The Jet A-1 self-service pump at the north apron is now available Saturdays and Sundays, matching weekday hours.',
    body: [
      'Previously restricted to weekdays 08:00–18:00, the Jet A-1 self-service pump on the north apron now operates the same hours on weekends, following demand from weekend cross-country students.',
      'Card payment only — the fuel desk is unstaffed outside weekday hours, so bring your Aeroclub card or a supported credit card.',
      "As always, complete the bonding and static-discharge check before connecting the nozzle, and log the uplift in the aircraft's fuel log before departure.",
    ],
  },
  {
    id: 'news-6',
    tag: 'atc',
    date: '05/07/2026',
    title: 'New VFR reporting points published for LELL',
    summary:
      'Two new VFR reporting points, NOVEMBER and OSCAR, have been added to the Sabadell VFR arrival chart to spread traffic on busy days.',
    body: [
      'AESA has approved two additional VFR reporting points for Sabadell (LELL): NOVEMBER, over the reservoir 4 NM to the north-west, and OSCAR, over the motorway junction 3 NM to the south-east.',
      "The updated VFR arrival chart is available from the ops desk and will be uploaded to the documents section shortly; make sure you're briefing from the new version before your next arrival.",
      'Expect tower to route inbound traffic via these points more frequently during peak circuit hours, especially at weekends.',
    ],
  },
]
