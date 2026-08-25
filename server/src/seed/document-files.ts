import PDFDocument from 'pdfkit'
import ExcelJS from 'exceljs'

// Generates the actual dummy PDF/XLSX bytes stored in DocumentFile.data —
// content is invented (not real POH data) and clearly marked as such, since
// this is demo seed data rather than anything meant for operational use.

export type GeneratedDocumentFile = {
  mimeType: string
  data: Buffer
}

export type DocumentKind =
  'weight-balance' | 'checklist' | 'emergency-checklist'

const PDF_MIME = 'application/pdf'
const XLSX_MIME =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

const ISSUED_DATE = '01/08/2026'
const ACADEMY = 'Flight Radar Academy'
const DISCLAIMER =
  'SAMPLE DOCUMENT — for demonstration purposes only. Not for operational use.'

type WeightBalanceRow = { label: string; weightKg: number; armM: number }

// Illustrative, rounded figures per airframe — not real POH weight-and-
// balance data.
const WEIGHT_BALANCE_PROFILES: Record<string, WeightBalanceRow[]> = {
  'Cessna 152': [
    { label: 'Empty aircraft', weightKg: 500, armM: 0.99 },
    { label: 'Pilot & passenger', weightKg: 150, armM: 1.09 },
    { label: 'Fuel (usable)', weightKg: 65, armM: 1.07 },
    { label: 'Baggage', weightKg: 10, armM: 1.85 },
  ],
  'Cessna 172': [
    { label: 'Empty aircraft', weightKg: 743, armM: 1.03 },
    { label: 'Front seats', weightKg: 160, armM: 0.94 },
    { label: 'Rear seats', weightKg: 77, armM: 1.85 },
    { label: 'Fuel (usable)', weightKg: 148, armM: 1.02 },
    { label: 'Baggage', weightKg: 20, armM: 2.41 },
  ],
  'Cessna 182': [
    { label: 'Empty aircraft', weightKg: 862, armM: 0.99 },
    { label: 'Front seats', weightKg: 160, armM: 0.94 },
    { label: 'Rear seats', weightKg: 145, armM: 1.85 },
    { label: 'Fuel (usable)', weightKg: 216, armM: 1.02 },
    { label: 'Baggage', weightKg: 45, armM: 2.41 },
  ],
}

type ChecklistPhase = { heading: string; items: string[] }

const NORMAL_CHECKLIST: ChecklistPhase[] = [
  {
    heading: 'Before start',
    items: [
      'Preflight inspection — complete',
      'Seats, belts, doors — secure',
      'Fuel quantity and quality — checked',
    ],
  },
  {
    heading: 'Start',
    items: ['Mixture — rich', 'Throttle — cracked open', 'Master switch — on'],
  },
  {
    heading: 'Taxi',
    items: ['Brakes — checked', 'Flight instruments — checked'],
  },
  {
    heading: 'Before takeoff',
    items: [
      'Flight controls — free and correct',
      'Trim — set for takeoff',
      'Run-up — complete',
    ],
  },
  {
    heading: 'Climb',
    items: ['Airspeed — Vy', 'Power — set'],
  },
  {
    heading: 'Cruise',
    items: ['Power — set', 'Mixture — leaned as required'],
  },
  {
    heading: 'Before landing',
    items: [
      'Fuel selector — both/fullest tank',
      'Mixture — rich',
      'Flaps — as required',
    ],
  },
  {
    heading: 'After landing / shutdown',
    items: ['Flaps — up', 'Avionics — off', 'Mixture — idle cut-off'],
  },
]

const EMERGENCY_CHECKLIST: ChecklistPhase[] = [
  {
    heading: 'Engine failure in flight',
    items: [
      'Airspeed — best glide',
      'Landing field — select',
      'Restart procedure — attempt if altitude permits',
    ],
  },
  {
    heading: 'In-flight fire',
    items: [
      'Mixture — idle cut-off',
      'Fuel — shut off',
      'Cabin ventilation — as required',
    ],
  },
  {
    heading: 'Electrical failure',
    items: [
      'Alternator — check',
      'Electrical load — reduce to minimum',
      'Landing — plan as soon as practical',
    ],
  },
]

function pdfToBuffer(
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

function drawHeader(
  doc: PDFKit.PDFDocument,
  title: string,
  tail: string,
  type: string,
) {
  doc.font('Helvetica-Bold').fontSize(16).fillColor('#000').text(title)
  doc.moveDown(0.2)
  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor('#555555')
    .text(`${type} · ${tail} · Issued ${ISSUED_DATE} · ${ACADEMY}`)
  doc.moveDown(0.5)
  doc
    .font('Helvetica-Oblique')
    .fontSize(8)
    .fillColor('#b91c1c')
    .text(DISCLAIMER)
  doc.fillColor('#000000')
  doc.moveDown(1)
}

async function buildWeightBalancePdf(
  tail: string,
  type: string,
): Promise<Buffer> {
  const rows =
    WEIGHT_BALANCE_PROFILES[type] ?? WEIGHT_BALANCE_PROFILES['Cessna 152']
  const totalWeight = rows.reduce((sum, row) => sum + row.weightKg, 0)
  const totalMoment = rows.reduce(
    (sum, row) => sum + row.weightKg * row.armM,
    0,
  )

  const columns = ['Item', 'Weight (kg)', 'Arm (m)', 'Moment (kg·m)']
  const colWidths = [190, 70, 60, 90]

  return pdfToBuffer((doc) => {
    drawHeader(doc, 'Weight and Balance', tail, type)

    const startX = doc.x
    let y = doc.y

    doc.font('Helvetica-Bold').fontSize(9)
    let x = startX
    columns.forEach((label, i) => {
      doc.text(label, x, y, { width: colWidths[i] })
      x += colWidths[i]
    })
    y += 16
    doc
      .moveTo(startX, y - 2)
      .lineTo(startX + colWidths.reduce((a, b) => a + b, 0), y - 2)
      .stroke()

    doc.font('Helvetica').fontSize(9)
    for (const row of rows) {
      x = startX
      const moment = row.weightKg * row.armM
      const cells = [
        row.label,
        row.weightKg.toFixed(0),
        row.armM.toFixed(2),
        moment.toFixed(1),
      ]
      cells.forEach((cell, i) => {
        doc.text(cell, x, y, { width: colWidths[i] })
        x += colWidths[i]
      })
      y += 16
    }

    doc.font('Helvetica-Bold')
    x = startX
    const totals = ['Total', totalWeight.toFixed(0), '', totalMoment.toFixed(1)]
    totals.forEach((cell, i) => {
      doc.text(cell, x, y, { width: colWidths[i] })
      x += colWidths[i]
    })
  })
}

async function buildWeightBalanceXlsx(
  tail: string,
  type: string,
): Promise<Buffer> {
  const rows =
    WEIGHT_BALANCE_PROFILES[type] ?? WEIGHT_BALANCE_PROFILES['Cessna 152']

  const workbook = new ExcelJS.Workbook()
  workbook.creator = ACADEMY
  const sheet = workbook.addWorksheet('Weight and Balance')

  sheet.getColumn(1).width = 28
  sheet.getColumn(2).width = 14
  sheet.getColumn(3).width = 12
  sheet.getColumn(4).width = 16

  sheet.addRow(['Weight and Balance'])
  sheet.mergeCells('A1:D1')
  sheet.getRow(1).font = { bold: true, size: 14 }

  sheet.addRow([`${type} · ${tail} · Issued ${ISSUED_DATE} · ${ACADEMY}`])
  sheet.mergeCells('A2:D2')
  sheet.getRow(2).font = { size: 10, color: { argb: 'FF555555' } }

  const headerRow = sheet.addRow([
    'Item',
    'Weight (kg)',
    'Arm (m)',
    'Moment (kg·m)',
  ])
  headerRow.font = { bold: true }
  const firstDataRow = headerRow.number + 1

  rows.forEach((row, index) => {
    const rowNumber = firstDataRow + index
    sheet.addRow([
      row.label,
      row.weightKg,
      row.armM,
      { formula: `B${rowNumber}*C${rowNumber}` },
    ])
  })

  const lastDataRow = firstDataRow + rows.length - 1
  const totalsRow = sheet.addRow([
    'Total',
    { formula: `SUM(B${firstDataRow}:B${lastDataRow})` },
    '',
    { formula: `SUM(D${firstDataRow}:D${lastDataRow})` },
  ])
  totalsRow.font = { bold: true }

  sheet.addRow([])
  const disclaimerRow = sheet.addRow([DISCLAIMER])
  sheet.mergeCells(`A${disclaimerRow.number}:D${disclaimerRow.number}`)
  disclaimerRow.font = { italic: true, size: 8, color: { argb: 'FFB91C1C' } }

  const arrayBuffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(arrayBuffer)
}

async function buildChecklistPdf(
  tail: string,
  type: string,
  variant: 'normal' | 'emergency',
): Promise<Buffer> {
  const phases =
    variant === 'emergency' ? EMERGENCY_CHECKLIST : NORMAL_CHECKLIST
  const title =
    variant === 'emergency' ? 'Emergency Checklist' : 'Normal Checklist'

  return pdfToBuffer((doc) => {
    drawHeader(doc, title, tail, type)

    for (const phase of phases) {
      doc.font('Helvetica-Bold').fontSize(11).text(phase.heading)
      doc.moveDown(0.2)
      doc.font('Helvetica').fontSize(9)
      for (const item of phase.items) {
        doc.text(`❑  ${item}`)
      }
      doc.moveDown(0.6)
    }
  })
}

export async function generateDocumentFile(
  tail: string,
  type: string,
  kind: DocumentKind,
  ext: 'PDF' | 'XLSX',
): Promise<GeneratedDocumentFile> {
  if (kind === 'weight-balance' && ext === 'XLSX') {
    return {
      mimeType: XLSX_MIME,
      data: await buildWeightBalanceXlsx(tail, type),
    }
  }
  if (kind === 'weight-balance') {
    return { mimeType: PDF_MIME, data: await buildWeightBalancePdf(tail, type) }
  }
  return {
    mimeType: PDF_MIME,
    data: await buildChecklistPdf(
      tail,
      type,
      kind === 'emergency-checklist' ? 'emergency' : 'normal',
    ),
  }
}
