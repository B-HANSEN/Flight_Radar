// No 'use client' here (like ComposeEmailModal): this is only ever rendered
// inside DocumentsBrowser.tsx, which is the actual client entry, so it's
// bundled as a client component regardless. Adding the directive here would
// make Next's TS plugin flag `onUploaded` as a non-serializable entry prop
// (ts 71007) even though it never crosses a server/client boundary.

import { useId, useRef, useState, type SubmitEvent } from 'react'
import { Upload } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { apiErrorMessage, fetchApi, FlightRadarApiError } from '@/lib/api'
import { focusRing } from '@/lib/styles'
import Toast from './Toast'
import type { DocumentFolder } from './DocumentsBrowser.types'

type Props = {
  folder: Pick<DocumentFolder, 'id' | 'name'>
  // The uploading instructor.
  instructorId: string
  // Receives the folder as the API returns it after the upload.
  onUploaded?: (folder: DocumentFolder) => void
}

// Mirrors the API's limits (server/src/documents) so the instructor gets an
// immediate answer instead of a round trip.
export const MAX_FILE_BYTES = 10 * 1024 * 1024
const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
  'image/webp',
]

export default function DocumentUpload({
  folder,
  instructorId,
  onUploaded,
}: Props) {
  const t = useTranslations('DocumentUpload')
  const fieldId = useId()
  const fileInput = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  // Shown inline under the field, so it stays until the next attempt
  // instead of fading with a toast.
  const [error, setError] = useState<string | null>(null)
  const [uploaded, setUploaded] = useState(false)

  // Catches what the file picker's `accept` filter lets through (it can be
  // switched to "All files") before a round trip.
  function validate(file: File): string | null {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return t('wrongType', { file: file.name })
    }
    if (file.size > MAX_FILE_BYTES) return t('tooLarge', { file: file.name })
    return null
  }

  // The expected rejections get a localized message; anything else falls
  // back to the API's own text, or a generic one.
  function uploadErrorMessage(caught: unknown, file: File): string {
    if (caught instanceof FlightRadarApiError) {
      if (caught.statusCode === 409) {
        return t('duplicate', { file: file.name, folder: folder.name })
      }
      if (caught.statusCode === 413) return t('tooLarge', { file: file.name })
    }
    return apiErrorMessage(caught, t('uploadError'))
  }

  async function upload(file: File) {
    const body = new FormData()
    body.append('file', file)
    body.append('uploadedBy', instructorId)
    return fetchApi<DocumentFolder>(`/documents/${folder.id}/files`, {
      method: 'POST',
      body,
      cache: 'no-store',
    })
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const file = fileInput.current?.files?.[0]
    if (!file) return
    const invalid = validate(file)
    setError(invalid)
    if (invalid) return

    setUploading(true)
    let updated: DocumentFolder
    try {
      updated = await upload(file)
    } catch (caught) {
      setError(uploadErrorMessage(caught, file))
      return
    } finally {
      setUploading(false)
    }

    if (fileInput.current) fileInput.current.value = ''
    setUploaded(true)
    onUploaded?.(updated)
  }

  const errorId = `${fieldId}-error`

  return (
    <form
      onSubmit={handleSubmit}
      aria-busy={uploading}
      className='flex flex-col gap-3 border-t border-black-200 px-6 py-4 md:flex-row md:items-start'
    >
      <div className='min-w-0 flex-1'>
        <label
          htmlFor={fieldId}
          className='mb-1.5 block font-secondary text-xs font-semibold text-black-200'
        >
          {t('fileLabel', { folder: folder.name })}
        </label>
        <input
          id={fieldId}
          ref={fileInput}
          type='file'
          accept={ACCEPTED_TYPES.join(',')}
          required
          onChange={() => setError(null)}
          aria-invalid={error !== null}
          aria-describedby={`${fieldId}-hint${error ? ` ${errorId}` : ''}`}
          className={`w-full rounded-sm border bg-transparent px-2 py-1.5 font-secondary text-sm text-black-300 file:mr-3 file:cursor-pointer file:rounded-sm file:border-0 file:bg-black-100/60 file:px-2 file:py-1 file:font-primary file:text-xs file:font-bold file:text-black-300 ${error ? 'border-red-300' : 'border-black-200'} ${focusRing}`}
        />
        <p
          id={`${fieldId}-hint`}
          className='mt-1 font-secondary text-xs text-black-200'
        >
          {t('fileHint')}
        </p>
        {/* Always mounted so screen readers announce the text when it
            appears. */}
        <p
          id={errorId}
          role='alert'
          className='mt-1 font-secondary text-xs font-semibold text-red-300 empty:hidden'
        >
          {error}
        </p>
      </div>
      <button
        type='submit'
        disabled={uploading}
        className={`flex cursor-pointer items-center justify-center gap-2 self-start rounded-lg bg-blue-100 px-4 py-2.5 font-primary text-sm font-bold text-blue-300 disabled:cursor-not-allowed disabled:opacity-50 md:mt-5.5 ${focusRing}`}
      >
        <Upload size={16} aria-hidden='true' />
        {uploading ? t('uploading') : t('submit')}
      </button>

      <Toast
        message={t('uploaded')}
        open={uploaded}
        onClose={() => setUploaded(false)}
        variant='success'
      />
    </form>
  )
}
