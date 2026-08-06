'use client'

import { useId, useMemo, useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { focusRing } from '@/lib/styles'
import type { Aircraft } from './AircraftDirectory.types'

type Props = {
  aircraft?: Aircraft[]
  pageSize?: number
}

const FALLBACK_PHOTO_SRC = '/aircraft/aircraft-placeholder.webp'

export default function AircraftDirectory({
  aircraft = [],
  pageSize = 10,
}: Props) {
  const t = useTranslations('AircraftDirectory')
  const searchId = useId()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return aircraft
    return aircraft.filter(
      (ac) =>
        ac.arcid.toLowerCase().includes(query) ||
        ac.type.toLowerCase().includes(query),
    )
  }, [aircraft, search])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const visible = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )

  function handleSearchChange(value: string) {
    setSearch(value)
    setPage(1)
  }

  return (
    <section
      aria-label={t('title')}
      className='overflow-hidden rounded-xl border border-black-100 bg-white'
    >
      <div className='flex flex-wrap items-center justify-between gap-4 border-b border-black-100 px-5 py-4'>
        <div className='flex max-w-90 flex-1 items-center gap-2.5 rounded-lg border border-black-100 px-3 py-2.25'>
          <Search
            size={16}
            className='flex-none text-black-200'
            aria-hidden='true'
          />
          <label htmlFor={searchId} className='sr-only'>
            {t('searchLabel')}
          </label>
          <input
            id={searchId}
            type='search'
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder={t('searchPlaceholder')}
            className={`w-full rounded-sm border-none font-secondary text-sm text-black-300 ${focusRing}`}
          />
        </div>

        <p
          aria-live='polite'
          className='font-secondary text-sm whitespace-nowrap text-black-200'
        >
          {t('resultCount', { count: filtered.length })}
        </p>
      </div>

      {visible.length === 0 ? (
        <p className='px-5 py-12 text-center font-secondary text-sm text-black-200'>
          {t('noResults')}
        </p>
      ) : (
        <div className='grid grid-cols-2 gap-5 p-5 sm:grid-cols-3 lg:grid-cols-5'>
          {visible.map((ac, index) => (
            <div
              key={ac.id}
              className='flex flex-col overflow-hidden rounded-lg border border-black-100'
            >
              <div className='relative aspect-4/3 w-full flex-none bg-black-100/40'>
                <Image
                  src={ac.photoSrc ?? FALLBACK_PHOTO_SRC}
                  alt={
                    ac.photoSrc
                      ? t('photoAlt', { type: ac.type, arcid: ac.arcid })
                      : ''
                  }
                  fill
                  priority={index < 5}
                  sizes='(min-width: 1024px) 216px, (min-width: 640px) 33vw, 50vw'
                  className={
                    ac.photoSrc ? 'object-cover' : 'object-contain p-6'
                  }
                />
              </div>
              <div className='min-w-0 px-3 py-2.5'>
                <div className='truncate font-primary text-[15px] font-bold text-black-300'>
                  {ac.arcid}
                </div>
                <div className='truncate font-secondary text-xs text-black-200'>
                  {ac.type}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <nav
        aria-label={t('paginationLabel')}
        className='flex items-center justify-center gap-1.5 border-t border-black-100 p-5'
      >
        <button
          type='button'
          onClick={() => setPage((current) => Math.max(1, current - 1))}
          disabled={currentPage <= 1}
          aria-label={t('previousPage')}
          className={`rounded-sm p-1 text-black-300 disabled:opacity-30 ${focusRing}`}
        >
          <ChevronLeft size={16} aria-hidden='true' />
        </button>

        {Array.from({ length: pageCount }, (_, index) => index + 1).map(
          (number) => {
            const isActive = number === currentPage
            return (
              <button
                key={number}
                type='button'
                onClick={() => setPage(number)}
                aria-label={t('page', { number })}
                aria-current={isActive ? 'page' : undefined}
                className={`flex size-7 items-center justify-center rounded-md font-primary text-xs font-semibold ${focusRing} ${
                  isActive
                    ? 'bg-blue-300 text-white'
                    : 'text-black-300 hover:bg-black-100/60'
                }`}
              >
                {number}
              </button>
            )
          },
        )}

        <button
          type='button'
          onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
          disabled={currentPage >= pageCount}
          aria-label={t('nextPage')}
          className={`rounded-sm p-1 text-black-300 disabled:opacity-30 ${focusRing}`}
        >
          <ChevronRight size={16} aria-hidden='true' />
        </button>
      </nav>
    </section>
  )
}
