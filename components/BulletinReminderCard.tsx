'use client'

import { ClipboardCheck, TriangleAlert, Wrench } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

const CHECKLIST_ICONS: LucideIcon[] = [TriangleAlert, Wrench, ClipboardCheck]

export default function BulletinReminderCard() {
  const t = useTranslations('NewsBulletins.reminder')
  const checklist = t.raw('checklist') as string[]
  const howToReport = t.raw('howToReport') as string[]

  return (
    <div className='w-full overflow-hidden rounded-xl border-2 border-blue-300 bg-white'>
      <div className='bg-blue-300 px-6 py-4.5'>
        <h2 className='font-primary text-lg font-extrabold tracking-[0.01em] text-white uppercase'>
          {t('title')}
        </h2>
      </div>

      <div className='px-6 pt-5.5 pb-6.5'>
        <p className='mb-4.5 text-center font-primary text-xs font-bold tracking-[0.01em] text-yellow-300 uppercase'>
          {t('intro')}
        </p>

        <ul className='mb-4.5 flex list-none flex-col gap-4 rounded-[10px] border-2 border-blue-300 px-5 py-4.5'>
          {checklist.map((text, index) => {
            const Icon = CHECKLIST_ICONS[index]
            return (
              <li
                key={text}
                className='grid grid-cols-[auto_1fr] items-start gap-3.5'
              >
                <Icon size={26} className='text-blue-300' aria-hidden='true' />
                <span className='font-primary text-xs font-bold text-blue-300'>
                  {text}
                </span>
              </li>
            )
          })}
        </ul>

        <div className='mb-4.5 rounded-lg bg-yellow-300 px-4.5 py-3.5 text-center'>
          <p className='font-primary text-xs font-bold text-white'>
            {t('callout')}
          </p>
        </div>

        <div className='rounded-lg bg-blue-300 px-5 py-4'>
          <div className='mb-2.5 font-primary text-xs font-bold tracking-[0.03em] text-white uppercase'>
            {t('howToReportTitle')}
          </div>
          <ul className='list-disc space-y-1 pl-4.5 font-primary text-[12.5px] font-semibold text-white'>
            {howToReport.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
