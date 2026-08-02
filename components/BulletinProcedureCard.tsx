'use client'

import Image from 'next/image'
import { TriangleAlert } from 'lucide-react'
import { useTranslations } from 'next-intl'

type Step = {
  title: string
  detail: string
}

export default function BulletinProcedureCard() {
  const t = useTranslations('NewsBulletins.procedure')
  const steps = t.raw('steps') as Step[]
  const consequences = t.raw('consequences') as string[]

  return (
    <div className='w-full'>
      <div className='mb-3.5'>
        <h2 className='mb-1 font-primary text-base font-bold text-black-300'>
          {t('title')}
        </h2>
        <div className='mb-2 font-secondary text-xs text-black-200'>
          {t('postedDate')}
        </div>
        <p className='font-secondary text-sm text-black-200'>{t('summary')}</p>
      </div>

      <div className='overflow-hidden rounded-xl border border-black-100'>
        <div className='bg-blue-300 px-6 py-4.5'>
          <div className='font-primary text-[22px] font-extrabold tracking-[0.01em] text-white uppercase'>
            {t('cardTitle')}
          </div>
        </div>

        <div className='grid grid-cols-1 gap-5.5 bg-white p-5.5 md:grid-cols-[minmax(260px,1.3fr)_minmax(220px,1fr)]'>
          <ol className='flex list-none flex-col gap-3.5'>
            {steps.map((step, index) => (
              <li
                key={step.title}
                className='grid grid-cols-[36px_1fr] items-start gap-3'
              >
                <div className='flex size-9 items-center justify-center rounded-full bg-blue-300 font-primary text-[15px] font-bold text-white'>
                  {index + 1}
                </div>
                <div>
                  <div className='mb-1 font-primary text-xs font-bold tracking-[0.01em] text-blue-300 uppercase'>
                    {step.title}
                  </div>
                  <div className='font-secondary text-[12.5px] text-black-200'>
                    {step.detail}
                  </div>
                </div>
              </li>
            ))}
          </ol>

          <div className='flex flex-col gap-3.5'>
            <div className='relative h-50 w-full overflow-hidden rounded-lg'>
              <Image
                src='/news/instrument-panel.png'
                alt={t('photoAlt')}
                fill
                sizes='(min-width: 768px) 220px, 100vw'
                className='object-cover object-bottom'
              />
            </div>

            <div className='flex items-start gap-2 rounded-lg bg-yellow-100 px-3.5 py-3'>
              <TriangleAlert
                size={18}
                className='flex-none text-yellow-300'
                aria-hidden='true'
              />
              <p className='font-primary text-xs font-bold tracking-[0.01em] text-yellow-300 uppercase'>
                {t('warning')}
              </p>
            </div>

            <div className='rounded-lg bg-blue-300 px-4 py-3.5'>
              <div className='mb-2 font-primary text-xs font-bold tracking-[0.02em] text-white uppercase'>
                {t('consequencesTitle')}
              </div>
              <ul className='list-disc space-y-1 pl-4 font-primary text-[11.5px] font-semibold text-white'>
                {consequences.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
