'use client'

import { useEffect } from 'react'
import { AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { focusRing } from '@/lib/styles'

type Props = {
  message: string
  open: boolean
  onClose: () => void
  durationMs?: number
  /** 'loading' (default) shows a spinner for an in-progress action; 'success' shows a checkmark for a completed one; 'error' shows an alert icon for a failed one. */
  variant?: 'loading' | 'success' | 'error'
}

export default function Toast({
  message,
  open,
  onClose,
  durationMs = 3000,
  variant = 'loading',
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
      {variant === 'loading' ? (
        <Loader2
          size={16}
          className='flex-none animate-spin text-blue-300'
          aria-hidden='true'
        />
      ) : variant === 'success' ? (
        <CheckCircle2
          size={16}
          className='flex-none text-green-300'
          aria-hidden='true'
        />
      ) : (
        <AlertCircle
          size={16}
          className='flex-none text-red-300'
          aria-hidden='true'
        />
      )}
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
