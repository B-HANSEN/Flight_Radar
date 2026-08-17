'use client'

import {
  Home,
  UserCircle,
  Newspaper,
  CalendarDays,
  PlaneTakeoff,
  FileText,
  type LucideIcon,
} from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { focusRing } from '@/lib/styles'
import LanguageSwitcher from './LanguageSwitcher'
import NavClock from './NavClock'

type NavItemKey = 'home' | 'me' | 'news' | 'schedule' | 'aircraft' | 'documents'

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
  { key: 'aircraft', href: '/aircraft', icon: PlaneTakeoff },
  { key: 'documents', href: '/documents', icon: FileText },
]

export default function NavBar({
  activePath,
  collapsed = false,
  onMenuClick,
  onItemClick,
}: Props) {
  const t = useTranslations('Nav')
  const pathname = usePathname() ?? '/'
  const currentPath = activePath ?? pathname

  return (
    <nav
      aria-label={t('primary')}
      className={`sticky top-0 z-30 flex items-center gap-7 bg-blue-200 px-5 font-primary ${collapsed ? 'h-16' : 'h-16 md:h-18'}`}
    >
      <button
        type='button'
        aria-label={t('menu')}
        onClick={onMenuClick}
        className={`flex size-6 flex-none items-center justify-center ${focusRing}`}
      >
        <span className='flex h-4.5 w-6 flex-col justify-between'>
          <span className='h-[2.5px] rounded-xs bg-black-300' />
          <span className='h-[2.5px] rounded-xs bg-black-300' />
          <span className='h-[2.5px] rounded-xs bg-black-300' />
        </span>
      </button>

      <div className='flex flex-none items-center gap-2.5'>
        <div className='relative size-10.5 flex-none overflow-hidden rounded-lg'>
          <Image src='/logo.webp' alt='' fill sizes='42px' priority />
        </div>
        <span className='text-md font-bold tracking-[0.01em] text-black-300'>
          Flight Radar
        </span>
      </div>

      <ul
        className={`list-none flex-1 items-center gap-1 ${collapsed ? 'hidden' : 'hidden md:flex'}`}
      >
        {items.map(({ key, href, icon: Icon }) => {
          const isActive =
            currentPath === href ||
            (href !== '/' && currentPath.startsWith(`${href}/`))
          return (
            <li key={key}>
              <Link
                href={href}
                onClick={() => onItemClick?.(href)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex min-w-19 flex-col items-center justify-center gap-0.75 rounded-lg px-4 py-2 ${
                  isActive
                    ? `bg-blue-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`
                    : `hover:bg-white/14 ${focusRing}`
                }`}
              >
                <Icon
                  size={20}
                  className={isActive ? 'text-yellow-200' : 'text-black-300'}
                  aria-hidden='true'
                />
                <span
                  className={`text-xs font-semibold tracking-[0.01em] ${isActive ? 'text-white' : 'text-black-300'}`}
                >
                  {t(key)}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>

      <div className='ml-auto flex flex-none items-center gap-4'>
        <NavClock />
        <LanguageSwitcher />
      </div>
    </nav>
  )
}
