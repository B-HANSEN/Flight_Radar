'use client'

import { useId, useRef, useState, type FormEvent } from 'react'
import { Upload } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { apiErrorMessage, fetchApi } from '@/lib/api'
import { focusRing } from '@/lib/styles'
import PersonFileList from './PersonFileList'
import Toast from './Toast'
import {
  PERSON_FILE_CATEGORIES,
  type PersonFile,
  type PersonFileCategory,
} from './PersonFileList.types'

type PersonOption = { id: string; name: string }

type Props = {
  students?: PersonOption[]
  // Other instructors only — four-eyes principle: an instructor's own
  // documents are uploaded by someone else, so the uploader isn't offered.
  instructors?: PersonOption[]
  // The uploading instructor.
  instructorId?: string
  // Files of the first recipient, fetched server-side so the list isn't
  // empty on first paint.
  initialFiles?: PersonFile[]
}

// Mirrors the API's limits (server/src/person-files) so the instructor gets
// an immediate answer instead of a round trip.
export const MAX_FILE_BYTES = 10 * 1024 * 1024
const ACCEPTED_TYPES = 'application/pdf,image/png,image/jpeg,image/webp'
const MAX_LABEL_LENGTH = 120

const labelClassName =
  'mb-1.5 block font-secondary text-xs font-semibold text-black-200'
const inputClassName = `w-full rounded-sm border border-black-200 bg-transparent px-2 py-1.5 font-secondary text-sm text-black-300 ${focusRing}`

type ToastState = { message: string; variant: 'success' | 'error' } | null

function RecipientGroup({
  label,
  people,
}: {
  label: string
  people: PersonOption[]
}) {
  if (people.length === 0) return null
  return (
    <optgroup label={label}>
      {people.map((person) => (
        <option key={person.id} value={person.id}>
          {person.name}
        </option>
      ))}
    </optgroup>
  )
}

export default function PersonFileUpload({
  students = [],
  instructors = [],
  instructorId,
  initialFiles = [],
}: Props) {
  const t = useTranslations('PersonFileUpload')
  const headingId = useId()
  const fieldId = useId()
  const fileInput = useRef<HTMLInputElement>(null)
  const recipients = [...students, ...instructors]
  const [personId, setPersonId] = useState(recipients[0]?.id ?? '')
  const [label, setLabel] = useState('')
  const [category, setCategory] = useState<PersonFileCategory>('checklist')
  const [expiresAt, setExpiresAt] = useState('')
  const [files, setFiles] = useState<PersonFile[]>(initialFiles)
  const [uploading, setUploading] = useState(false)
  const [loadingFiles, setLoadingFiles] = useState(false)
  const [toast, setToast] = useState<ToastState>(null)
  const selectedPerson = recipients.find((person) => person.id === personId)
  // The person whose files the list should show. A load that resolves after
  // the instructor has picked someone else is stale and dropped.
  const currentPersonId = useRef(personId)

  async function loadFiles(id: string) {
    try {
      const next = await fetchApi<PersonFile[]>(
        `/person-files?personId=${encodeURIComponent(id)}`,
      )
      if (currentPersonId.current === id) setFiles(next)
    } catch (error) {
      if (currentPersonId.current !== id) return
      setFiles([])
      setToast({
        message: apiErrorMessage(error, t('loadError')),
        variant: 'error',
      })
    } finally {
      if (currentPersonId.current === id) setLoadingFiles(false)
    }
  }

  async function handlePersonChange(id: string) {
    setPersonId(id)
    currentPersonId.current = id
    setLoadingFiles(true)
    await loadFiles(id)
  }

  function buildFormData(file: File): FormData {
    const data = new FormData()
    data.append('file', file)
    data.append('personId', personId)
    data.append('label', label.trim())
    data.append('category', category)
    data.append('expiresAt', expiresAt)
    data.append('uploadedBy', instructorId ?? '')
    return data
  }

  function resetFields() {
    setLabel('')
    setExpiresAt('')
    if (fileInput.current) fileInput.current.value = ''
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const file = fileInput.current?.files?.[0]
    if (!file) return
    if (file.size > MAX_FILE_BYTES) {
      setToast({ message: t('tooLarge'), variant: 'error' })
      return
    }

    setUploading(true)
    try {
      await fetchApi<PersonFile>('/person-files', {
        method: 'POST',
        body: buildFormData(file),
        cache: 'no-store',
      })
    } catch (error) {
      setToast({
        message: apiErrorMessage(error, t('uploadError')),
        variant: 'error',
      })
      return
    } finally {
      setUploading(false)
    }

    resetFields()
    setToast({ message: t('uploaded'), variant: 'success' })
    if (currentPersonId.current === personId) await loadFiles(personId)
  }

  return (
    <section
      aria-labelledby={headingId}
      className='rounded-xl border border-black-100 bg-white p-5'
    >
      <h2
        id={headingId}
        className='mb-1.5 font-primary text-xl font-bold text-black-300'
      >
        {t('title')}
      </h2>
      <p className='mb-5 font-secondary text-sm text-black-200'>
        {t('description')}
      </p>

      <form
        onSubmit={handleSubmit}
        aria-busy={uploading}
        className='mb-8 grid grid-cols-1 gap-4 md:grid-cols-2'
      >
        <div>
          <label htmlFor={`${fieldId}-recipient`} className={labelClassName}>
            {t('recipientLabel')}
          </label>
          <select
            id={`${fieldId}-recipient`}
            value={personId}
            onChange={(event) => handlePersonChange(event.target.value)}
            required
            className={inputClassName}
          >
            <RecipientGroup label={t('studentsGroup')} people={students} />
            <RecipientGroup
              label={t('instructorsGroup')}
              people={instructors}
            />
          </select>
        </div>

        <div>
          <label htmlFor={`${fieldId}-label`} className={labelClassName}>
            {t('labelLabel')}
          </label>
          <input
            id={`${fieldId}-label`}
            type='text'
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            required
            maxLength={MAX_LABEL_LENGTH}
            placeholder={t('labelPlaceholder')}
            className={inputClassName}
          />
        </div>

        <div>
          <label htmlFor={`${fieldId}-category`} className={labelClassName}>
            {t('categoryLabel')}
          </label>
          <select
            id={`${fieldId}-category`}
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as PersonFileCategory)
            }
            className={inputClassName}
          >
            {PERSON_FILE_CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {t(`categories.${value}`)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`${fieldId}-expires`} className={labelClassName}>
            {t('expiresLabel')}
          </label>
          <input
            id={`${fieldId}-expires`}
            type='date'
            value={expiresAt}
            onChange={(event) => setExpiresAt(event.target.value)}
            className={inputClassName}
          />
        </div>

        <div className='md:col-span-2'>
          <label htmlFor={`${fieldId}-file`} className={labelClassName}>
            {t('fileLabel')}
          </label>
          <input
            id={`${fieldId}-file`}
            ref={fileInput}
            type='file'
            accept={ACCEPTED_TYPES}
            required
            aria-describedby={`${fieldId}-file-hint`}
            className={`${inputClassName} file:mr-3 file:cursor-pointer file:rounded-sm file:border-0 file:bg-black-100/60 file:px-2 file:py-1 file:font-primary file:text-xs file:font-bold file:text-black-300`}
          />
          <p
            id={`${fieldId}-file-hint`}
            className='mt-1 font-secondary text-xs text-black-200'
          >
            {t('fileHint')}
          </p>
        </div>

        <div className='md:col-span-2'>
          <button
            type='submit'
            disabled={uploading || !personId || !instructorId}
            className={`flex cursor-pointer items-center gap-2 rounded-lg bg-blue-100 px-4 py-2.5 font-primary text-sm font-bold text-blue-300 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
          >
            <Upload size={16} aria-hidden='true' />
            {uploading ? t('uploading') : t('submit')}
          </button>
        </div>
      </form>

      <PersonFileList
        files={files}
        loading={loadingFiles}
        headingLevel='h3'
        title={
          selectedPerson
            ? t('filesFor', { name: selectedPerson.name })
            : undefined
        }
      />

      <Toast
        message={toast?.message ?? ''}
        open={toast !== null}
        onClose={() => setToast(null)}
        variant={toast?.variant ?? 'success'}
      />
    </section>
  )
}
