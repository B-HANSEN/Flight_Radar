// No 'use client' here (like ErrorCard): this is only ever rendered inside
// Mailbox.tsx, which is the actual client entry, so it's bundled as a
// client component regardless. Adding the directive here would make Next's
// TS plugin flag `onClose`/`onSend` as non-serializable entry props (ts
// 71007) even though they never cross a server/client boundary.

import { useId, useState } from 'react'
import { useTranslations } from 'next-intl'
import Modal from './Modal'
import { focusRing } from '@/lib/styles'
import type {
  ComposeEmailValues,
  MailboxPerson,
  MailboxSendAs,
} from './Mailbox.types'

type Props = {
  isOpen: boolean
  onClose: () => void
  people: MailboxPerson[]
  // Instructor personas can also send as one of the shared desks.
  canSendAsDesk?: boolean
  onSend: (values: ComposeEmailValues) => void | Promise<void>
}

const SEND_AS_OPTIONS: MailboxSendAs[] = [
  'self',
  'operations',
  'exams',
  'training',
]

const labelClassName =
  'mb-1.5 block font-secondary text-xs font-semibold text-black-200'
const fieldClassName = `w-full rounded-sm border border-black-200 bg-transparent px-2 py-1.5 font-secondary text-sm text-black-300 ${focusRing}`

export default function ComposeEmailModal({
  isOpen,
  onClose,
  people,
  canSendAsDesk = false,
  onSend,
}: Props) {
  const t = useTranslations('ComposeEmailModal')
  const formId = useId()

  const [recipientId, setRecipientId] = useState('')
  const [sendAs, setSendAs] = useState<MailboxSendAs>('self')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [isSending, setIsSending] = useState(false)

  function reset() {
    setRecipientId('')
    setSendAs('self')
    setSubject('')
    setBody('')
    setIsSending(false)
  }

  function handleClose() {
    reset()
    onClose()
  }

  const canSend =
    recipientId !== '' && subject.trim() !== '' && body.trim() !== ''

  async function handleSend() {
    if (!canSend || isSending) return
    setIsSending(true)
    try {
      await onSend({ recipientId, subject: subject.trim(), body, sendAs })
      reset()
    } catch {
      // The caller surfaced the error; keep the form open with the input.
      setIsSending(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('title')}
      closeLabel={t('close')}
    >
      <div>
        <label htmlFor={`${formId}-to`} className={labelClassName}>
          {t('recipientLabel')}
        </label>
        <select
          id={`${formId}-to`}
          value={recipientId}
          onChange={(event) => setRecipientId(event.target.value)}
          aria-required='true'
          className={`${fieldClassName} cursor-pointer`}
        >
          <option value=''>{t('recipientPlaceholder')}</option>
          {people.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name} · {t(`kind.${person.kind}`)}
            </option>
          ))}
        </select>
      </div>

      {canSendAsDesk && (
        <div>
          <label htmlFor={`${formId}-as`} className={labelClassName}>
            {t('sendAsLabel')}
          </label>
          <select
            id={`${formId}-as`}
            value={sendAs}
            onChange={(event) => setSendAs(event.target.value as MailboxSendAs)}
            className={`${fieldClassName} cursor-pointer`}
          >
            {SEND_AS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {t(`sendAs.${option}`)}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor={`${formId}-subject`} className={labelClassName}>
          {t('subjectLabel')}
        </label>
        <input
          id={`${formId}-subject`}
          type='text'
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          aria-required='true'
          className={fieldClassName}
        />
      </div>

      <div>
        <label htmlFor={`${formId}-body`} className={labelClassName}>
          {t('bodyLabel')}
        </label>
        <textarea
          id={`${formId}-body`}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={6}
          aria-required='true'
          className={fieldClassName}
        />
      </div>

      <div className='mt-1.5 flex gap-2.5'>
        <button
          type='button'
          onClick={handleSend}
          disabled={!canSend || isSending}
          className={`flex-1 cursor-pointer rounded-lg bg-blue-100 px-3 py-2.5 font-primary text-sm font-bold text-blue-300 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
        >
          {t('send')}
        </button>
        <button
          type='button'
          onClick={handleClose}
          className={`flex-1 cursor-pointer rounded-lg bg-black-100/60 px-3 py-2.5 font-primary text-sm font-bold text-black-200 ${focusRing}`}
        >
          {t('close')}
        </button>
      </div>
    </Modal>
  )
}
