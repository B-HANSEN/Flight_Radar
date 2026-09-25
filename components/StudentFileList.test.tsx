import { render, screen, within } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import StudentFileList from './StudentFileList'
import { DUMMY_STUDENT_FILES } from './StudentFileList.data'
import enMessages from '@/messages/en.json'

const REFERENCE_DATE = new Date('2026-09-25T12:00:00Z')

function renderList(props: Parameters<typeof StudentFileList>[0] = {}) {
  return render(
    <NextIntlClientProvider locale='en' messages={enMessages}>
      <StudentFileList referenceDate={REFERENCE_DATE} {...props} />
    </NextIntlClientProvider>,
  )
}

describe('StudentFileList', () => {
  it('lists each file with its category, dates and a download link', () => {
    renderList({ files: DUMMY_STUDENT_FILES })

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Documents from your instructors',
      }),
    ).toBeInTheDocument()
    const rows = screen.getAllByRole('listitem')
    expect(rows).toHaveLength(3)

    const checklist = within(rows[0])
    expect(checklist.getByText('Checklist')).toBeInTheDocument()
    expect(checklist.getByText('Sep 20, 2026')).toBeInTheDocument()
    expect(checklist.getByText('—')).toBeInTheDocument()
    expect(
      checklist.getByRole('link', { name: 'Download Updated C152 checklist' }),
    ).toHaveAttribute(
      'href',
      expect.stringMatching(/\/student-files\/file-1\/download$/),
    )

    expect(within(rows[1]).getByText('Mar 31, 2028')).toBeInTheDocument()
  })

  it('flags a file whose expiry date has passed', () => {
    renderList({ files: DUMMY_STUDENT_FILES })

    const medical = screen.getAllByRole('listitem')[2]
    expect(within(medical).getByText('Jun 30, 2026 · Expired')).toHaveClass(
      'text-red-300',
    )
    expect(screen.getAllByText(/Expired/)).toHaveLength(1)
  })

  it('shows a loading status instead of the files while loading', () => {
    renderList({ files: DUMMY_STUDENT_FILES, loading: true })

    expect(screen.getByRole('status')).toHaveTextContent('Loading documents…')
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('shows an empty state under a custom h3 heading', () => {
    renderList({ title: 'Documents for Jamie', headingLevel: 'h3' })

    expect(
      screen.getByRole('heading', { level: 3, name: 'Documents for Jamie' }),
    ).toBeInTheDocument()
    expect(screen.getByText('No documents yet')).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })
})
