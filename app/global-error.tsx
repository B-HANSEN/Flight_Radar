'use client'

import { useEffect } from 'react'
import { RotateCcw } from 'lucide-react'
import './globals.css'

// Props declared as an `interface` (not the repo's usual `type`) on purpose:
// Next's TS plugin flags any function-typed prop in a client-entry file
// unless it's a Server Action, and its error-file exception still only
// allowlists `reset`, not `unstable_retry` (v16.2). Declaring the shape as
// an interface keeps the plugin from walking the members at all.
interface GlobalErrorProps {
  error: Error & { digest?: string }
  // Re-runs the failed server render (router.refresh + reset) — the useful
  // recovery here, since this boundary catches the layout's own
  // `await fetchApi(...)` failures. A plain `reset()` would only re-render
  // the same cached error.
  unstable_retry: () => void
}

// Last-resort boundary: this replaces the root layout when even
// app/[locale]/layout.tsx throws (it fetches /students and /instructors),
// so it can't rely on NextIntlClientProvider — the copy is fixed English.
export default function GlobalError({
  error,
  unstable_retry,
}: GlobalErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang='en'>
      <body className='min-h-screen bg-white text-slate-900 antialiased'>
        <title>Something went wrong | Flight Radar</title>
        <main className='mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-4 px-4 py-8 text-center'>
          <h1 className='font-primary text-[22px] font-bold text-black-300'>
            Something knocked us off course.
          </h1>
          <p className='font-secondary max-w-95 text-md leading-[1.6] text-black-300'>
            An unexpected error interrupted the page. Give it another try — it
            often clears up on a second attempt.
          </p>
          <button
            type='button'
            onClick={() => unstable_retry()}
            className='font-primary mt-1.5 flex items-center gap-2 rounded-lg bg-blue-200 px-6 py-3.25 text-sm font-semibold text-black-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black-300'
          >
            <RotateCcw size={16} aria-hidden='true' />
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}
