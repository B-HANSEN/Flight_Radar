import { fireEvent, render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import DocumentsBrowser from './DocumentsBrowser'
import type { DocumentFolder } from './DocumentsBrowser.types'
import enMessages from '@/messages/en.json'

const FOLDERS: DocumentFolder[] = [
  {
    id: 'ec-erv',
    name: 'EC-ERV',
    files: [
      { name: 'Checklist.pdf', ext: 'PDF' },
      { name: 'Weight and balance.xlsx', ext: 'XLSX' },
      { name: 'Notes.txt', ext: 'TXT' },
    ],
  },
  {
    id: 'ec-exl',
    name: 'EC-EXL',
    files: [],
  },
]

function renderBrowser(
  props: Partial<React.ComponentProps<typeof DocumentsBrowser>> = {},
) {
  return render(
    <NextIntlClientProvider locale='en' messages={enMessages}>
      <DocumentsBrowser folders={FOLDERS} {...props} />
    </NextIntlClientProvider>,
  )
}

describe('DocumentsBrowser', () => {
  it('renders the root folder list with names and file counts', () => {
    renderBrowser()

    expect(
      screen.getByRole('region', { name: 'Documents' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /EC-ERV/ })).toHaveTextContent(
      '3 files',
    )
    expect(screen.getByRole('button', { name: /EC-EXL/ })).toHaveTextContent(
      '0 files',
    )
  })

  it('shows an empty-state message when there are no folders', () => {
    renderBrowser({ folders: [] })

    expect(screen.getByText('No folders available.')).toBeInTheDocument()
  })

  it('opens a folder to show its breadcrumb and file list with extension badges', () => {
    renderBrowser()

    fireEvent.click(screen.getByRole('button', { name: /EC-ERV/ }))

    expect(screen.getByText('Checklist.pdf')).toBeInTheDocument()
    expect(screen.getByText('Weight and balance.xlsx')).toBeInTheDocument()
    expect(screen.getByText('PDF')).toBeInTheDocument()
    expect(screen.getByText('XLSX')).toBeInTheDocument()
    expect(screen.getByText('TXT')).toBeInTheDocument()
    expect(screen.getByText('EC-ERV')).toHaveAttribute('aria-current', 'page')
  })

  it('shows an empty-state message for a folder with no files', () => {
    renderBrowser()

    fireEvent.click(screen.getByRole('button', { name: /EC-EXL/ }))

    expect(screen.getByText('No files in this folder.')).toBeInTheDocument()
  })

  it('returns to the root list when the Root or Aircraft breadcrumb is clicked', () => {
    renderBrowser()

    fireEvent.click(screen.getByRole('button', { name: /EC-ERV/ }))
    expect(screen.getByText('Checklist.pdf')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Aircraft' }))
    expect(screen.getByRole('button', { name: /EC-ERV/ })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /EC-ERV/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Root' }))
    expect(screen.getByRole('button', { name: /EC-EXL/ })).toBeInTheDocument()
  })
})
