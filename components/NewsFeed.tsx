'use client'

import { useTranslations } from 'next-intl'
import { NEWS_TAG_STYLES } from '@/lib/newsTags'
import type { NewsItem } from './Homepage.types'

type Props = {
  news?: NewsItem[]
}

export default function NewsFeed({ news = [] }: Props) {
  const t = useTranslations('Homepage.news')

  return (
    <ul className='flex list-none flex-col gap-8'>
      {news.map((item) => {
        const style = NEWS_TAG_STYLES[item.tag]
        return (
          <li
            key={item.id}
            id={item.id}
            className='flex flex-col overflow-hidden rounded-xl border border-black-100 bg-white'
          >
            <span aria-hidden='true' className={`h-1.5 ${style.accent}`} />
            <div className='flex flex-col gap-3 p-6'>
              <div className='flex items-center justify-between'>
                <span
                  className={`font-primary text-xs font-bold tracking-wide uppercase ${style.text}`}
                >
                  {t(`tags.${item.tag}`)}
                </span>
                <span className='font-secondary text-xs text-black-200'>
                  {item.date}
                </span>
              </div>
              <h2 className='font-primary text-xl font-bold text-black-300'>
                {item.title}
              </h2>
              <p className='font-secondary text-sm font-semibold text-black-300'>
                {item.summary}
              </p>
              <div className='flex flex-col gap-3'>
                {item.body.map((paragraph) => (
                  <p
                    key={paragraph}
                    className='font-secondary text-sm text-black-200'
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
