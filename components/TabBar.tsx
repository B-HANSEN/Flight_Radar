'use client'

import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { focusRing } from '@/lib/styles'
import { useDragScroll } from '@/lib/useDragScroll'

type TabKey =
  | 'agenda'
  | 'certificates'
  | 'courses'
  | 'signatures'
  | 'logbook'
  | 'flightDutyTimes'
  | 'solo'
  | 'availability'
  | 'emails'

type TabItem = {
  key: TabKey
  href: string
}

type Props = {
  activePath?: string
  onItemClick?: (href: string) => void
}

const items: TabItem[] = [
  { key: 'agenda', href: '/me/agenda' },
  { key: 'certificates', href: '/me/certificates' },
  { key: 'courses', href: '/me/courses' },
  { key: 'signatures', href: '/me/signatures' },
  { key: 'logbook', href: '/me/logbook' },
  { key: 'flightDutyTimes', href: '/me/flight-duty-times' },
  { key: 'solo', href: '/me/solo' },
  { key: 'availability', href: '/me/availability' },
  { key: 'emails', href: '/me/emails' },
]

export default function TabBar({ activePath, onItemClick }: Props) {
  const t = useTranslations('RecordTabBar')
  const pathname = usePathname() ?? items[0].href
  const currentPath = activePath ?? pathname
  const { isDragging, dragHandlers } = useDragScroll<HTMLUListElement>()

  return (
    <nav aria-label={t('label')} className='border-b border-black-100'>
      <ul
        tabIndex={0}
        aria-label={t('label')}
        className={`flex list-none gap-1 overflow-x-auto px-1 ${focusRing} ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
        {...dragHandlers}
      >
        {items.map(({ key, href }) => {
          const isActive = currentPath === href
          return (
            <li key={key} className='flex-none'>
              <Link
                href={href}
                onClick={() => onItemClick?.(href)}
                aria-current={isActive ? 'page' : undefined}
                className={`block rounded-t-lg px-4 py-2.5 font-primary text-sm font-semibold whitespace-nowrap ${focusRing} ${
                  isActive
                    ? 'bg-blue-100 text-blue-300'
                    : 'text-black-300 hover:bg-black-100/60'
                }`}
              >
                {t(key)}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
