import { attachmentDisposition, uploadOptions } from './file-transfer'

describe('uploadOptions', () => {
  it('caps the file size and reads filenames as UTF-8', () => {
    expect(uploadOptions(1024)).toEqual({
      limits: { fileSize: 1024 },
      defParamCharset: 'utf8',
    })
  })
})

describe('attachmentDisposition', () => {
  it('quotes a plain ASCII name as is', () => {
    expect(attachmentDisposition('Normal Checklist.pdf')).toBe(
      'attachment; filename="Normal Checklist.pdf"',
    )
  })

  it('adds a UTF-8 filename* with an ASCII fallback for other names', () => {
    expect(attachmentDisposition("Übersicht łódź (v2)'s.pdf")).toBe(
      'attachment; filename="_bersicht __d_ (v2)\'s.pdf"; ' +
        "filename*=UTF-8''%C3%9Cbersicht%20%C5%82%C3%B3d%C5%BA%20%28v2%29%27s.pdf",
    )
  })
})
