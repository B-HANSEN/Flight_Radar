import { RotateCcw, Radar } from 'lucide-react'

type Props = {
  title: string
  body: string
  cta: string
  onRetry: () => void
}

// No 'use client' here (like NotFoundCard): this is a presentational
// component rendered only inside the error/global-error boundaries, which
// are the actual client entries. Adding the directive would make Next's TS
// plugin flag the `onRetry` callback as a non-serializable prop (ts 71007).
export default function ErrorCard({ title, body, cta, onRetry }: Props) {
  return (
    <div className='relative mx-auto w-190 max-w-full overflow-hidden rounded-xl bg-blue-100'>
      <div className='flex flex-col items-center justify-center gap-5.5 px-8 py-8 text-center'>
        <div className='relative isolate flex flex-col items-center'>
          <div aria-hidden='true'>
            <div className='absolute top-7 left-1/2 -z-10 size-80 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-blue-200 opacity-50' />
            <div className='absolute top-7 left-1/2 -z-10 size-58 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-blue-200 opacity-70' />
            <div className='absolute top-7 left-1/2 -z-10 size-36 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-blue-200' />
          </div>

          <div className='flex size-14 items-center justify-center rounded-xl bg-blue-300'>
            <Radar size={30} className='text-yellow-200' aria-hidden='true' />
          </div>
        </div>

        {/* `relative bg-blue-100` (same as the card) so the decorative rings
            behind never bleed under the text — keeps the contrast check from
            going "background could not be determined". */}
        <h1 className='relative mt-5.5 max-w-95 bg-blue-100 font-primary text-[22px] font-bold text-black-300'>
          {title}
        </h1>
        <p className='relative max-w-95 bg-blue-100 font-secondary text-md leading-[1.6] text-black-300'>
          {body}
        </p>

        <button
          type='button'
          onClick={onRetry}
          className='relative mt-1.5 flex items-center gap-2 rounded-lg bg-blue-200 px-6 py-3.25 font-primary text-sm font-semibold text-black-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black-300'
        >
          <RotateCcw size={16} aria-hidden='true' />
          {cta}
        </button>
      </div>
    </div>
  )
}
