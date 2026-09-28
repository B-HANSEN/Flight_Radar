import { fireEvent, render, screen } from '@testing-library/react'
import { fetchApi, FlightRadarApiError } from '@/lib/api'
import { NextIntlClientProvider } from 'next-intl'
import DocumentsBrowser from './DocumentsBrowser'
import type { DocumentFolder } from './DocumentsBrowser.types'
import enMessages from '@/messages/en.json'

vi.mock('@/lib/api', async (importActual) => ({
  ...(await importActual<typeof import('@/lib/api')>()),
  fetchApi: vi.fn(),
}))

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
  beforeEach(() => {
    vi.mocked(fetchApi).mockReset()
  })

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

  it('links each file to its download endpoint', () => {
    renderBrowser()

    fireEvent.click(screen.getByRole('button', { name: /EC-ERV/ }))

    const link = screen.getByRole('link', { name: 'Download Checklist.pdf' })
    expect(link).toHaveAttribute(
      'href',
      expect.stringContaining('/documents/ec-erv/files/Checklist.pdf'),
    )
    expect(link).toHaveAttribute('download', 'Checklist.pdf')
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

  it('offers no upload form outside the instructor view', () => {
    renderBrowser()

    fireEvent.click(screen.getByRole('button', { name: /EC-ERV/ }))

    expect(
      screen.queryByLabelText('Upload a file to EC-ERV'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /^Delete / }),
    ).not.toBeInTheDocument()
  })

  it('lets an instructor upload into the open folder and shows the new file', async () => {
    vi.mocked(fetchApi).mockResolvedValue({
      ...FOLDERS[1],
      files: [{ name: 'New checklist.pdf', ext: 'PDF' }],
    })
    renderBrowser({ instructorId: 'instructor-1' })

    fireEvent.click(screen.getByRole('button', { name: /EC-EXL/ }))
    const input = screen.getByLabelText('Upload a file to EC-EXL')
    fireEvent.change(input, {
      target: {
        files: [
          new File(['pdf'], 'New checklist.pdf', {
            type: 'application/pdf',
          }),
        ],
      },
    })
    fireEvent.submit(input.closest('form')!)

    expect(await screen.findByText('New checklist.pdf')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Aircraft' }))
    expect(screen.getByRole('button', { name: /EC-EXL/ })).toHaveTextContent(
      '1 file',
    )
  })

  it('lets an instructor delete a file and keeps focus in the list', async () => {
    vi.mocked(fetchApi).mockResolvedValue({
      ...FOLDERS[0],
      files: FOLDERS[0].files.slice(1),
    })
    renderBrowser({ instructorId: 'instructor-1' })

    fireEvent.click(screen.getByRole('button', { name: /EC-ERV/ }))
    fireEvent.click(
      screen.getByRole('button', { name: 'Delete Checklist.pdf' }),
    )

    expect(await screen.findByText('File deleted')).toBeInTheDocument()
    expect(screen.queryByText('Checklist.pdf')).not.toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Files in EC-ERV' })).toHaveFocus()
    expect(fetchApi).toHaveBeenCalledWith(
      '/documents/ec-erv/files/Checklist.pdf',
      { method: 'DELETE', cache: 'no-store' },
    )
  })

  it('keeps the file and shows a generic message when a delete fails', async () => {
    vi.mocked(fetchApi).mockRejectedValue(
      new FlightRadarApiError('boom', {
        path: '/documents/ec-erv/files/Checklist.pdf',
        statusCode: 500,
        serverMessage: null,
      }),
    )
    renderBrowser({ instructorId: 'instructor-1' })

    fireEvent.click(screen.getByRole('button', { name: /EC-ERV/ }))
    fireEvent.click(
      screen.getByRole('button', { name: 'Delete Checklist.pdf' }),
    )

    expect(
      await screen.findByText(
        'The file could not be deleted. Please try again.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('Checklist.pdf')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(
      screen.getByRole('button', { name: 'Delete Checklist.pdf' }),
    ).toBeEnabled()
  })

  it('drops a file someone else already deleted and says so', async () => {
    vi.mocked(fetchApi).mockRejectedValue(
      new FlightRadarApiError('gone', {
        path: '/documents/ec-erv/files/Checklist.pdf',
        statusCode: 404,
        serverMessage: 'File Checklist.pdf not found in folder ec-erv',
      }),
    )
    renderBrowser({ instructorId: 'instructor-1' })

    fireEvent.click(screen.getByRole('button', { name: /EC-ERV/ }))
    fireEvent.click(
      screen.getByRole('button', { name: 'Delete Checklist.pdf' }),
    )

    expect(
      await screen.findByText('Checklist.pdf was already deleted.'),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Download Checklist.pdf' }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Files in EC-ERV' })).toHaveFocus()
    expect(screen.getByText('Notes.txt')).toBeInTheDocument()
  })
})
