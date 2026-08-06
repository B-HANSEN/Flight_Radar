'use client'

import { useTranslations } from 'next-intl'
import Modal from './Modal'
import type { BookingEvent } from './AgendaCalendar.types'

type Props = {
  event: BookingEvent | null
  onClose: () => void
}

export default function BookingDetailModal({ event, onClose }: Props) {
  const t = useTranslations('BookingDetailModal')
  const paragraphs = t.raw('paragraphs') as string[]

  return (
    <Modal
      isOpen={event !== null}
      onClose={onClose}
      title={t('title')}
      closeLabel={t('close')}
    >
      {event && (
        <p className='font-secondary text-xs font-semibold text-black-200'>
          {event.time} · {event.tailNumber} · {event.pilotInCommand}
        </p>
      )}
      {paragraphs.map((paragraph) => (
        <p key={paragraph} className='font-secondary text-sm text-black-300'>
          {paragraph}
        </p>
      ))}
    </Modal>
  )
}
