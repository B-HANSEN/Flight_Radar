import PDFDocument from 'pdfkit'

// Runs `build` against a fresh pdfkit document and resolves the finished
// bytes as a single Buffer. Shared by the seed's document generator
// (../seed/document-files.ts) and the certificate download endpoint
// (../certificates/certificate-document.ts).
export function pdfToBuffer(
  build: (doc: PDFKit.PDFDocument) => void,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A5' })
    const chunks: Buffer[] = []
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)
    build(doc)
    doc.end()
  })
}
