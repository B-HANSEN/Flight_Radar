'use client'

import { useId, useRef } from 'react'
import { X } from 'lucide-react'
import { focusRing } from '@/lib/styles'
import { useFocusTrap } from '@/lib/useFocusTrap'

type Props = {
  isOpen: boolean
  onClose: () => void
  title: string
  closeLabel: string
  children: React.ReactNode
  /** Set to false to yield Escape/Tab handling to a nested overlay (e.g. a picker) rendered inside this modal. */
  active?: boolean
  /** Tailwind max-w-* class for the dialog. Defaults to 'max-w-md'; pass a wider one for document-style content. */
  maxWidthClassName?: string
}

export default function Modal({
  isOpen,
  onClose,
  title,
  closeLabel,
  children,
  active = true,
  maxWidthClassName = 'max-w-md',
}: Props) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)

  useFocusTrap(dialogRef, isOpen, onClose, active)

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
        className={`flex max-h-[85vh] w-full ${maxWidthClassName} flex-col overflow-hidden rounded-xl bg-white shadow-xl ${focusRing}`}
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
