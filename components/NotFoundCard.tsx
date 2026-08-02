import { Home, Radar } from 'lucide-react'
import { Link } from '@/i18n/navigation'

type Props = {
  title: string
  body: string
  cta: string
}

export default function NotFoundCard({ title, body, cta }: Props) {
  return (
    <div className='relative mx-auto w-190 overflow-hidden rounded-xl bg-blue-100'>
      <div aria-hidden='true'>
        <div className='absolute bottom-0 left-1/2 size-225 -translate-x-1/2 translate-y-1/2 rounded-full border-2 border-blue-200 opacity-50' />
        <div className='absolute bottom-0 left-1/2 size-162.5 -translate-x-1/2 translate-y-1/2 rounded-full border-2 border-blue-200 opacity-70' />
        <div className='absolute bottom-0 left-1/2 size-100 -translate-x-1/2 translate-y-1/2 rounded-full border-2 border-blue-200' />
      </div>

      <div className='relative flex flex-col items-center justify-center gap-5.5 px-8 py-8 text-center'>
        <div className='flex size-14 items-center justify-center rounded-xl bg-blue-300'>
          <Radar size={30} className='text-yellow-200' aria-hidden='true' />
        </div>

        <div className='font-primary text-[88px] font-bold tracking-tight text-blue-300'>
          404
        </div>

        <h1 className='font-primary max-w-95 text-[22px] font-bold text-black-300'>
          {title}
        </h1>
        <p className='font-secondary max-w-95 text-md leading-[1.6] text-black-300'>
          {body}
        </p>

        <Link
          href='/'
          className='font-primary mt-1.5 flex items-center gap-2 rounded-lg bg-blue-200 px-6 py-3.25 text-sm font-semibold text-black-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black-300'
        >
          <Home size={16} aria-hidden='true' />
          {cta}
        </Link>
      </div>
    </div>
  )
}
