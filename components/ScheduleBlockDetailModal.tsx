'use client'

import { useTranslations } from 'next-intl'
import Modal from './Modal'
import type { ScheduleBlockDetail } from './ScheduleBoard.types'

type Props = {
  detail: ScheduleBlockDetail | null
  onClose: () => void
}

export default function ScheduleBlockDetailModal({ detail, onClose }: Props) {
  const t = useTranslations('ScheduleBlockDetailModal')

  return (
    <Modal
      isOpen={detail !== null}
      onClose={onClose}
      title={t('title')}
      closeLabel={t('close')}
    >
      {detail && (
        <>
          <p className='font-secondary text-xs font-semibold text-black-200'>
            {detail.timeLabel} · {detail.aircraft.arcid} ·{' '}
            {detail.aircraft.type}
          </p>
          <p className='font-secondary text-sm text-black-300'>
            {detail.block.label}
          </p>
          {(detail.block.studentName ||
            detail.block.instructorName ||
            detail.block.comments) && (
            <dl className='mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-secondary text-sm'>
              {detail.block.studentName && (
                <>
                  <dt className='font-semibold text-black-200'>
                    {t('student')}
                  </dt>
                  <dd className='text-black-300'>{detail.block.studentName}</dd>
                </>
              )}
              {detail.block.instructorName && (
                <>
                  <dt className='font-semibold text-black-200'>
                    {t('instructor')}
                  </dt>
                  <dd className='text-black-300'>
                    {detail.block.instructorName}
                  </dd>
                </>
              )}
              {detail.block.comments && (
                <>
                  <dt className='font-semibold text-black-200'>{t('notes')}</dt>
                  <dd className='text-black-300'>{detail.block.comments}</dd>
                </>
              )}
            </dl>
          )}
        </>
      )}
    </Modal>
  )
}
