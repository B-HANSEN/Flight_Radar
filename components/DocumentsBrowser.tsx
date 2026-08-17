'use client'

import { useState } from 'react'
import { ChevronRight, Folder } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { focusRing } from '@/lib/styles'
import type { DocumentFolder } from './DocumentsBrowser.types'

type Props = {
  folders?: DocumentFolder[]
}

const EXT_COLORS: Record<string, string> = {
  PDF: 'bg-red-300',
  XLSX: 'bg-green-300',
}

export default function DocumentsBrowser({ folders = [] }: Props) {
  const t = useTranslations('DocumentsBrowser')
  const [openFolderId, setOpenFolderId] = useState<string | null>(null)
  const openFolder =
    folders.find((folder) => folder.id === openFolderId) ?? null

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
        <ul className='flex list-none flex-col'>
          {openFolder.files.length === 0 ? (
            <li className='px-6 py-6 text-center font-secondary text-sm text-black-200'>
              {t('noFiles')}
            </li>
          ) : (
            openFolder.files.map((file) => (
              <li
                key={file.name}
                className='flex cursor-pointer items-center gap-3.5 border-b border-black-200 px-6 py-3 last:border-b-0'
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
              </li>
            ))
          )}
        </ul>
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
    </section>
  )
}
