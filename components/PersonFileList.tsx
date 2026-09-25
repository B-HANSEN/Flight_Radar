'use client'

import { useId } from 'react'
import { Download, FileText, Loader2 } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { apiUrl } from '@/lib/api'
import { focusRing } from '@/lib/styles'
import type { PersonFile } from './PersonFileList.types'

type Props = {
  files?: PersonFile[]
  // Overrides the default student-facing heading.
  title?: string
  // 'h3' when nested under another panel's h2 (the instructor upload panel).
  headingLevel?: 'h2' | 'h3'
  // Shown in place of the list while another student's files are fetched,
  // so the previous student's files never sit under the new heading.
  loading?: boolean
  referenceDate?: Date
}

// Both dates are rendered on the server and again on the client, so they're
// pinned to UTC to keep the two renders identical.
function formatDate(value: string, locale: string): string {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00Z`)
    : new Date(value)
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(date)
}

function FileRow({ file, todayIso }: { file: PersonFile; todayIso: string }) {
  const t = useTranslations('PersonFileList')
  const locale = useLocale()
  const expired = file.expiresAt !== undefined && file.expiresAt < todayIso

  return (
    <li className='grid grid-cols-[auto_1.6fr_1fr_1fr_auto] items-center gap-4 rounded-lg border border-black-100 bg-black-100/10 px-4.5 py-4'>
      <div className='flex size-8 items-center justify-center rounded-full bg-blue-100'>
        <FileText size={16} className='text-blue-300' aria-hidden='true' />
      </div>

      <div className='min-w-0'>
        <div className='truncate font-primary text-sm font-bold text-black-300'>
          {file.label}
        </div>
        <div className='mt-0.5 font-secondary text-xs text-black-200'>
          {t(`categories.${file.category}`)}
        </div>
      </div>

      <div>
        <div className='mb-0.5 font-secondary text-[11px] tracking-wide text-black-200 uppercase'>
          {t('uploaded')}
        </div>
        <div className='font-secondary text-sm font-semibold text-black-300'>
          {formatDate(file.uploadedAt, locale)}
        </div>
      </div>

      <div>
        <div className='mb-0.5 font-secondary text-[11px] tracking-wide text-black-200 uppercase'>
          {t('expires')}
        </div>
        <div
          className={`font-secondary text-sm font-semibold ${
            expired ? 'text-red-300' : 'text-black-300'
          }`}
        >
          {file.expiresAt ? formatDate(file.expiresAt, locale) : '—'}
          {expired && ` · ${t('expired')}`}
        </div>
      </div>

      <a
        href={apiUrl(`/person-files/${file.id}/download`)}
        download={file.fileName}
        aria-label={t('downloadLabel', { name: file.label })}
        className={`flex-none cursor-pointer rounded-sm p-1 text-black-200 ${focusRing}`}
      >
        <Download size={16} aria-hidden='true' />
      </a>
    </li>
  )
}

export default function PersonFileList({
  files = [],
  title,
  headingLevel = 'h2',
  loading = false,
  referenceDate,
}: Props) {
  const t = useTranslations('PersonFileList')
  const headingId = useId()
  const Heading = headingLevel
  const todayIso = (referenceDate ?? new Date()).toISOString().slice(0, 10)

  return (
    <section aria-labelledby={headingId}>
      <Heading
        id={headingId}
        className='mb-5 font-primary text-lg font-bold text-black-300'
      >
        {title ?? t('title')}
      </Heading>

      {loading ? (
        <p
          role='status'
          className='flex items-center justify-center gap-2 rounded-lg border border-dashed border-black-100 px-6 py-6 font-secondary text-sm text-black-200'
        >
          <Loader2
            size={16}
            className='flex-none text-blue-300 motion-safe:animate-spin'
            aria-hidden='true'
          />
          {t('loading')}
        </p>
      ) : files.length === 0 ? (
        <p className='rounded-lg border border-dashed border-black-100 px-6 py-6 text-center font-secondary text-sm text-black-200'>
          {t('empty')}
        </p>
      ) : (
        <div className='overflow-x-auto'>
          <ul className='flex min-w-160 flex-col gap-2.5'>
            {files.map((file) => (
              <FileRow key={file.id} file={file} todayIso={todayIso} />
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
