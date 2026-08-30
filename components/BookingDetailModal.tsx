'use client'

import { useTranslations } from 'next-intl'
import Modal from './Modal'
import {
  isTheory,
  type AgendaPerspective,
  type BookingEvent,
} from './AgendaCalendar.types'
import { getFlightContent, getTheoryBlurb } from '@/lib/trainingContent'

type Props = {
  event: BookingEvent | null
  onClose: () => void
  perspective?: AgendaPerspective
}

export default function BookingDetailModal({
  event,
  onClose,
  perspective = 'student',
}: Props) {
  const t = useTranslations('BookingDetailModal')

  const person =
    event &&
    (perspective === 'instructor' ? event.studentName : event.instructorName)

  const summaryParts = event
    ? [event.time, event.tailNumber, person, event.lessonType].filter(Boolean)
    : []

  const theory = event && isTheory(event)
  const flightContent =
    event && !theory
      ? getFlightContent(event.trainingCode, event.comments)
      : null
  const detailLines =
    flightContent && Array.isArray(flightContent.detail)
      ? flightContent.detail
      : null

  let title = t('title')
  if (event && !theory && flightContent) {
    title = flightContent.shortLabel
  }

  return (
    <Modal
      isOpen={event !== null}
      onClose={onClose}
      title={title}
      closeLabel={t('close')}
    >
      {event && (
        <>
          <p className='font-secondary text-xs font-semibold text-black-200'>
            {summaryParts.join(' · ')}
          </p>

          {event.cancelled && (
            <p className='font-secondary text-xs font-bold tracking-wide text-red-300 uppercase'>
              {t('cancelled')}
            </p>
          )}

          {theory ? (
            <p className='font-secondary text-sm text-black-300'>
              {getTheoryBlurb(event.comments)}
            </p>
          ) : (
            <>
              {event.comments && (
                <p className='font-secondary text-sm text-black-300'>
                  {event.comments}
                </p>
              )}
              {detailLines ? (
                <ul className='list-disc space-y-1 pl-5 font-secondary text-sm text-black-300'>
                  {detailLines.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              ) : (
                flightContent && (
                  <p className='font-secondary text-sm text-black-300'>
                    {flightContent.detail as string}
                  </p>
                )
              )}
            </>
          )}
        </>
      )}
    </Modal>
  )
}
