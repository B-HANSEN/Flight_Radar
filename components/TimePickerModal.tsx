'use client'

import { useId, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { focusRing } from '@/lib/styles'
import { useFocusTrap } from '@/lib/useFocusTrap'

type Props = {
  isOpen: boolean
  initialTime: string
  onCancel: () => void
  onConfirm: (time: string) => void
}

type Step = 'hour' | 'minute'

const DIAL_SIZE = 260
const CENTER = DIAL_SIZE / 2
const OUTER_RADIUS = 96
const INNER_RADIUS = 58
const NUMBER_SIZE = 28

function polarPosition(index: number, radius: number) {
  const angle = ((index * 30 - 90) * Math.PI) / 180
  return {
    x: CENTER + radius * Math.cos(angle),
    y: CENTER + radius * Math.sin(angle),
  }
}

const hourPositions = Array.from({ length: 12 }, (_, i) => ({
  outer: { value: i === 0 ? 12 : i, ...polarPosition(i, OUTER_RADIUS) },
  inner: { value: i === 0 ? 0 : i + 12, ...polarPosition(i, INNER_RADIUS) },
}))

const minutePositions = Array.from({ length: 12 }, (_, i) => ({
  value: i * 5,
  ...polarPosition(i, OUTER_RADIUS),
}))

function dialNumberStyle(x: number, y: number) {
  return {
    left: x - NUMBER_SIZE / 2,
    top: y - NUMBER_SIZE / 2,
    width: NUMBER_SIZE,
    height: NUMBER_SIZE,
  }
}

export default function TimePickerModal({
  isOpen,
  initialTime,
  onCancel,
  onConfirm,
}: Props) {
  const t = useTranslations('TimePickerModal')
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState<Step>('hour')
  const [hour, setHour] = useState(() => Number(initialTime.split(':')[0]))
  const [minute, setMinute] = useState(() => Number(initialTime.split(':')[1]))

  useFocusTrap(dialogRef, isOpen, onCancel)

  if (!isOpen) return null

  function pickHour(value: number) {
    setHour(value)
    setStep('minute')
  }

  function handleConfirm() {
    const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
    onConfirm(time)
  }

  const selected =
    step === 'hour'
      ? (() => {
          const radius = hour >= 13 || hour === 0 ? INNER_RADIUS : OUTER_RADIUS
          const { x, y } = polarPosition(hour % 12, radius)
          return { x, y, label: String(hour) }
        })()
      : (() => {
          const nearest = Math.round(minute / 5) * 5
          const angle = ((nearest * 6 - 90) * Math.PI) / 180
          return {
            x: CENTER + OUTER_RADIUS * Math.cos(angle),
            y: CENTER + OUTER_RADIUS * Math.sin(angle),
            label: String(nearest).padStart(2, '0'),
          }
        })()

  const handLength = Math.hypot(selected.x - CENTER, selected.y - CENTER)
  const handAngle = Math.atan2(selected.y - CENTER, selected.x - CENTER)

  return (
    <div
      className='fixed inset-0 z-60 flex items-center justify-center bg-black-300/50 p-4'
      onClick={onCancel}
    >
      <div
        ref={dialogRef}
        role='dialog'
        aria-modal='true'
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className={`w-80 max-w-full overflow-hidden rounded-xl bg-white shadow-xl ${focusRing}`}
      >
        <h2 id={titleId} className='sr-only'>
          {t('title')}
        </h2>

        <div className='flex items-baseline justify-center gap-1.5 bg-blue-300 px-6 py-7'>
          <button
            type='button'
            onClick={() => setStep('hour')}
            className={`rounded-sm font-secondary text-5xl ${step === 'hour' ? 'text-white' : 'text-white/65'} ${focusRing}`}
          >
            {String(hour).padStart(2, '0')}
          </button>
          <span className='font-secondary text-5xl text-white'>:</span>
          <button
            type='button'
            onClick={() => setStep('minute')}
            className={`rounded-sm font-secondary text-5xl ${step === 'minute' ? 'text-white' : 'text-white/65'} ${focusRing}`}
          >
            {String(minute).padStart(2, '0')}
          </button>
        </div>

        <div className='flex justify-center py-7 pb-4'>
          <div
            role='group'
            aria-label={
              step === 'hour' ? t('hourGroupLabel') : t('minuteGroupLabel')
            }
            className='relative rounded-full bg-black-100/60'
            style={{ width: DIAL_SIZE, height: DIAL_SIZE }}
          >
            {step === 'hour'
              ? hourPositions.map(({ outer, inner }) => (
                  <div key={`hour-${outer.value}-${inner.value}`}>
                    <button
                      type='button'
                      onClick={() => pickHour(outer.value)}
                      aria-pressed={hour === outer.value}
                      aria-label={t('hourLabel', { hour: outer.value })}
                      style={dialNumberStyle(outer.x, outer.y)}
                      className={`absolute flex items-center justify-center rounded-full font-secondary text-base text-black-300 ${focusRing}`}
                    >
                      <span
                        className={
                          hour === outer.value ? 'invisible' : undefined
                        }
                      >
                        {outer.value}
                      </span>
                    </button>
                    <button
                      type='button'
                      onClick={() => pickHour(inner.value)}
                      aria-pressed={hour === inner.value}
                      aria-label={t('hourLabel', { hour: inner.value })}
                      style={dialNumberStyle(inner.x, inner.y)}
                      className={`absolute flex items-center justify-center rounded-full font-secondary text-sm text-black-300 ${focusRing}`}
                    >
                      <span
                        className={
                          hour === inner.value ? 'invisible' : undefined
                        }
                      >
                        {String(inner.value).padStart(2, '0')}
                      </span>
                    </button>
                  </div>
                ))
              : minutePositions.map((position) => (
                  <button
                    key={position.value}
                    type='button'
                    onClick={() => setMinute(position.value)}
                    aria-pressed={minute === position.value}
                    aria-label={t('minuteLabel', { minute: position.value })}
                    style={dialNumberStyle(position.x, position.y)}
                    className={`absolute flex items-center justify-center rounded-full font-secondary text-base text-black-300 ${focusRing}`}
                  >
                    <span
                      className={
                        minute === position.value ? 'invisible' : undefined
                      }
                    >
                      {String(position.value).padStart(2, '0')}
                    </span>
                  </button>
                ))}
            <div
              aria-hidden='true'
              className='absolute bg-blue-300'
              style={{
                left: CENTER,
                top: CENTER,
                width: handLength,
                height: 2,
                transformOrigin: '0 0',
                transform: `rotate(${handAngle}rad)`,
              }}
            />
            <div
              aria-hidden='true'
              className='absolute size-1.5 rounded-full bg-blue-300'
              style={{ left: CENTER - 3, top: CENTER - 3 }}
            />
            <div
              aria-hidden='true'
              className='absolute flex size-9 items-center justify-center rounded-full bg-blue-300 font-secondary text-sm font-semibold text-white'
              style={{ left: selected.x - 18, top: selected.y - 18 }}
            >
              {selected.label}
            </div>
          </div>
        </div>

        <div className='flex justify-center gap-7 py-3 pb-5.5'>
          <button
            type='button'
            onClick={onCancel}
            className={`cursor-pointer rounded-sm font-primary text-sm font-bold tracking-wide text-blue-300 ${focusRing}`}
          >
            {t('cancel')}
          </button>
          <button
            type='button'
            onClick={handleConfirm}
            className={`cursor-pointer rounded-sm font-primary text-sm font-bold tracking-wide text-blue-300 ${focusRing}`}
          >
            {t('ok')}
          </button>
        </div>
      </div>
    </div>
  )
}
