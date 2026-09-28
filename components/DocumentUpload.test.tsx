import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import DocumentUpload, { MAX_FILE_BYTES } from './DocumentUpload'
import type { DocumentFolder } from './DocumentsBrowser.types'
import { fetchApi, FlightRadarApiError } from '@/lib/api'
import enMessages from '@/messages/en.json'

vi.mock('@/lib/api', async (importActual) => ({
  ...(await importActual<typeof import('@/lib/api')>()),
  fetchApi: vi.fn(),
}))

const FOLDER = { id: 'ec-erv', name: 'EC-ERV' }
const UPDATED: DocumentFolder = {
  ...FOLDER,
  files: [{ name: 'Checklist.pdf', ext: 'PDF' }],
}
const PDF = new File(['pdf'], 'Checklist.pdf', { type: 'application/pdf' })

function apiError(statusCode: number, serverMessage: string | null = null) {
  return new FlightRadarApiError('failed', {
    path: '/documents/ec-erv/files',
    statusCode,
    serverMessage,
  })
}

function renderUpload(onUploaded = vi.fn()) {
  render(
    <NextIntlClientProvider locale='en' messages={enMessages}>
      <DocumentUpload
        folder={FOLDER}
        instructorId='instructor-1'
        onUploaded={onUploaded}
      />
    </NextIntlClientProvider>,
  )
  return onUploaded
}

function fileInput() {
  return screen.getByLabelText('Upload a file to EC-ERV')
}

function submit(file: File) {
  fireEvent.change(fileInput(), { target: { files: [file] } })
  fireEvent.submit(fileInput().closest('form')!)
}

describe('DocumentUpload', () => {
  beforeEach(() => {
    vi.mocked(fetchApi).mockReset()
  })

  it('posts the file with the uploader and hands back the updated folder', async () => {
    vi.mocked(fetchApi).mockResolvedValue(UPDATED)
    const onUploaded = renderUpload()

    submit(PDF)

    expect(await screen.findByText('File uploaded')).toBeInTheDocument()
    expect(onUploaded).toHaveBeenCalledWith(UPDATED)
    const [path, init] = vi.mocked(fetchApi).mock.calls[0]
    expect(path).toBe('/documents/ec-erv/files')
    const body = init?.body as FormData
    expect(body.get('file')).toBe(PDF)
    expect(body.get('uploadedBy')).toBe('instructor-1')

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(screen.queryByText('File uploaded')).not.toBeInTheDocument()
  })

  it('explains an oversized file inline without calling the API', () => {
    renderUpload()
    const big = new File(['x'], 'big.pdf', { type: 'application/pdf' })
    Object.defineProperty(big, 'size', { value: MAX_FILE_BYTES + 1 })

    submit(big)

    expect(screen.getByRole('alert')).toHaveTextContent(
      'big.pdf is larger than 10 MB. Please choose a smaller file.',
    )
    expect(fileInput()).toHaveAttribute('aria-invalid', 'true')
    expect(fileInput()).toHaveAccessibleDescription(
      expect.stringContaining('big.pdf is larger than 10 MB'),
    )
    expect(fetchApi).not.toHaveBeenCalled()
  })

  it('explains an unsupported file type inline without calling the API', () => {
    renderUpload()

    submit(new File(['txt'], 'notes.txt', { type: 'text/plain' }))

    expect(screen.getByRole('alert')).toHaveTextContent(
      "notes.txt can't be uploaded. Only PDF, Excel (XLSX), PNG, JPEG and WebP files are allowed.",
    )
    expect(fetchApi).not.toHaveBeenCalled()
  })

  it('clears the error once another file is picked', () => {
    renderUpload()
    submit(new File(['txt'], 'notes.txt', { type: 'text/plain' }))

    fireEvent.change(fileInput(), { target: { files: [PDF] } })

    expect(screen.getByRole('alert')).toBeEmptyDOMElement()
    expect(fileInput()).toHaveAttribute('aria-invalid', 'false')
  })

  it.each([
    [
      'a name clash',
      apiError(409, 'Checklist.pdf already exists in EC-ERV'),
      'EC-ERV already has a file named Checklist.pdf. Rename it or delete the existing file first.',
    ],
    [
      'a size rejected by the server',
      apiError(413, 'File too large'),
      'Checklist.pdf is larger than 10 MB. Please choose a smaller file.',
    ],
    [
      'any other described rejection',
      apiError(404, 'Folder ec-erv not found'),
      'Folder ec-erv not found',
    ],
    [
      'a failure the server did not describe',
      apiError(500),
      'The file could not be uploaded. Please try again.',
    ],
  ])('explains %s inline', async (_case, error, message) => {
    vi.mocked(fetchApi).mockRejectedValue(error)
    const onUploaded = renderUpload()

    submit(PDF)

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(message),
    )
    expect(onUploaded).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Upload' })).toBeEnabled()
  })

  it('ignores a submit with no file chosen', () => {
    renderUpload()

    fireEvent.submit(fileInput().closest('form')!)

    expect(fetchApi).not.toHaveBeenCalled()
  })
})
