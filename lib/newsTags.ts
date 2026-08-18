import type { NewsTag } from '@/components/Homepage.types'

export const NEWS_TAG_STYLES: Record<
  NewsTag,
  { accent: string; text: string }
> = {
  operations: { accent: 'bg-blue-200', text: 'text-blue-300' },
  fuel: { accent: 'bg-green-200', text: 'text-green-300' },
  atc: { accent: 'bg-yellow-200', text: 'text-yellow-300' },
}
