import { pdfToBuffer } from '../common/pdf'
import type { Certificate } from './schemas/certificate.schema'

// Renders a certificate's own fields as a small PDF. There is no scanned,
// authority-issued document behind the seed data, so this is a clearly
// marked sample stand-in for "open the certificate document" — same stance
// as the generated files in ../seed/document-files.ts.

const ACADEMY = 'Flight Radar Academy'
const DISCLAIMER =
  'SAMPLE DOCUMENT — generated from demo data for demonstration purposes ' +
  'only. Not a valid licence, rating or certificate.'

function detailRow(doc: PDFKit.PDFDocument, label: string, value: string) {
  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor('#555555')
    .text(label.toUpperCase())
  doc
    .font('Helvetica-Bold')
    .fontSize(11)
    .fillColor('#000000')
    .text(value || '—')
  doc.moveDown(0.6)
}

export function generateCertificatePdf(
  certificate: Certificate,
): Promise<Buffer> {
  return pdfToBuffer((doc) => {
    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor('#555555')
      .text(certificate.issuingAuthority ?? ACADEMY)
    doc.moveDown(0.2)
    doc
      .font('Helvetica-Bold')
      .fontSize(18)
      .fillColor('#000000')
      .text(certificate.name)
    doc.moveDown(0.2)
    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor('#555555')
      .text(certificate.category)
    doc.moveDown(0.4)
    doc
      .font('Helvetica-Oblique')
      .fontSize(8)
      .fillColor('#b91c1c')
      .text(DISCLAIMER)
    doc.moveDown(1)
    doc.fillColor('#000000')

    detailRow(doc, 'Holder', certificate.holderName ?? '—')
    detailRow(doc, 'Document number', certificate.documentNumber ?? '—')
    detailRow(doc, 'Status', certificate.status)
    detailRow(doc, 'Issued', certificate.issued)
    detailRow(doc, 'Renewed', certificate.renewed ?? '—')
    detailRow(doc, 'Expiration', certificate.expiration)
    if (certificate.comment) {
      detailRow(doc, 'Comment', certificate.comment)
    }
  })
}
