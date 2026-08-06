'use client'

import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'

function formatDateTime(
  date: Date,
  locale: string,
  timeZone?: string,
  showZoneName?: boolean,
) {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone,
    timeZoneName: showZoneName ? 'short' : undefined,
  }).format(date)
}

export default function NavClock() {
  const locale = useLocale()
  const t = useTranslations('Nav')
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    function sync() {
      if (document.visibilityState === 'visible') {
        setNow(new Date())
      }
    }

    const interval = setInterval(sync, 15000)
    document.addEventListener('visibilitychange', sync)
    window.addEventListener('focus', sync)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', sync)
      window.removeEventListener('focus', sync)
    }
  }, [])

  return (
    <div className='hidden flex-none flex-col items-end gap-0.5 font-secondary text-xs leading-none text-black-300 md:flex'>
      <span suppressHydrationWarning>
        {t('localTime')}: {formatDateTime(now, locale, undefined, true)}
      </span>
      <span suppressHydrationWarning>
        {t('zuluTime')}: {formatDateTime(now, locale, 'UTC')}Z
      </span>
    </div>
  )
}
