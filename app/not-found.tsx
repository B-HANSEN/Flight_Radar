import Link from 'next/link'
import './globals.css'

export default function NotFound() {
  return (
    <html lang='en'>
      <body className='flex min-h-screen items-center justify-center bg-white text-slate-900 antialiased'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold'>Page not found</h1>
          <p className='mt-2 text-slate-600'>
            We couldn&apos;t find the page you were looking for.
          </p>
          <Link href='/en' className='mt-4 inline-block underline'>
            Back to homepage
          </Link>
        </div>
      </body>
    </html>
  )
}
