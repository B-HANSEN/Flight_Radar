import { pdfToBuffer } from '../common/pdf'
import { MailboxEmail } from './schemas/mailbox-email.schema'

// Generates the dummy PDF bytes served by GET /mailbox/:id/attachment for a
// 'download' action email — the message re-rendered as a one-page document,
// clearly marked as sample data (same convention as the seed's document
// generator, ../seed/document-files.ts).

const DISCLAIMER =
  'SAMPLE DOCUMENT — for demonstration purposes only. Not for operational use.'

export function mailboxAttachmentFileName(email: MailboxEmail): string {
  const slug = email.subject
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `${slug || 'attachment'}.pdf`
}

export function buildMailboxAttachmentPdf(
  email: MailboxEmail,
): Promise<Buffer> {
  return pdfToBuffer((doc) => {
    doc
      .font('Helvetica-Bold')
      .fontSize(16)
      .fillColor('#000')
      .text(email.subject)
    doc.moveDown(0.2)
    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor('#555555')
      .text(`${email.sender} · ${email.dateFull} · ${email.signOff.org}`)
    doc.moveDown(0.5)
    doc
      .font('Helvetica-Oblique')
      .fontSize(8)
      .fillColor('#b91c1c')
      .text(DISCLAIMER)
    doc.moveDown(1)
    doc.fillColor('#000000').font('Helvetica').fontSize(11)

    for (const paragraph of email.body) {
      doc.text(paragraph)
      doc.moveDown(0.6)
    }

    doc.moveDown(0.5)
    doc.font('Helvetica-Bold').fontSize(10).text(email.signOff.name)
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#555555')
      .text(`${email.signOff.role}`)
      .text(`${email.signOff.org}`)
  })
}
