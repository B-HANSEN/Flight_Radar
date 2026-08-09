'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { focusRing } from '@/lib/styles'
import Toast from './Toast'
import type { MailboxEmail } from './Mailbox.types'

type Props = {
  emails?: MailboxEmail[]
  recipientName?: string
  onRefresh?: () => void
}

const AVATAR_COLORS = [
  'bg-blue-300',
  'bg-green-300',
  'bg-yellow-300',
  'bg-black-300',
]

function initialsOf(name: string) {
  return name
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function avatarColor(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) % AVATAR_COLORS.length
  }
  return AVATAR_COLORS[hash]
}

export default function Mailbox({
  emails = [],
  recipientName = 'John Doe',
  onRefresh,
}: Props) {
  const t = useTranslations('Mailbox')
  const [selectedId, setSelectedId] = useState<string | null>(
    emails[0]?.id ?? null,
  )
  const [hideAutomatic, setHideAutomatic] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  function handleRefresh() {
    setIsRefreshing(true)
    onRefresh?.()
  }

  const visibleEmails = hideAutomatic
    ? emails.filter((email) => !email.automatic)
    : emails
  const selected =
    visibleEmails.find((email) => email.id === selectedId) ??
    visibleEmails[0] ??
    null
  const unreadCount = emails.filter((email) => email.read === false).length

  if (emails.length === 0) {
    return (
      <section
        aria-label={t('title')}
        className='rounded-xl border border-black-100 bg-white p-6 text-center font-secondary text-sm text-black-200'
      >
        {t('noEmails')}
      </section>
    )
  }

  return (
    <>
      <section
        aria-label={t('title')}
        className='grid overflow-hidden rounded-xl border border-black-100 bg-white md:min-h-160 md:grid-cols-[360px_1fr]'
      >
        <div className='flex flex-col border-b border-black-100 md:border-r md:border-b-0'>
          <div className='flex flex-col gap-2.5 border-b border-black-100 px-4.5 py-4'>
            <div className='flex items-center justify-between'>
              <span className='font-primary text-base font-bold text-black-300'>
                {t('emailCount', { count: emails.length })}
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
            <div className='flex items-center gap-3 font-secondary text-xs text-black-200'>
              <span className='inline-flex items-center gap-1.5'>
                <span className='size-1.75 rounded-full bg-blue-200' />
                {t('unreadCount', { count: unreadCount })}
              </span>
            </div>
            <label className='flex cursor-pointer items-center gap-2 font-secondary text-xs text-black-200'>
              <input
                type='checkbox'
                checked={hideAutomatic}
                onChange={(event) => setHideAutomatic(event.target.checked)}
                className='size-3.5 cursor-pointer accent-blue-200'
              />
              {t('hideAutomatic')}
            </label>
          </div>

          <ul className='flex-1 list-none overflow-y-auto scrollbar-gutter-stable'>
            {visibleEmails.length === 0 ? (
              <li className='px-4.5 py-6 text-center font-secondary text-sm text-black-200'>
                {t('noVisibleEmails')}
              </li>
            ) : (
              visibleEmails.map((email) => {
                const isSelected = email.id === selected?.id
                return (
                  <li key={email.id}>
                    <button
                      type='button'
                      onClick={() => setSelectedId(email.id)}
                      aria-current={isSelected ? 'true' : undefined}
                      className={`flex w-full items-start gap-3 border-b border-black-100 px-4.5 py-3.5 text-left ${focusRing} ${isSelected ? 'bg-blue-100/40' : 'hover:bg-black-100/20'}`}
                    >
                      <span
                        className={`flex size-9 flex-none items-center justify-center rounded-full font-primary text-xs font-bold text-white ${avatarColor(email.id)}`}
                      >
                        {initialsOf(email.sender)}
                      </span>
                      <span className='min-w-0 flex-1'>
                        <span className='flex items-baseline justify-between gap-2'>
                          <span className='truncate font-primary text-sm font-bold text-black-300'>
                            {email.sender}
                          </span>
                          <span
                            className={`flex-none font-secondary text-[11px] ${isSelected ? 'text-black-300' : 'text-black-200'}`}
                          >
                            {email.date}
                          </span>
                        </span>
                        <span className='mt-0.5 block truncate font-secondary text-sm font-semibold text-black-300'>
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
                    {t('to', { name: recipientName })}
                  </div>
                </div>
              </div>
              <div className='max-w-170 font-secondary text-[15px] leading-relaxed text-black-300'>
                {selected.body.map((paragraph, index) => (
                  <p key={index} className='mb-4'>
                    {paragraph}
                  </p>
                ))}
                <p className='mb-1'>
                  <a href='#' className='font-semibold underline'>
                    {selected.linkText}
                  </a>
                </p>
                <p className='mt-6 font-primary text-sm font-bold text-black-300'>
                  {selected.signOff.name}
                </p>
                <p className='font-secondary text-xs text-black-200'>
                  {selected.signOff.role}
                  <br />
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

      <Toast
        message={t('fetching')}
        open={isRefreshing}
        onClose={() => setIsRefreshing(false)}
      />
    </>
  )
}
