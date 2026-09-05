'use client'

import { useId, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Calendar } from 'lucide-react'
import Modal from './Modal'
import DatePickerModal from './DatePickerModal'
import { focusRing } from '@/lib/styles'
import {
  isValidAvailabilityDate,
  parseAvailabilityDate,
} from '@/lib/availabilityDateRange'
import type {
  InstructorTimeOffFormValues,
  InstructorTimeOffType,
} from './InstructorAvailability.types'

type Props = {
  isOpen: boolean
  onClose: () => void
  onSave: (values: InstructorTimeOffFormValues) => void | Promise<void>
}

const radioInputClassName = 'size-4 cursor-pointer accent-blue-200'
const legendClassName =
  'mb-3.5 block w-full border-b border-black-100 pb-2 font-secondary text-xs font-semibold text-black-200'
const optionsClassName = 'flex flex-col gap-3'

// dd/mm/yyyy (what DatePickerModal emits) -> ISO YYYY-MM-DD.
function toISODate(dmy: string): string {
  const date = parseAvailabilityDate(dmy)
  if (!date) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function InstructorTimeOffFormModal({
  isOpen,
  onClose,
  onSave,
}: Props) {
  const t = useTranslations('InstructorTimeOffFormModal')
  const formId = useId()

  const [dateInput, setDateInput] = useState('')
  const [type, setType] = useState<InstructorTimeOffType>('regular')
  const [reason, setReason] = useState('')
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

  function reset() {
    setDateInput('')
    setType('regular')
    setReason('')
    setIsDatePickerOpen(false)
  }

  function handleClose() {
    reset()
    onClose()
  }

  const isDateInvalid = dateInput !== '' && !isValidAvailabilityDate(dateInput)
  const needsReason = type === 'personal'
  const canSave =
    isValidAvailabilityDate(dateInput) && (!needsReason || reason.trim() !== '')

  async function handleSave() {
    try {
      await onSave({
        date: toISODate(dateInput),
        type,
        reason: needsReason ? reason.trim() : '',
      })
      reset()
    } catch {
      // The caller surfaced the error; keep the form open with the input.
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('title')}
      closeLabel={t('close')}
      active={!isDatePickerOpen}
    >
      <fieldset className='m-0 border-0 p-0'>
        <legend className={legendClassName}>{t('dateLegend')}</legend>
        <div className='relative flex items-center'>
          <input
            type='text'
            placeholder='dd/mm/yyyy'
            aria-label={t('dateLabel')}
            aria-invalid={isDateInvalid}
            aria-describedby={
              isDateInvalid ? `${formId}-date-error` : undefined
            }
            value={dateInput}
            onChange={(event) => setDateInput(event.target.value)}
            className={`w-36 rounded-sm border-0 border-b bg-transparent py-1.5 pr-7 pl-1 font-secondary text-sm text-black-300 ${focusRing} ${
              isDateInvalid ? 'border-red-200' : 'border-black-200'
            }`}
          />
          <button
            type='button'
            onClick={() => setIsDatePickerOpen(true)}
            aria-label={t('openCalendarLabel')}
            className={`absolute right-0 flex size-6 cursor-pointer items-center justify-center rounded-sm text-black-200 ${focusRing}`}
          >
            <Calendar size={16} aria-hidden='true' />
          </button>
        </div>
        {isDateInvalid && (
          <p
            id={`${formId}-date-error`}
            role='alert'
            className='mt-1 font-secondary text-xs text-red-300'
          >
            {t('invalidDateError')}
          </p>
        )}
      </fieldset>

      <fieldset className='m-0 mt-5.5 border-0 p-0'>
        <legend className={legendClassName}>{t('typeLegend')}</legend>
        <div className={optionsClassName}>
          <label className='flex cursor-pointer items-center gap-3 font-primary text-sm font-semibold text-black-300'>
            <input
              type='radio'
              name={`${formId}-type`}
              className={radioInputClassName}
              checked={type === 'regular'}
              onChange={() => setType('regular')}
            />
            {t('typeRegular')}
          </label>
          <label className='flex cursor-pointer items-center gap-3 font-primary text-sm font-semibold text-black-300'>
            <input
              type='radio'
              name={`${formId}-type`}
              className={radioInputClassName}
              checked={type === 'personal'}
              onChange={() => setType('personal')}
            />
            {t('typePersonal')}
          </label>
        </div>
        <p className='mt-2.5 font-secondary text-xs text-black-200'>
          {t('weeklyHint')}
        </p>
      </fieldset>

      {needsReason && (
        <fieldset className='m-0 mt-5.5 border-0 p-0'>
          <legend className={legendClassName}>{t('reasonLegend')}</legend>
          <textarea
            aria-label={t('reasonLabel')}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={3}
            className={`w-full rounded-sm border border-black-200 bg-transparent px-2 py-1.5 font-secondary text-sm text-black-300 ${focusRing}`}
          />
        </fieldset>
      )}

      <div className='mt-1.5 flex gap-2.5'>
        <button
          type='button'
          onClick={handleSave}
          disabled={!canSave}
          className={`flex-1 cursor-pointer rounded-lg bg-blue-100 px-3 py-2.5 font-primary text-sm font-bold text-blue-300 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
        >
          {t('save')}
        </button>
        <button
          type='button'
          onClick={handleClose}
          className={`flex-1 cursor-pointer rounded-lg bg-black-100/60 px-3 py-2.5 font-primary text-sm font-bold text-black-300 ${focusRing}`}
        >
          {t('close')}
        </button>
      </div>

      <DatePickerModal
        key={isDatePickerOpen ? 'open' : 'closed'}
        isOpen={isDatePickerOpen}
        initialDate={dateInput}
        onCancel={() => setIsDatePickerOpen(false)}
        onConfirm={(date) => {
          setDateInput(date)
          setIsDatePickerOpen(false)
        }}
      />
    </Modal>
  )
}
