'use client'

import { useId, useRef, useState, type FormEvent } from 'react'
import { Upload } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { apiErrorMessage, fetchApi } from '@/lib/api'
import { focusRing } from '@/lib/styles'
import StudentFileList from './StudentFileList'
import Toast from './Toast'
import {
  STUDENT_FILE_CATEGORIES,
  type StudentFile,
  type StudentFileCategory,
} from './StudentFileList.types'

type StudentOption = { id: string; name: string }

type Props = {
  students?: StudentOption[]
  instructorId?: string
  // Files of the first student, fetched server-side so the list isn't empty
  // on first paint.
  initialFiles?: StudentFile[]
}

// Mirrors the API's limits (server/src/student-files) so the instructor gets
// an immediate answer instead of a round trip.
export const MAX_FILE_BYTES = 10 * 1024 * 1024
const ACCEPTED_TYPES = 'application/pdf,image/png,image/jpeg,image/webp'
const MAX_LABEL_LENGTH = 120

const labelClassName =
  'mb-1.5 block font-secondary text-xs font-semibold text-black-200'
const inputClassName = `w-full rounded-sm border border-black-200 bg-transparent px-2 py-1.5 font-secondary text-sm text-black-300 ${focusRing}`

type ToastState = { message: string; variant: 'success' | 'error' } | null

export default function StudentFileUpload({
  students = [],
  instructorId,
  initialFiles = [],
}: Props) {
  const t = useTranslations('StudentFileUpload')
  const headingId = useId()
  const fieldId = useId()
  const fileInput = useRef<HTMLInputElement>(null)
  const [studentId, setStudentId] = useState(students[0]?.id ?? '')
  const [label, setLabel] = useState('')
  const [category, setCategory] = useState<StudentFileCategory>('checklist')
  const [expiresAt, setExpiresAt] = useState('')
  const [files, setFiles] = useState<StudentFile[]>(initialFiles)
  const [uploading, setUploading] = useState(false)
  const [loadingFiles, setLoadingFiles] = useState(false)
  const [toast, setToast] = useState<ToastState>(null)
  const selectedStudent = students.find((student) => student.id === studentId)
  // The student whose files the list should show. A load that resolves after
  // the instructor has picked someone else is stale and dropped.
  const currentStudentId = useRef(studentId)

  async function loadFiles(id: string) {
    try {
      const next = await fetchApi<StudentFile[]>(
        `/student-files?studentId=${encodeURIComponent(id)}`,
      )
      if (currentStudentId.current === id) setFiles(next)
    } catch (error) {
      if (currentStudentId.current !== id) return
      setFiles([])
      setToast({
        message: apiErrorMessage(error, t('loadError')),
        variant: 'error',
      })
    } finally {
      if (currentStudentId.current === id) setLoadingFiles(false)
    }
  }

  async function handleStudentChange(id: string) {
    setStudentId(id)
    currentStudentId.current = id
    setLoadingFiles(true)
    await loadFiles(id)
  }

  function buildFormData(file: File): FormData {
    const data = new FormData()
    data.append('file', file)
    data.append('studentId', studentId)
    data.append('label', label.trim())
    data.append('category', category)
    data.append('expiresAt', expiresAt)
    if (instructorId) data.append('uploadedBy', instructorId)
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
      await fetchApi<StudentFile>('/student-files', {
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
    if (currentStudentId.current === studentId) await loadFiles(studentId)
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
          <label htmlFor={`${fieldId}-student`} className={labelClassName}>
            {t('studentLabel')}
          </label>
          <select
            id={`${fieldId}-student`}
            value={studentId}
            onChange={(event) => handleStudentChange(event.target.value)}
            required
            className={inputClassName}
          >
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
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
              setCategory(event.target.value as StudentFileCategory)
            }
            className={inputClassName}
          >
            {STUDENT_FILE_CATEGORIES.map((value) => (
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
            disabled={uploading || !studentId}
            className={`flex cursor-pointer items-center gap-2 rounded-lg bg-blue-100 px-4 py-2.5 font-primary text-sm font-bold text-blue-300 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
          >
            <Upload size={16} aria-hidden='true' />
            {uploading ? t('uploading') : t('submit')}
          </button>
        </div>
      </form>

      <StudentFileList
        files={files}
        loading={loadingFiles}
        headingLevel='h3'
        title={
          selectedStudent
            ? t('filesFor', { name: selectedStudent.name })
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
