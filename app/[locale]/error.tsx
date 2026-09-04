'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import ErrorCard from '@/components/ErrorCard'

// Props declared as an `interface` (not the repo's usual `type`) on purpose:
// Next's TS plugin flags any function-typed prop in a client-entry file
// unless it's a Server Action, and its error-file exception still only
// allowlists `reset`, not `unstable_retry` (v16.2). Declaring the shape as
// an interface keeps the plugin from walking the members at all.
interface LocaleErrorProps {
  error: Error & { digest?: string }
  // Re-runs the failed server render (router.refresh + reset) — the useful
  // recovery here, since these boundaries catch `await fetchApi(...)`
  // failures. A plain `reset()` would only re-render the same cached error.
  unstable_retry: () => void
}

// Catches an uncaught throw from a page or nested layout in the locale
// subtree (most page.tsx files just `await fetchApi(...)`), so a failed
// read shows this app's own styling instead of Next's bare default screen.
// A throw from app/[locale]/layout.tsx itself sits above this boundary —
// app/global-error.tsx handles that.
export default function LocaleError({
  error,
  unstable_retry,
}: LocaleErrorProps) {
  const t = useTranslations('ErrorPage')

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <ErrorCard
      title={t('title')}
      body={t('body')}
      cta={t('cta')}
      onRetry={unstable_retry}
    />
  )
}
