'use client'

import {
  Home,
  UserCircle,
  Newspaper,
  CalendarDays,
  Plane,
  PlaneTakeoff,
  Mail,
  FileText,
  Radar,
  type LucideIcon,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

type NavItemKey =
  | 'home'
  | 'me'
  | 'news'
  | 'schedule'
  | 'flights'
  | 'aircraft'
  | 'mailing'
  | 'documents'

type NavItem = {
  key: NavItemKey
  href: string
  icon: LucideIcon
}

type Props = {
  activePath?: string
  collapsed?: boolean
  onMenuClick?: () => void
  onItemClick?: (href: string) => void
}

const items: NavItem[] = [
  { key: 'home', href: '/', icon: Home },
  { key: 'me', href: '/me', icon: UserCircle },
  { key: 'news', href: '/news', icon: Newspaper },
  { key: 'schedule', href: '/schedule', icon: CalendarDays },
  { key: 'flights', href: '/flights', icon: Plane },
  { key: 'aircraft', href: '/aircraft', icon: PlaneTakeoff },
  { key: 'mailing', href: '/mailing', icon: Mail },
  { key: 'documents', href: '/documents', icon: FileText },
]

export default function NavBar({
  activePath,
  collapsed = false,
  onMenuClick,
  onItemClick,
}: Props) {
  const t = useTranslations('Nav')
  const pathname = usePathname()
  const currentPath = activePath ?? pathname

  return (
    <nav
      aria-label={t('primary')}
      className={`flex items-center gap-7 bg-blue-200 px-5 font-primary ${collapsed ? 'h-16' : 'h-16 md:h-18'}`}
    >
      <button
        type='button'
        aria-label={t('menu')}
        onClick={onMenuClick}
        className='flex h-4.5 w-6 flex-none flex-col justify-between'
      >
        <span className='h-[2.5px] rounded-xs bg-white' />
        <span className='h-[2.5px] rounded-xs bg-white' />
        <span className='h-[2.5px] rounded-xs bg-white' />
      </button>

      <div className='flex flex-none items-center gap-2.5'>
        <div className='flex size-8.5 items-center justify-center rounded-lg bg-blue-300'>
          <Radar size={20} className='text-yellow-200' />
        </div>
        <span className='text-md font-bold tracking-[0.01em] text-white'>
          Flight Radar
        </span>
      </div>

      <div
        className={`flex-1 items-center gap-1 ${collapsed ? 'hidden' : 'hidden md:flex'}`}
      >
        {items.map(({ key, href, icon: Icon }) => {
          const isActive = currentPath === href
          return (
            <Link
              key={key}
              href={href}
              onClick={() => onItemClick?.(href)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex min-w-19 flex-col items-center justify-center gap-0.75 rounded-lg px-4 py-2 ${
                isActive ? 'bg-blue-300' : 'hover:bg-white/14'
              }`}
            >
              <Icon
                size={20}
                className={isActive ? 'text-yellow-200' : 'text-white'}
              />
              <span className='text-xs font-semibold tracking-[0.01em] text-white'>
                {t(key)}
              </span>
            </Link>
          )
        })}
      </div>

      <div className='ml-auto flex flex-none items-center gap-2 text-xs font-semibold text-white'>
        {routing.locales.map((locale) => (
          <Link
            key={locale}
            href={pathname ?? '/'}
            locale={locale}
            className='uppercase hover:underline'
          >
            {locale}
          </Link>
        ))}
      </div>
    </nav>
  )
}
