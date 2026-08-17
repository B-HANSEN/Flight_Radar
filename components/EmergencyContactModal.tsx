'use client'

import { useId, useState } from 'react'
import { useTranslations } from 'next-intl'
import { focusRing } from '@/lib/styles'
import Modal from './Modal'
import type { EmergencyContact } from './ProfileCard'

type Props = {
  isOpen: boolean
  emergencyContact: EmergencyContact
  onClose: () => void
  onSave: (values: EmergencyContact) => void
  onDelete: () => void
}

const inputClassName = `w-full rounded-lg border border-black-100 bg-white px-3 py-2 font-secondary text-sm text-black-300 ${focusRing}`
const labelClassName =
  'flex flex-col gap-1.5 font-primary text-xs font-semibold text-black-200'

export default function EmergencyContactModal({
  isOpen,
  emergencyContact,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const t = useTranslations('EmergencyContactModal')
  const formId = useId()

  const [name, setName] = useState(emergencyContact.name)
  const [relation, setRelation] = useState(emergencyContact.relation)
  const [phone, setPhone] = useState(emergencyContact.phone)

  const canSave =
    name.trim() !== '' && relation.trim() !== '' && phone.trim() !== ''

  function handleSave() {
    onSave({
      name: name.trim(),
      relation: relation.trim(),
      phone: phone.trim(),
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('title')}
      closeLabel={t('close')}
    >
      <div className='flex flex-col gap-4'>
        <label className={labelClassName} htmlFor={`${formId}-name`}>
          {t('nameLabel')}
          <input
            id={`${formId}-name`}
            type='text'
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={inputClassName}
          />
        </label>
        <label className={labelClassName} htmlFor={`${formId}-relation`}>
          {t('relationLabel')}
          <input
            id={`${formId}-relation`}
            type='text'
            value={relation}
            onChange={(event) => setRelation(event.target.value)}
            className={inputClassName}
          />
        </label>
        <label className={labelClassName} htmlFor={`${formId}-phone`}>
          {t('phoneLabel')}
          <input
            id={`${formId}-phone`}
            type='tel'
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className={inputClassName}
          />
        </label>
      </div>

      <div className='mt-1.5 flex gap-2.5'>
        <button
          type='button'
          onClick={handleSave}
          disabled={!canSave}
          className='flex-1 cursor-pointer rounded-lg bg-blue-100 px-3 py-2.5 font-primary text-sm font-bold text-blue-300 disabled:cursor-not-allowed disabled:opacity-50'
        >
          {t('save')}
        </button>
        <button
          type='button'
          onClick={onClose}
          className='flex-1 cursor-pointer rounded-lg bg-black-100/60 px-3 py-2.5 font-primary text-sm font-bold text-black-200'
        >
          {t('cancel')}
        </button>
      </div>
      <button
        type='button'
        onClick={onDelete}
        className='mt-2.5 w-full cursor-pointer rounded-lg bg-red-100 px-3 py-2.5 font-primary text-sm font-bold text-red-300'
      >
        {t('delete')}
      </button>
    </Modal>
  )
}
