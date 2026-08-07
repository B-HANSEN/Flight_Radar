'use client'

import { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'
import { focusRing } from '@/lib/styles'

type Props = {
  isOpen: boolean
  onClose: () => void
  title: string
  closeLabel: string
  children: React.ReactNode
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function Modal({
  isOpen,
  onClose,
  title,
  closeLabel,
  children,
}: Props) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const previouslyFocused = document.activeElement as HTMLElement | null
    dialogRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key !== 'Tab' || !dialogRef.current) return

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      )
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus()
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black-300/50 p-4'
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role='dialog'
        aria-modal='true'
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className={`flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-xl bg-white shadow-xl ${focusRing}`}
      >
        <div className='flex items-start justify-between gap-4 border-b border-black-100 px-6 py-4.5'>
          <h2
            id={titleId}
            className='font-primary text-lg font-bold text-black-300'
          >
            {title}
          </h2>
          <button
            type='button'
            onClick={onClose}
            aria-label={closeLabel}
            className={`flex-none rounded-sm p-1 text-black-200 ${focusRing}`}
          >
            <X size={20} aria-hidden='true' />
          </button>
        </div>
        <div
          tabIndex={0}
          className={`flex flex-col gap-3 overflow-y-auto px-6 py-5 ${focusRing}`}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
