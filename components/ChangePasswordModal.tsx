'use client'

import { useId } from 'react'
import { useTranslations } from 'next-intl'
import { AlertCircle } from 'lucide-react'
import { focusRing } from '@/lib/styles'
import Modal from './Modal'

type Props = {
  isOpen: boolean
  onClose: () => void
}

const inputClassName = `w-full cursor-not-allowed rounded-lg border border-black-100 bg-black-100/30 px-3 py-2 font-secondary text-sm text-black-200 disabled:opacity-70 ${focusRing}`
const labelClassName =
  'flex flex-col gap-1.5 font-primary text-xs font-semibold text-black-200'

export default function ChangePasswordModal({ isOpen, onClose }: Props) {
  const t = useTranslations('ChangePasswordModal')
  const formId = useId()

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('title')}
      closeLabel={t('close')}
    >
      <div className='flex flex-col gap-4'>
        <label className={labelClassName} htmlFor={`${formId}-current`}>
          {t('currentPasswordLabel')}
          <input
            id={`${formId}-current`}
            type='password'
            disabled
            className={inputClassName}
          />
        </label>
        <label className={labelClassName} htmlFor={`${formId}-new`}>
          {t('newPasswordLabel')}
          <input
            id={`${formId}-new`}
            type='password'
            disabled
            className={inputClassName}
          />
        </label>
        <label className={labelClassName} htmlFor={`${formId}-confirm`}>
          {t('confirmPasswordLabel')}
          <input
            id={`${formId}-confirm`}
            type='password'
            disabled
            className={inputClassName}
          />
        </label>
      </div>

      <div className='mt-1.5 flex items-center gap-3 rounded-xl border border-yellow-200/60 bg-yellow-100/50 px-4 py-3'>
        <AlertCircle
          size={18}
          className='flex-none text-yellow-300'
          aria-hidden='true'
        />
        <span className='font-secondary text-xs text-black-300'>
          {t('underDevelopment')}
        </span>
      </div>

      <button
        type='button'
        disabled
        className='mt-1.5 w-full cursor-not-allowed rounded-lg bg-blue-100 px-3 py-2.5 font-primary text-sm font-bold text-blue-300 opacity-50'
      >
        {t('save')}
      </button>
    </Modal>
  )
}
