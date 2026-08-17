'use client'

import { Fragment } from 'react'
import { useTranslations } from 'next-intl'

type Row = {
  situation: string
  minimum: string
}

type Table = {
  title: string
  rows: Row[]
}

export default function BulletinReferenceCard() {
  const t = useTranslations('NewsBulletins.reference')
  const tables = t.raw('tables') as Table[]

  return (
    <div className='w-full overflow-hidden rounded-xl border border-black-100 bg-white'>
      <div className='bg-blue-300 px-6 py-4.5'>
        <h2 className='font-primary text-xl font-extrabold tracking-[0.01em] text-white uppercase'>
          {t('title')}
        </h2>
      </div>

      <div className='flex flex-col gap-5.5 px-6 py-5.5'>
        <p className='font-secondary text-xs text-black-200'>{t('intro')}</p>

        {tables.map((table) => (
          <div
            key={table.title}
            className='overflow-hidden rounded-lg border border-black-200'
          >
            <div className='bg-blue-100 px-3.5 py-2.5 font-primary text-xs font-bold text-blue-300 uppercase'>
              {table.title}
            </div>
            <div className='grid grid-cols-[minmax(180px,1.1fr)_minmax(200px,1fr)]'>
              <div className='border-r border-b border-black-200 bg-[#f0f4f1] px-3 py-2.5 font-primary text-[11.5px] font-bold text-black-300'>
                {t('situationHeader')}
              </div>
              <div className='border-b border-black-200 bg-[#f0f4f1] px-3 py-2.5 font-primary text-[11.5px] font-bold text-black-300'>
                {t('minimumHeader')}
              </div>
              {table.rows.map((row) => (
                <Fragment key={row.situation}>
                  <div className='border-r border-b border-black-200/60 px-3 py-2.5 font-secondary text-xs font-semibold text-black-300'>
                    {row.situation}
                  </div>
                  <div className='border-b border-black-200/60 px-3 py-2.5 font-secondary text-xs text-black-200'>
                    {row.minimum}
                  </div>
                </Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div
        aria-hidden='true'
        className='relative h-14 overflow-hidden bg-blue-100'
      >
        <div className='absolute bottom-0 left-[5%] size-0 border-x-34 border-b-38 border-x-transparent border-b-blue-200' />
        <div className='absolute bottom-0 left-[22%] size-0 border-x-26 border-b-26 border-x-transparent border-b-blue-300' />
        <div className='absolute bottom-0 left-[48%] size-0 border-x-44 border-b-46 border-x-transparent border-b-blue-200' />
        <div className='absolute bottom-0 left-[72%] size-0 border-x-30 border-b-30 border-x-transparent border-b-blue-300' />
      </div>
    </div>
  )
}
