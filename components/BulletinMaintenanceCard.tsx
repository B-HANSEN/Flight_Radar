'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'

const labelBadgeClasses =
  'mb-3 rounded-[20px] bg-blue-300 px-4 py-2.5 text-center'
const labelTextClasses =
  'font-primary text-xs font-bold tracking-[0.02em] text-white uppercase'
const captionClasses =
  'text-center font-primary text-[11px] font-bold tracking-wider text-blue-300 uppercase'
const photoWrapperClasses = 'relative h-45 w-full overflow-hidden rounded-lg'

export default function BulletinMaintenanceCard() {
  const t = useTranslations('NewsBulletins.maintenance')

  return (
    <div className='w-full overflow-hidden rounded-xl border-2 border-blue-300 bg-white'>
      <div className='bg-blue-300 px-6 py-5'>
        <h2 className='font-primary text-xl font-extrabold tracking-[0.01em] text-white uppercase'>
          {t('titlePrefix')}{' '}
          <span className='text-yellow-200'>{t('titleHighlight')}</span>{' '}
          {t('titleSuffix')}
        </h2>
        <div className='mt-1.5 font-primary text-xs font-bold tracking-[0.03em] text-blue-100'>
          {t('aircraftTypes')}
        </div>
      </div>

      <div className='px-6 py-5.5'>
        <div className='grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5'>
          <div>
            <div className={labelBadgeClasses}>
              <div className={labelTextClasses}>{t('labelA')}</div>
            </div>
            <p className='text-center font-primary text-[12.5px] font-semibold text-blue-300'>
              {t('textA')}
            </p>
          </div>
          <div>
            <div className={labelBadgeClasses}>
              <div className={labelTextClasses}>{t('labelB')}</div>
            </div>
            <p className='text-center font-primary text-[12.5px] font-semibold text-blue-300'>
              {t('textB')}
            </p>
          </div>
        </div>

        <div className='mt-5 grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6'>
          <div className='flex flex-col gap-2'>
            <div className={captionClasses}>{t('before')}</div>
            <div className={photoWrapperClasses}>
              <Image
                src='/news/engine-bay-before.png'
                alt={t('photoBeforeAlt')}
                fill
                sizes='(min-width: 768px) 240px, 100vw'
                className='object-cover'
              />
            </div>
          </div>
          <div className='flex flex-col gap-2'>
            <div className={captionClasses}>{t('after')}</div>
            <div className={photoWrapperClasses}>
              <Image
                src='/news/engine-bay-after.png'
                alt={t('photoAfterAlt')}
                fill
                sizes='(min-width: 768px) 240px, 100vw'
                className='object-cover'
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
