type PageHeadingProps = {
  title: string
  description?: string
}

export default function PageHeading({ title, description }: PageHeadingProps) {
  return (
    <header className='mb-6'>
      <h1 className='text-3xl font-bold text-slate-900'>{title}</h1>
      {description && <p className='mt-2 text-slate-600'>{description}</p>}
    </header>
  )
}
