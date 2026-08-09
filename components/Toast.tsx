'use client'

import { useEffect } from 'react'
import { Loader2, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { focusRing } from '@/lib/styles'

type Props = {
  message: string
  open: boolean
  onClose: () => void
  durationMs?: number
}

export default function Toast({
  message,
  open,
  onClose,
  durationMs = 3000,
}: Props) {
  const t = useTranslations('Toast')

  useEffect(() => {
    if (!open) return
    const timer = setTimeout(onClose, durationMs)
    return () => clearTimeout(timer)
  }, [open, durationMs, onClose])

  if (!open) return null

  return (
    <div
      role='status'
      aria-live='polite'
      className='fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2.5 rounded-lg border border-black-100 bg-white px-4 py-3 shadow-xl'
    >
      <Loader2
        size={16}
        className='flex-none animate-spin text-blue-300'
        aria-hidden='true'
      />
      <span className='font-secondary text-sm font-semibold text-black-300'>
        {message}
      </span>
      <button
        type='button'
        onClick={onClose}
        aria-label={t('dismiss')}
        className={`ml-1 flex-none rounded-sm p-0.5 text-black-200 ${focusRing}`}
      >
        <X size={14} aria-hidden='true' />
      </button>
    </div>
  )
}
