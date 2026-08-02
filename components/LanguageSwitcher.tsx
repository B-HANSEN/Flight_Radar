'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

type Locale = (typeof routing.locales)[number]

const FLAGS: Record<Locale, string> = {
  en: '🇬🇧',
  de: '🇩🇪',
  es: '🇪🇸',
}

const NAMES: Record<Locale, string> = {
  en: 'English',
  de: 'Deutsch',
  es: 'Español',
}

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black-300'

export default function LanguageSwitcher() {
  const t = useTranslations('Nav')
  const locale = useLocale() as Locale
  const pathname = usePathname() ?? '/'
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div ref={containerRef} className='relative'>
      <button
        ref={triggerRef}
        type='button'
        aria-haspopup='true'
        aria-expanded={open}
        aria-label={`${t('language')}: ${NAMES[locale]}`}
        onClick={() => setOpen((value) => !value)}
        className={`flex items-center gap-1 rounded-sm px-2 py-1 ${focusRing}`}
      >
        <span aria-hidden='true' className='text-lg leading-none'>
          {FLAGS[locale]}
        </span>
        <ChevronDown size={14} className='text-black-300' aria-hidden='true' />
      </button>

      {open && (
        <ul className='absolute top-full right-0 z-10 mt-1 list-none rounded-lg bg-white py-1 shadow-lg'>
          {routing.locales.map((item) => (
            <li key={item}>
              <Link
                href={pathname}
                locale={item}
                aria-current={item === locale ? 'true' : undefined}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-black-300 hover:bg-blue-100 ${focusRing}`}
              >
                <span aria-hidden='true'>{FLAGS[item]}</span>
                <span lang={item}>{NAMES[item]}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
