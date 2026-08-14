'use client'

import { CheckCircle2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Modal from './Modal'
import type { FlightEvaluation } from './Signatures.types'

type Props = {
  flight: FlightEvaluation | null
  onClose: () => void
  onSign?: (flight: FlightEvaluation) => void
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className='font-secondary text-[11px] tracking-wide text-black-200 uppercase'>
        {label}
      </div>
      <div className='mt-0.5 font-secondary text-sm font-semibold text-black-300'>
        {value}
      </div>
    </div>
  )
}

function ScoreField({ label, value }: { label: string; value: number }) {
  return (
    <div className='flex items-center justify-between border-b border-black-100 py-1.5 last:border-b-0'>
      <span className='font-secondary text-sm text-black-200'>{label}</span>
      <span className='font-primary text-sm font-bold text-black-300'>
        {value}
      </span>
    </div>
  )
}

export default function FlightEvaluationModal({
  flight,
  onClose,
  onSign,
}: Props) {
  const t = useTranslations('FlightEvaluationModal')
  const passed = flight !== null && flight.finalScore >= 3

  return (
    <Modal
      isOpen={flight !== null}
      onClose={onClose}
      title={t('title', { id: flight?.sessionId ?? '' })}
      closeLabel={t('close')}
      maxWidthClassName='max-w-2xl'
    >
      {flight && (
        <div className='flex flex-col gap-5'>
          <div>
            <p className='font-secondary text-xs font-semibold tracking-wide text-black-200 uppercase'>
              {flight.course}
            </p>
            <h3 className='mt-1 font-primary text-lg font-bold text-black-300'>
              {flight.sessionTitle}
            </h3>
          </div>

          <div className='grid grid-cols-2 gap-4 rounded-lg border border-black-100 bg-black-100/10 p-4 sm:grid-cols-3'>
            <DetailField label={t('date')} value={flight.date} />
            <DetailField label={t('student')} value={flight.student} />
            <DetailField label={t('instructor')} value={flight.instructor} />
            <DetailField label={t('aircraft')} value={flight.aircraft} />
            <DetailField label={t('role')} value={flight.role} />
            <DetailField label={t('route')} value={flight.route} />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <p className='mb-1.5 font-secondary text-[11px] font-semibold tracking-wide text-black-200 uppercase'>
                {t('flightTime')}
              </p>
              <p className='font-secondary text-sm text-black-300'>
                {t('dual')} <b className='font-bold'>{flight.flightTimeDual}</b>
                {' · '}
                {t('solo')} <b className='font-bold'>{flight.flightTimeSolo}</b>
              </p>
            </div>
            <div>
              <p className='mb-1.5 font-secondary text-[11px] font-semibold tracking-wide text-black-200 uppercase'>
                {t('landings')}
              </p>
              <p className='font-secondary text-sm text-black-300'>
                {t('dual')} <b className='font-bold'>{flight.landingsDual}</b>
                {' · '}
                {t('solo')} <b className='font-bold'>{flight.landingsSolo}</b>
              </p>
            </div>
          </div>

          <div>
            <p className='mb-1.5 font-secondary text-[11px] font-semibold tracking-wide text-black-200 uppercase'>
              {t('maneuvers')}
            </p>
            <ul className='flex list-none flex-col gap-1 rounded-lg border border-black-100 p-3'>
              {flight.maneuvers.map((maneuver) => (
                <li
                  key={maneuver.title}
                  className='flex items-center justify-between gap-3 font-secondary text-sm text-black-300'
                >
                  <span>{maneuver.title}</span>
                  {maneuver.score && (
                    <span className='flex-none font-primary text-sm font-bold text-black-300'>
                      {maneuver.score}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className='mb-1.5 font-secondary text-[11px] font-semibold tracking-wide text-black-200 uppercase'>
              {t('observations')}
            </p>
            <p className='font-secondary text-sm whitespace-pre-line text-black-300'>
              {flight.observations}
            </p>
          </div>

          <div>
            <p className='mb-1.5 font-secondary text-[11px] font-semibold tracking-wide text-black-200 uppercase'>
              {t('evaluation')}
            </p>
            <div className='rounded-lg border border-black-100 px-3'>
              <ScoreField
                label={t('scorePreparation')}
                value={flight.scorePreparation}
              />
              <ScoreField
                label={t('scoreTechnique')}
                value={flight.scoreTechnique}
              />
              <ScoreField
                label={t('scoreInitiative')}
                value={flight.scoreInitiative}
              />
              <ScoreField
                label={t('scoreInterest')}
                value={flight.scoreInterest}
              />
              <ScoreField
                label={t('scoreAssimilation')}
                value={flight.scoreAssimilation}
              />
            </div>
          </div>

          <div
            className={`flex items-center justify-between rounded-lg px-4 py-3 ${
              passed ? 'bg-green-100' : 'bg-red-100'
            }`}
          >
            <span
              className={`font-secondary text-sm ${passed ? 'text-green-300' : 'text-red-300'}`}
            >
              {passed ? t('passNote') : t('failNote')}
            </span>
            <span
              className={`font-primary text-lg font-bold ${passed ? 'text-green-300' : 'text-red-300'}`}
            >
              {flight.finalScore}
            </span>
          </div>

          {flight.signed ? (
            <p className='flex items-center justify-center gap-2 font-secondary text-sm font-semibold text-green-300'>
              <CheckCircle2 size={16} aria-hidden='true' />
              {t('signed')}
            </p>
          ) : (
            <button
              type='button'
              onClick={() => onSign?.(flight)}
              className='cursor-pointer rounded-lg bg-blue-100 px-3 py-2.5 font-primary text-sm font-bold text-blue-300'
            >
              {t('sign')}
            </button>
          )}
        </div>
      )}
    </Modal>
  )
}
