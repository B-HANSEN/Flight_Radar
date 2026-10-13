'use client'

import { useRef, useState } from 'react'
import { PenLine } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { fetchApi } from '@/lib/api'
import { focusRing } from '@/lib/styles'
import DragScrollRegion from './DragScrollRegion'
import FlightEvaluationModal from './FlightEvaluationModal'
import type { FlightEvaluation } from './Signatures.types'

type Props = {
  signatures?: FlightEvaluation[]
  // Instructor view: shows an "under development" note instead of a
  // sign-off list.
  underDevelopment?: boolean
}

function SignatureList({
  signatures,
  onSelect,
}: {
  signatures: FlightEvaluation[]
  onSelect: (flight: FlightEvaluation) => void
}) {
  const t = useTranslations('Homepage')

  return (
    <DragScrollRegion
      axis='y'
      role='group'
      aria-labelledby='homepage-signatures-heading'
      className='max-h-44.25 overflow-y-auto'
    >
      <ul className='flex list-none flex-col'>
        {signatures.map((signature) => {
          const label = t('signatures.flightLabel', {
            id: signature.sessionId,
          })
          return (
            <li
              key={signature.id}
              className='flex items-center justify-between gap-4 border-b border-black-200 px-5 py-3.5 last:border-b-0 even:bg-black-100/50'
            >
              <div className='flex items-center gap-4'>
                <span className='font-secondary text-xs font-semibold text-black-200'>
                  {signature.date}
                </span>
                <span className='font-secondary text-sm text-black-300'>
                  {label}
                </span>
              </div>
              <button
                type='button'
                onClick={() => onSelect(signature)}
                aria-label={t('signatures.signLabel', { label })}
                className={`flex-none cursor-pointer rounded-sm p-1 text-black-200 ${focusRing}`}
              >
                <PenLine size={16} aria-hidden='true' />
              </button>
            </li>
          )
        })}
      </ul>
    </DragScrollRegion>
  )
}

export default function HomepageSignatures({
  signatures: initialSignatures = [],
  underDevelopment = false,
}: Props) {
  const t = useTranslations('Homepage')
  const [signatures, setSignatures] = useState(initialSignatures)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const selectedFlight =
    signatures.find((flight) => flight.id === selectedId) ?? null

  async function handleSign(flight: FlightEvaluation) {
    await fetchApi(`/flight-evaluations/${flight.id}/sign`, {
      method: 'PATCH',
      cache: 'no-store',
    })
    // The modal would restore focus to this row's Sign button, which is
    // about to be removed — land on the section heading instead.
    headingRef.current?.focus()
    setSignatures((current) => current.filter((item) => item.id !== flight.id))
    setSelectedId(null)
  }

  return (
    <section
      aria-labelledby='homepage-signatures-heading'
      className='overflow-hidden rounded-xl border border-black-200 bg-white'
    >
      <h2
        ref={headingRef}
        id='homepage-signatures-heading'
        tabIndex={-1}
        className='border-b border-black-200 px-5 py-4 font-primary text-base font-bold text-black-300'
      >
        {t('signatures.title')}
      </h2>
      {underDevelopment ? (
        // Instructors don't sign off evaluations — the report-authoring
        // flow that belongs here isn't built yet.
        <p className='px-5 py-6 text-center font-secondary text-sm text-black-200'>
          {t('signatures.underDevelopment')}
        </p>
      ) : signatures.length === 0 ? (
        <p className='px-5 py-6 text-center font-secondary text-sm text-black-200'>
          {t('signatures.empty')}
        </p>
      ) : (
        <SignatureList
          signatures={signatures}
          onSelect={(flight) => setSelectedId(flight.id)}
        />
      )}
      <FlightEvaluationModal
        flight={selectedFlight}
        onClose={() => setSelectedId(null)}
        onSign={handleSign}
      />
    </section>
  )
}
