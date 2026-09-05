'use client'

import { useState } from 'react'
import {
  Download,
  ExternalLink,
  RefreshCw,
  SquarePen,
  Users,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { apiErrorMessage, apiUrl, fetchApi } from '@/lib/api'
import { avatarColor, initialsOf } from '@/lib/avatar'
import { focusRing } from '@/lib/styles'
import ComposeEmailModal from './ComposeEmailModal'
import Toast from './Toast'
import type {
  ComposeEmailValues,
  MailboxAction,
  MailboxEmail,
  MailboxPerson,
  MailboxSendAs,
} from './Mailbox.types'

type Folder = 'inbox' | 'sent'

type ToastState = {
  message: string
  variant: 'loading' | 'success' | 'error' | 'info'
}

type Props = {
  emails?: MailboxEmail[]
  sentEmails?: MailboxEmail[]
  people?: MailboxPerson[]
  currentPersonId?: string
  currentPersonName?: string
  currentPersonRole?: string
  canSendAsDesk?: boolean
}

const ACADEMY = 'Flight Radar Academy'

const DESK_SENDER: Record<
  Exclude<MailboxSendAs, 'self'>,
  { name: string; role: string }
> = {
  operations: { name: 'Operations Desk', role: 'Airfield Operations' },
  exams: { name: 'Exams Office', role: 'Academics' },
  training: { name: 'Training Office', role: 'Head of Training' },
}

// Blank-line separated paragraphs, falling back to the whole message as one.
function toParagraphs(body: string): string[] {
  const paragraphs = body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph !== '')
  return paragraphs.length > 0 ? paragraphs : [body.trim()]
}

export default function Mailbox({
  emails = [],
  sentEmails = [],
  people = [],
  currentPersonId,
  currentPersonName = 'Jamie Torres',
  currentPersonRole = '',
  canSendAsDesk = false,
}: Props) {
  const t = useTranslations('Mailbox')
  const router = useRouter()

  const [folder, setFolder] = useState<Folder>('inbox')
  const [selectedId, setSelectedId] = useState<string | null>(
    emails[0]?.id ?? null,
  )
  const [hideAutomatic, setHideAutomatic] = useState(true)
  const [hideRead, setHideRead] = useState(false)
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [locallyReadIds, setLocallyReadIds] = useState<ReadonlySet<string>>(
    new Set(),
  )

  const nameById = new Map(people.map((person) => [person.id, person.name]))
  const folderEmails = folder === 'inbox' ? emails : sentEmails

  function handleRefresh() {
    setToast({ message: t('fetching'), variant: 'loading' })
    setLocallyReadIds(new Set())
    router.refresh()
  }

  function isRead(email: MailboxEmail) {
    if (folder === 'sent') return true
    return email.read !== false || locallyReadIds.has(email.id)
  }

  async function markAsRead(email: MailboxEmail) {
    if (folder === 'sent') return
    if (email.read !== false || locallyReadIds.has(email.id)) return

    setLocallyReadIds((previous) => new Set(previous).add(email.id))
    try {
      await fetchApi(`/mailbox/${email.id}/read`, {
        method: 'PATCH',
        cache: 'no-store',
      })
    } catch (error) {
      setToast({
        message: apiErrorMessage(error, t('markReadError')),
        variant: 'error',
      })
    }
  }

  async function handleSend(values: ComposeEmailValues) {
    const desk = values.sendAs === 'self' ? null : DESK_SENDER[values.sendAs]
    const isSelf = desk === null
    try {
      await fetchApi('/mailbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({
          recipientId: values.recipientId,
          ...(isSelf && currentPersonId ? { senderId: currentPersonId } : {}),
          sender: desk ? desk.name : currentPersonName,
          category: isSelf ? 'personal' : values.sendAs,
          subject: values.subject,
          body: toParagraphs(values.body),
          signOff: desk
            ? { name: desk.name, role: desk.role, org: ACADEMY }
            : {
                name: currentPersonName,
                role: currentPersonRole,
                org: ACADEMY,
              },
        }),
      })
      setIsComposeOpen(false)
      setToast({ message: t('sentToast'), variant: 'success' })
      setFolder('sent')
      router.refresh()
    } catch (error) {
      setToast({
        message: apiErrorMessage(error, t('sendError')),
        variant: 'error',
      })
      throw error
    }
  }

  const visibleEmails = folderEmails
    .filter((email) => !hideAutomatic || !email.automatic)
    .filter((email) => !hideRead || !isRead(email))
  const selected =
    visibleEmails.find((email) => email.id === selectedId) ??
    visibleEmails[0] ??
    null
  const unreadCount = emails.filter(
    (email) => email.read === false && !locallyReadIds.has(email.id),
  ).length

  const composeButton = (
    <button
      type='button'
      onClick={() => setIsComposeOpen(true)}
      className={`inline-flex items-center gap-2 rounded-lg bg-blue-100 px-3.5 py-2 font-primary text-sm font-bold text-blue-300 ${focusRing}`}
    >
      <SquarePen size={15} aria-hidden='true' />
      {t('compose')}
    </button>
  )

  const composeModal = (
    <ComposeEmailModal
      isOpen={isComposeOpen}
      onClose={() => setIsComposeOpen(false)}
      people={people}
      canSendAsDesk={canSendAsDesk}
      onSend={handleSend}
    />
  )

  const toastEl = (
    <Toast
      message={toast?.message ?? ''}
      open={toast !== null}
      variant={toast?.variant ?? 'info'}
      onClose={() => setToast(null)}
    />
  )

  const folderTabs = (
    <div
      role='group'
      aria-label={t('folderLabel')}
      className='flex gap-1 border-b border-black-200 px-4.5 pt-3'
    >
      {(['inbox', 'sent'] as const).map((key) => {
        const isActive = folder === key
        return (
          <button
            key={key}
            type='button'
            aria-pressed={isActive}
            onClick={() => {
              setFolder(key)
              setSelectedId(null)
            }}
            className={`rounded-t-lg px-3.5 py-2 font-primary text-sm font-semibold ${focusRing} ${
              isActive
                ? 'bg-blue-100 text-blue-300'
                : 'text-black-200 hover:bg-black-100/40'
            }`}
          >
            {t(key)}
          </button>
        )
      })}
    </div>
  )

  if (emails.length === 0 && sentEmails.length === 0) {
    return (
      <>
        <div className='mb-4 flex justify-end'>{composeButton}</div>
        <section
          aria-label={t('title')}
          className='rounded-xl border border-black-100 bg-white p-6 text-center font-secondary text-sm text-black-200'
        >
          {t('noEmails')}
        </section>
        {composeModal}
        {toastEl}
      </>
    )
  }

  return (
    <>
      <div className='mb-4 flex justify-end'>{composeButton}</div>
      <section
        aria-label={t('title')}
        className='grid overflow-hidden rounded-xl border border-black-200 bg-white md:min-h-160 md:grid-cols-[360px_1fr]'
      >
        <div className='flex flex-col border-b border-black-100 md:border-r md:border-b-0'>
          {folderTabs}
          <div className='flex flex-col gap-2.5 border-b border-black-200 px-4.5 py-4'>
            <div className='flex items-center justify-between'>
              <span className='font-primary text-base font-bold text-black-300'>
                {t('emailCount', { count: folderEmails.length })}
              </span>
              <button
                type='button'
                onClick={handleRefresh}
                aria-label={t('refreshLabel')}
                className={`rounded-sm p-1 text-black-200 ${focusRing}`}
              >
                <RefreshCw size={16} aria-hidden='true' />
              </button>
            </div>
            {folder === 'inbox' && (
              <div className='flex items-center gap-3 font-secondary text-xs text-black-200'>
                <span
                  className='inline-flex items-center gap-1.5'
                  aria-live='polite'
                  aria-atomic='true'
                >
                  <span className='size-1.75 rounded-full bg-blue-200' />
                  {t('unreadCount', { count: unreadCount })}
                </span>
              </div>
            )}
            <label className='flex cursor-pointer items-center gap-2 font-secondary text-xs text-black-200'>
              <input
                type='checkbox'
                checked={hideAutomatic}
                onChange={(event) => setHideAutomatic(event.target.checked)}
                className='size-3.5 cursor-pointer accent-blue-200'
              />
              {t('hideAutomatic')}
            </label>
            {folder === 'inbox' && (
              <label className='flex cursor-pointer items-center gap-2 font-secondary text-xs text-black-200'>
                <input
                  type='checkbox'
                  checked={hideRead}
                  onChange={(event) => setHideRead(event.target.checked)}
                  className='size-3.5 cursor-pointer accent-blue-200'
                />
                {t('hideRead')}
              </label>
            )}
          </div>

          <ul className='flex-1 list-none overflow-y-auto scrollbar-gutter-stable'>
            {visibleEmails.length === 0 ? (
              <li className='px-4.5 py-6 text-center font-secondary text-sm text-black-200'>
                {t('noVisibleEmails')}
              </li>
            ) : (
              visibleEmails.map((email) => {
                const isSelected = email.id === selected?.id
                const rowName =
                  folder === 'sent'
                    ? (nameById.get(email.recipientId) ?? email.sender)
                    : email.sender
                return (
                  <li key={email.id}>
                    <button
                      type='button'
                      onClick={() => {
                        setSelectedId(email.id)
                        void markAsRead(email)
                      }}
                      aria-current={isSelected ? 'true' : undefined}
                      className={`flex w-full items-start gap-3 border-b border-black-200 px-4.5 py-3.5 text-left ${focusRing} ${isSelected ? 'bg-blue-100/40' : 'hover:bg-black-100/20'}`}
                    >
                      {!isRead(email) && (
                        <span className='sr-only'>{t('unreadLabel')}</span>
                      )}
                      <span
                        className={`flex size-9 flex-none items-center justify-center rounded-full font-primary text-xs font-bold text-white ${avatarColor(email.id)}`}
                      >
                        {initialsOf(rowName)}
                      </span>
                      <span className='min-w-0 flex-1'>
                        <span className='flex items-baseline justify-between gap-2'>
                          <span className='truncate font-primary text-sm font-bold text-black-300'>
                            {folder === 'sent'
                              ? t('toName', { name: rowName })
                              : rowName}
                          </span>
                          <span
                            className={`flex-none font-secondary text-[11px] ${isSelected ? 'text-black-300' : 'text-black-200'}`}
                          >
                            {email.date}
                          </span>
                        </span>
                        <span
                          className={`mt-0.5 block truncate font-secondary text-sm text-black-300 ${isRead(email) ? 'font-normal' : 'font-bold'}`}
                        >
                          {email.subject}
                        </span>
                        <span
                          className={`mt-0.5 block truncate font-secondary text-xs ${isSelected ? 'text-black-300' : 'text-black-200'}`}
                        >
                          {email.preview}
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })
            )}
          </ul>
        </div>

        <div className='overflow-y-auto p-8'>
          {selected ? (
            <>
              <div className='mb-6 flex items-start justify-between gap-5'>
                <h2 className='font-primary text-xl font-bold text-black-300'>
                  {selected.subject}
                </h2>
                <span className='flex-none font-secondary text-xs text-black-200'>
                  {selected.dateFull}
                </span>
              </div>
              <div className='mb-7 flex items-center gap-3 border-b border-black-100 pb-5'>
                <span
                  className={`flex size-11 flex-none items-center justify-center rounded-full font-primary text-sm font-bold text-white ${avatarColor(selected.id)}`}
                >
                  {initialsOf(selected.sender)}
                </span>
                <div>
                  <div className='font-primary text-sm font-bold text-black-300'>
                    {selected.sender}
                  </div>
                  <div className='font-secondary text-xs text-black-200'>
                    {t('to', {
                      name:
                        folder === 'sent'
                          ? (nameById.get(selected.recipientId) ??
                            t('unknownRecipient'))
                          : currentPersonName,
                    })}
                  </div>
                </div>
              </div>
              <div className='max-w-170 font-secondary text-[15px] leading-relaxed text-black-300'>
                {selected.body.map((paragraph, index) => (
                  <p key={index} className='mb-4'>
                    {paragraph}
                  </p>
                ))}
                {selected.action &&
                  (selected.action.type === 'download' ||
                    selected.action.href) && (
                    <p className='mb-1'>
                      <MailboxActionLink
                        emailId={selected.id}
                        action={selected.action}
                      />
                    </p>
                  )}
                <p className='mt-6 font-primary text-sm font-bold text-black-300'>
                  {selected.signOff.name}
                </p>
                <p className='font-secondary text-xs text-black-200'>
                  {selected.signOff.role && (
                    <>
                      {selected.signOff.role}
                      <br />
                    </>
                  )}
                  {selected.signOff.org}
                </p>
              </div>
            </>
          ) : (
            <p className='font-secondary text-sm text-black-200'>
              {t('noVisibleEmails')}
            </p>
          )}
        </div>
      </section>

      {composeModal}
      {toastEl}
    </>
  )
}

function MailboxActionLink({
  emailId,
  action,
}: {
  emailId: string
  action: MailboxAction
}) {
  const t = useTranslations('Mailbox')

  if (action.type === 'download') {
    return (
      <a
        href={apiUrl(`/mailbox/${emailId}/attachment`)}
        className='inline-flex items-center gap-1.5 font-semibold text-blue-300 underline'
      >
        <Download size={14} aria-hidden='true' />
        {action.label}
        <span className='sr-only'>{t('opensDownload')}</span>
      </a>
    )
  }

  // The caller only renders this branch once action.href is confirmed
  // present; bail out rather than emit a dead '#' link if that ever isn't
  // the case (e.g. a malformed row from a future write path).
  if (!action.href) return null

  const Icon = action.type === 'join' ? Users : ExternalLink
  return (
    <a
      href={action.href}
      target='_blank'
      rel='noreferrer noopener'
      className='inline-flex items-center gap-1.5 font-semibold text-blue-300 underline'
    >
      <Icon size={14} aria-hidden='true' />
      {action.label}
      <span className='sr-only'>{t('opensNewTab')}</span>
    </a>
  )
}
