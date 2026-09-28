'use client'

import { useRef, useState } from 'react'
import { ChevronRight, Folder, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { focusRing } from '@/lib/styles'
import {
  apiErrorMessage,
  apiUrl,
  fetchApi,
  FlightRadarApiError,
} from '@/lib/api'
import DocumentUpload from './DocumentUpload'
import Toast from './Toast'
import type { DocumentFolder } from './DocumentsBrowser.types'

type Props = {
  folders?: DocumentFolder[]
  // Set in the instructor view: adds an upload form and per-file delete
  // buttons inside each folder.
  instructorId?: string
}

const EXT_COLORS: Record<string, string> = {
  PDF: 'bg-red-300',
  XLSX: 'bg-green-300',
}

type ToastState = {
  message: string
  variant: 'success' | 'error' | 'info'
} | null

// Errors stay up longer than the default 3s so they can actually be read.
const ERROR_TOAST_MS = 8000

function fileUrl(folderId: string, fileName: string): string {
  return `/documents/${folderId}/files/${encodeURIComponent(fileName)}`
}

export default function DocumentsBrowser({
  folders: initialFolders = [],
  instructorId,
}: Props) {
  const t = useTranslations('DocumentsBrowser')
  const [folders, setFolders] = useState(initialFolders)
  const [openFolderId, setOpenFolderId] = useState<string | null>(null)
  const [deletingName, setDeletingName] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastState>(null)
  // Takes focus after a delete, so it isn't lost with the removed row.
  const fileList = useRef<HTMLUListElement>(null)
  const openFolder =
    folders.find((folder) => folder.id === openFolderId) ?? null

  function replaceFolder(updated: DocumentFolder) {
    setFolders((current) =>
      current.map((folder) => (folder.id === updated.id ? updated : folder)),
    )
  }

  function dropFile(folderId: string, fileName: string) {
    setFolders((current) =>
      current.map((folder) =>
        folder.id === folderId
          ? {
              ...folder,
              files: folder.files.filter((file) => file.name !== fileName),
            }
          : folder,
      ),
    )
  }

  async function handleDelete(folderId: string, fileName: string) {
    setDeletingName(fileName)
    try {
      const updated = await fetchApi<DocumentFolder>(
        fileUrl(folderId, fileName),
        { method: 'DELETE', cache: 'no-store' },
      )
      replaceFolder(updated)
      setToast({ message: t('deleted'), variant: 'success' })
      fileList.current?.focus()
    } catch (error) {
      // Someone else deleted it first: the outcome the instructor wanted, so
      // drop the stale row rather than report a failure.
      if (error instanceof FlightRadarApiError && error.statusCode === 404) {
        dropFile(folderId, fileName)
        setToast({
          message: t('deleteGone', { file: fileName }),
          variant: 'info',
        })
        fileList.current?.focus()
        return
      }
      setToast({
        message: apiErrorMessage(error, t('deleteError')),
        variant: 'error',
      })
    } finally {
      setDeletingName(null)
    }
  }

  return (
    <section
      aria-label={t('title')}
      className='overflow-hidden rounded-xl border border-black-200 bg-white'
    >
      <nav
        aria-label={t('breadcrumbLabel')}
        className='border-b border-black-200 px-6 py-4'
      >
        <ol className='flex list-none items-center gap-2 font-secondary text-sm'>
          <li className='flex items-center gap-2'>
            <button
              type='button'
              onClick={() => setOpenFolderId(null)}
              className={`cursor-pointer rounded-sm font-semibold ${openFolder ? 'text-black-200' : 'text-black-300'} ${focusRing}`}
            >
              {t('root')}
            </button>
            <ChevronRight
              size={14}
              className='text-black-100'
              aria-hidden='true'
            />
          </li>
          <li className='flex items-center gap-2'>
            {openFolder ? (
              <button
                type='button'
                onClick={() => setOpenFolderId(null)}
                className={`cursor-pointer rounded-sm font-semibold text-black-200 ${focusRing}`}
              >
                {t('aircraft')}
              </button>
            ) : (
              <span className='font-primary font-bold text-black-300'>
                {t('aircraft')}
              </span>
            )}
            {openFolder && (
              <ChevronRight
                size={14}
                className='text-black-100'
                aria-hidden='true'
              />
            )}
          </li>
          {openFolder && (
            <li
              aria-current='page'
              className='font-primary font-bold text-black-300'
            >
              {openFolder.name}
            </li>
          )}
        </ol>
      </nav>

      {openFolder ? (
        <>
          <ul
            ref={fileList}
            tabIndex={-1}
            aria-label={t('filesLabel', { folder: openFolder.name })}
            className='flex list-none flex-col'
          >
            {openFolder.files.length === 0 ? (
              <li className='px-6 py-6 text-center font-secondary text-sm text-black-200'>
                {t('noFiles')}
              </li>
            ) : (
              openFolder.files.map((file) => (
                <li
                  key={file.name}
                  className='flex items-center border-b border-black-200 last:border-b-0'
                >
                  <a
                    href={apiUrl(fileUrl(openFolder.id, file.name))}
                    download={file.name}
                    aria-label={t('downloadLabel', { file: file.name })}
                    className={`flex min-w-0 flex-1 items-center gap-3.5 px-6 py-3 hover:bg-black-100/20 ${focusRing}`}
                  >
                    <span
                      className={`flex size-8 flex-none items-center justify-center rounded-md ${EXT_COLORS[file.ext] ?? 'bg-black-200'}`}
                    >
                      <span className='font-primary text-[9px] font-bold tracking-wide text-white'>
                        {file.ext}
                      </span>
                    </span>
                    <span className='font-secondary text-sm text-black-300'>
                      {file.name}
                    </span>
                  </a>
                  {instructorId && (
                    <button
                      type='button'
                      onClick={() => handleDelete(openFolder.id, file.name)}
                      disabled={deletingName !== null}
                      aria-label={t('deleteLabel', { file: file.name })}
                      className={`mr-4 flex-none cursor-pointer rounded-sm p-2 text-black-200 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
                    >
                      <Trash2 size={16} aria-hidden='true' />
                    </button>
                  )}
                </li>
              ))
            )}
          </ul>
          {instructorId && (
            <DocumentUpload
              key={openFolder.id}
              folder={openFolder}
              instructorId={instructorId}
              onUploaded={replaceFolder}
            />
          )}
        </>
      ) : folders.length === 0 ? (
        <p className='px-6 py-6 text-center font-secondary text-sm text-black-200'>
          {t('noFolders')}
        </p>
      ) : (
        <ul className='flex list-none flex-col'>
          {folders.map((folder) => (
            <li
              key={folder.id}
              className='border-b border-black-200 last:border-b-0'
            >
              <button
                type='button'
                onClick={() => setOpenFolderId(folder.id)}
                className={`flex w-full cursor-pointer items-center gap-3.5 px-6 py-3.5 text-left hover:bg-black-100/20 ${focusRing}`}
              >
                <span className='flex size-9.5 flex-none items-center justify-center rounded-lg bg-yellow-100'>
                  <Folder
                    size={19}
                    className='text-yellow-300'
                    aria-hidden='true'
                  />
                </span>
                <span className='min-w-0 flex-1'>
                  <span className='block font-primary text-sm font-bold text-black-300'>
                    {folder.name}
                  </span>
                  <span className='mt-0.5 block font-secondary text-xs text-black-200'>
                    {t('fileCount', { count: folder.files.length })}
                  </span>
                </span>
                <ChevronRight
                  size={16}
                  className='flex-none text-black-100'
                  aria-hidden='true'
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Toast
        message={toast?.message ?? ''}
        open={toast !== null}
        onClose={() => setToast(null)}
        variant={toast?.variant ?? 'success'}
        durationMs={toast?.variant === 'error' ? ERROR_TOAST_MS : undefined}
      />
    </section>
  )
}
