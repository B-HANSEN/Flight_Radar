'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  AlertCircle,
  CheckCircle2,
  MoreVertical,
  PenLine,
  XCircle,
} from 'lucide-react'
import { apiErrorMessage, fetchApi } from '@/lib/api'
import { focusRing } from '@/lib/styles'
import FlightEvaluationModal from './FlightEvaluationModal'
import Toast from './Toast'
import type { FlightEvaluation } from './Signatures.types'

type Props = {
  flights?: FlightEvaluation[]
}

const rowGridClassName =
  'grid grid-cols-[110px_110px_140px_1fr_70px_70px_32px] items-center gap-2 px-5'

export default function Signatures({ flights: initialFlights = [] }: Props) {
  const t = useTranslations('Signatures')
  const [flights, setFlights] = useState(() => [...initialFlights].reverse())
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const pending = useMemo(
    () => flights.filter((flight) => !flight.signed),
    [flights],
  )
  const selectedFlight =
    flights.find((flight) => flight.id === selectedId) ?? null

  async function signFlight(flight: FlightEvaluation) {
    const signed = await fetchApi<FlightEvaluation>(
      `/flight-evaluations/${flight.id}/sign`,
      { method: 'PATCH', cache: 'no-store' },
    )
    setFlights((current) =>
      current.map((item) => (item.id === signed.id ? signed : item)),
    )
  }

  async function handleSign(flight: FlightEvaluation) {
    try {
      await signFlight(flight)
      setSelectedId(null)
    } catch (error) {
      setErrorMessage(apiErrorMessage(error, t('signError')))
    }
  }

  async function handleSignAll() {
    try {
      await Promise.all(pending.map((flight) => signFlight(flight)))
    } catch (error) {
      setErrorMessage(apiErrorMessage(error, t('signError')))
    }
  }

  return (
    <>
      <section aria-label={t('title')} className='flex flex-col gap-6'>
        {pending.length > 0 && (
          <div className='flex items-center gap-3 rounded-xl border border-yellow-200/60 bg-yellow-100/50 px-5 py-4'>
            <AlertCircle
              size={18}
              className='flex-none text-yellow-300'
              aria-hidden='true'
            />
            <span className='font-primary text-sm font-bold text-black-300'>
              {t('pendingHeading', { count: pending.length })}
            </span>
          </div>
        )}

        <button
          type='button'
          onClick={handleSignAll}
          disabled={pending.length === 0}
          className={`flex w-fit items-center gap-2 rounded-lg border border-black-100 bg-white px-4.5 py-2.5 font-primary text-sm font-semibold text-black-300 ${focusRing} disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <PenLine size={16} className='text-black-200' aria-hidden='true' />
          {t('signAll')}
        </button>

        <div>
          <div className='mb-4 flex items-center justify-between'>
            <h2 className='font-primary text-xl font-bold text-black-300'>
              {t('title')}
            </h2>
            <span className='rounded-full bg-black-100/50 px-3 py-1.5 font-primary text-xs font-semibold text-black-300'>
              {t('entries', { count: flights.length })}
            </span>
          </div>

          {flights.length === 0 ? (
            <p className='rounded-xl border border-dashed border-black-100 px-6 py-12 text-center font-secondary text-sm text-black-200'>
              {t('noFlights')}
            </p>
          ) : (
            <div className='overflow-hidden rounded-xl border border-black-200 bg-white'>
              <div
                className={`${rowGridClassName} h-11 border-b border-black-200 bg-black-100/20`}
              >
                <div className='font-primary text-[11px] font-bold tracking-wide text-black-200 uppercase'>
                  {t('flight')}
                </div>
                <div className='font-primary text-[11px] font-bold tracking-wide text-black-200 uppercase'>
                  {t('date')}
                </div>
                <div className='font-primary text-[11px] font-bold tracking-wide text-black-200 uppercase'>
                  {t('type')}
                </div>
                <div />
                <div className='text-center font-primary text-[11px] font-bold tracking-wide text-black-200 uppercase'>
                  {t('pass')}
                </div>
                <div className='text-center font-primary text-[11px] font-bold tracking-wide text-black-200 uppercase'>
                  {t('signed')}
                </div>
                <div />
              </div>

              {flights.map((flight) => {
                const passed = flight.finalScore >= 3
                const PassIcon = passed ? CheckCircle2 : XCircle
                const SignedIcon = flight.signed ? CheckCircle2 : AlertCircle
                return (
                  <div
                    key={flight.id}
                    className={`${rowGridClassName} h-14 border-b border-black-200 last:border-b-0`}
                  >
                    <span className='font-mono text-sm font-semibold text-black-300'>
                      {flight.sessionId}
                    </span>
                    <span className='font-secondary text-sm text-black-200'>
                      {flight.date}
                    </span>
                    <span className='w-fit rounded-md bg-blue-100 px-2.5 py-1 font-secondary text-xs font-semibold text-blue-300'>
                      {flight.type}
                    </span>
                    <div />
                    <div className='flex justify-center'>
                      <PassIcon
                        size={18}
                        className={passed ? 'text-green-200' : 'text-red-200'}
                        aria-hidden='true'
                      />
                    </div>
                    <div className='flex justify-center'>
                      <SignedIcon
                        size={18}
                        className={
                          flight.signed ? 'text-green-200' : 'text-yellow-200'
                        }
                        aria-hidden='true'
                      />
                    </div>
                    <div className='flex justify-center'>
                      <button
                        type='button'
                        onClick={() => setSelectedId(flight.id)}
                        aria-label={t('openLabel', { id: flight.sessionId })}
                        className={`cursor-pointer rounded-sm p-1 text-black-200 ${focusRing}`}
                      >
                        <MoreVertical size={16} aria-hidden='true' />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <FlightEvaluationModal
        flight={selectedFlight}
        onClose={() => setSelectedId(null)}
        onSign={handleSign}
      />

      <Toast
        message={errorMessage ?? ''}
        open={errorMessage !== null}
        onClose={() => setErrorMessage(null)}
        variant='error'
      />
    </>
  )
}
