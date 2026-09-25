import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import StudentFileUpload, { MAX_FILE_BYTES } from './StudentFileUpload'
import { DUMMY_STUDENT_FILES } from './StudentFileList.data'
import type { StudentFile } from './StudentFileList.types'
import { fetchApi, FlightRadarApiError } from '@/lib/api'
import enMessages from '@/messages/en.json'

vi.mock('@/lib/api', async (importActual) => ({
  ...(await importActual<typeof import('@/lib/api')>()),
  fetchApi: vi.fn(),
}))

const STUDENTS = [
  { id: 'student-1', name: 'Jamie Torres' },
  { id: 'student-2', name: 'Priya Shah' },
]

function renderUpload() {
  return render(
    <NextIntlClientProvider locale='en' messages={enMessages}>
      <StudentFileUpload
        students={STUDENTS}
        instructorId='instructor-1'
        initialFiles={[DUMMY_STUDENT_FILES[0]]}
      />
    </NextIntlClientProvider>,
  )
}

function fillAndSubmit(file: File) {
  fireEvent.change(screen.getByLabelText('Label'), {
    target: { value: '  New licence  ' },
  })
  fireEvent.change(screen.getByLabelText('Category'), {
    target: { value: 'license' },
  })
  fireEvent.change(screen.getByLabelText('Expiry date (optional)'), {
    target: { value: '2028-03-31' },
  })
  fireEvent.change(screen.getByLabelText('File'), {
    target: { files: [file] },
  })
  fireEvent.submit(
    screen.getByRole('button', { name: 'Upload' }).closest('form')!,
  )
}

const PDF = new File(['pdf'], 'licence.pdf', { type: 'application/pdf' })

describe('StudentFileUpload', () => {
  beforeEach(() => {
    vi.mocked(fetchApi).mockReset()
  })

  it('uploads the file with its metadata, then refreshes the list', async () => {
    vi.mocked(fetchApi)
      .mockResolvedValueOnce(DUMMY_STUDENT_FILES[1])
      .mockResolvedValueOnce(DUMMY_STUDENT_FILES.slice(0, 2))
    renderUpload()

    fillAndSubmit(PDF)

    expect(await screen.findByText('Student pilot licence')).toBeInTheDocument()
    expect(screen.getByText('Document uploaded')).toBeInTheDocument()
    const [path, init] = vi.mocked(fetchApi).mock.calls[0]
    expect(path).toBe('/student-files')
    const body = init?.body as FormData
    expect(body.get('file')).toBe(PDF)
    expect(Object.fromEntries([...body].filter(([k]) => k !== 'file'))).toEqual(
      {
        studentId: 'student-1',
        label: 'New licence',
        category: 'license',
        expiresAt: '2028-03-31',
        uploadedBy: 'instructor-1',
      },
    )
    expect(vi.mocked(fetchApi)).toHaveBeenLastCalledWith(
      '/student-files?studentId=student-1',
    )
    expect(screen.getByLabelText('Label')).toHaveValue('')
  })

  it('shows the backend message when the upload is rejected', async () => {
    vi.mocked(fetchApi).mockRejectedValueOnce(
      new FlightRadarApiError('Only PDF and image files can be uploaded', {
        path: '/student-files',
        statusCode: 400,
        serverMessage: 'Only PDF and image files can be uploaded',
      }),
    )
    renderUpload()

    fillAndSubmit(PDF)

    expect(
      await screen.findByText('Only PDF and image files can be uploaded'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Label')).toHaveValue('  New licence  ')
    expect(screen.getByRole('button', { name: 'Upload' })).toBeEnabled()
  })

  it('rejects an oversized file without calling the API', () => {
    const huge = new File(['x'], 'scan.pdf', { type: 'application/pdf' })
    Object.defineProperty(huge, 'size', { value: MAX_FILE_BYTES + 1 })
    renderUpload()

    fillAndSubmit(huge)

    expect(
      screen.getByText('The file is larger than 10 MB.'),
    ).toBeInTheDocument()
    expect(fetchApi).not.toHaveBeenCalled()
  })

  it('disables uploading when there are no students', () => {
    render(
      <NextIntlClientProvider locale='en' messages={enMessages}>
        <StudentFileUpload />
      </NextIntlClientProvider>,
    )

    expect(screen.getByRole('button', { name: 'Upload' })).toBeDisabled()
    expect(
      screen.getByRole('heading', { name: 'Documents from your instructors' }),
    ).toBeInTheDocument()
  })

  it("hides the previous student's files while the new ones load", async () => {
    let resolveLoad: (files: StudentFile[]) => void = () => {}
    vi.mocked(fetchApi).mockImplementationOnce(
      () => new Promise((resolve) => (resolveLoad = resolve)),
    )
    renderUpload()
    expect(screen.getByText('Updated C152 checklist')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Student'), {
      target: { value: 'student-2' },
    })

    expect(screen.getByText('Loading documents…')).toBeInTheDocument()
    expect(screen.queryByText('Updated C152 checklist')).not.toBeInTheDocument()
    resolveLoad([DUMMY_STUDENT_FILES[2]])
    expect(await screen.findByText('Class 2 medical scan')).toBeInTheDocument()
    expect(screen.queryByText('Loading documents…')).not.toBeInTheDocument()
  })

  it("loads the newly picked student's files", async () => {
    vi.mocked(fetchApi).mockResolvedValueOnce([DUMMY_STUDENT_FILES[2]])
    renderUpload()
    expect(
      screen.getByRole('heading', { name: 'Documents for Jamie Torres' }),
    ).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Student'), {
      target: { value: 'student-2' },
    })

    expect(await screen.findByText('Class 2 medical scan')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Documents for Priya Shah' }),
    ).toBeInTheDocument()
    expect(fetchApi).toHaveBeenCalledWith('/student-files?studentId=student-2')
  })

  it('ignores a slow load for a student who is no longer selected', async () => {
    let resolveFirst: (files: StudentFile[]) => void = () => {}
    vi.mocked(fetchApi)
      .mockImplementationOnce(
        () => new Promise((resolve) => (resolveFirst = resolve)),
      )
      .mockResolvedValueOnce([DUMMY_STUDENT_FILES[1]])
    renderUpload()
    const select = screen.getByLabelText('Student')

    fireEvent.change(select, { target: { value: 'student-2' } })
    fireEvent.change(select, { target: { value: 'student-1' } })
    expect(await screen.findByText('Student pilot licence')).toBeInTheDocument()
    resolveFirst([DUMMY_STUDENT_FILES[2]])

    await waitFor(() =>
      expect(
        screen.queryByText('Class 2 medical scan'),
      ).not.toBeInTheDocument(),
    )
    expect(screen.getByText('Student pilot licence')).toBeInTheDocument()
  })

  it('skips the post-upload refresh once another student is picked', async () => {
    let resolveUpload: (file: StudentFile) => void = () => {}
    vi.mocked(fetchApi)
      .mockImplementationOnce(
        () => new Promise((resolve) => (resolveUpload = resolve)),
      )
      .mockResolvedValueOnce([DUMMY_STUDENT_FILES[2]])
    renderUpload()

    fillAndSubmit(PDF)
    fireEvent.change(screen.getByLabelText('Student'), {
      target: { value: 'student-2' },
    })
    expect(await screen.findByText('Class 2 medical scan')).toBeInTheDocument()
    resolveUpload(DUMMY_STUDENT_FILES[1])

    expect(await screen.findByText('Document uploaded')).toBeInTheDocument()
    expect(fetchApi).toHaveBeenCalledTimes(2)
    expect(screen.getByText('Class 2 medical scan')).toBeInTheDocument()
  })

  it('drops a failed load for a student who is no longer selected', async () => {
    let rejectFirst: (error: Error) => void = () => {}
    vi.mocked(fetchApi)
      .mockImplementationOnce(
        () => new Promise((_resolve, reject) => (rejectFirst = reject)),
      )
      .mockResolvedValueOnce([DUMMY_STUDENT_FILES[1]])
    renderUpload()
    const select = screen.getByLabelText('Student')

    fireEvent.change(select, { target: { value: 'student-2' } })
    fireEvent.change(select, { target: { value: 'student-1' } })
    expect(await screen.findByText('Student pilot licence')).toBeInTheDocument()
    rejectFirst(new Error('network down'))

    await waitFor(() => expect(fetchApi).toHaveBeenCalledTimes(2))
    expect(
      screen.queryByText("The student's documents could not be loaded."),
    ).not.toBeInTheDocument()
    expect(screen.getByText('Student pilot licence')).toBeInTheDocument()
  })

  it('clears the list and reports a failed load', async () => {
    vi.mocked(fetchApi).mockRejectedValueOnce(new Error('network down'))
    renderUpload()

    fireEvent.change(screen.getByLabelText('Student'), {
      target: { value: 'student-2' },
    })

    expect(
      await screen.findByText("The student's documents could not be loaded."),
    ).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByText('No documents yet')).toBeInTheDocument(),
    )
  })
})
