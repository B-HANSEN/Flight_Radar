'use client'

import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

export default function Nav() {
  const t = useTranslations('Nav')
  const pathname = usePathname()

  return (
    <nav className="border-b border-slate-200 px-4 py-3">
      <div className="mx-auto flex max-w-3xl items-center justify-between">
        <div className="flex gap-4">
          <Link href="/" className="font-semibold">
            {t('home')}
          </Link>
          <Link href="/about">{t('about')}</Link>
          <Link href="/flights">{t('flights')}</Link>
        </div>
        <div className="flex gap-2 text-sm">
          {routing.locales.map((locale) => (
            <Link
              key={locale}
              href={pathname}
              locale={locale}
              className="uppercase"
            >
              {locale}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
