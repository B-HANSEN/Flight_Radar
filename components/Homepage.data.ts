import { DUMMY_FLIGHT_EVALUATIONS } from './Signatures.data'
import type { Booking, NewsItem, WeatherReport } from './Homepage.types'

export const DUMMY_WEATHER: WeatherReport[] = [
  {
    code: 'LEDA',
    metar: '081630Z 24017KT 210V270 9999 TS VCSH SCT050 SCT070CB 27/14 Q1017',
    taf: '081400Z 0815/0915 10006KT 9999 FEW060 TX39/0914Z TN22/0905Z TEMPO 0815/0819 VRB18G35KT 2500 TSRAGR SCT060CB',
  },
  {
    code: 'LEGE',
    metar: '081630Z 18010KT CAVOK 29/14 Q1015 NOSIG',
    taf: '081100Z 0812/0912 VRB03KT CAVOK TX38/0813Z TN22/0906Z BECMG 0812/0813 18010KT BECMG 0818/0821 VRB03KT',
  },
  {
    code: 'LELL',
    metar: '081630Z 11008KT 060V150 CAVOK 31/23 Q1015',
    taf: '081400Z 0815/0915 14008KT CAVOK TX38/0913Z TN21/0905Z TEMPO 0816/0820 20008KT BECMG 0818/0820 VRB03KT',
  },
  {
    code: 'LERS',
    metar: '081630Z 16005KT 130V230 9999 FEW025 31/23 Q1016',
    taf: '081400Z 0815/0915 16008KT 9999 FEW020 TX34/0912Z TN25/0905Z TEMPO 0816/0823 TS FEW030CB',
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
    date: '02/08/2026',
    title: 'Sabadell tower frequency change effective now',
    summary:
      'The 8.33 kHz channel spacing update is live at LELL: TWR now runs on 120.805 MHz and GND on 121.605 MHz.',
  },
  {
    id: 'news-2',
    tag: 'fuel',
    date: '28/07/2026',
    title: 'New BP supply agreement airports',
    summary:
      'AVGAS 100LL is now available under the BP / Aeroclub agreement at A Coruña, Algeciras and Alicante-Elche.',
  },
  {
    id: 'news-3',
    tag: 'atc',
    date: '19/07/2026',
    title: 'ATIS-SIMA now live at Reus',
    summary:
      'Pilots can hear updated operational and weather information for LERS on 120.250 MHz, easing radio load on approach.',
  },
]
