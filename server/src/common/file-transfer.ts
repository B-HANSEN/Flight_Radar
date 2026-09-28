import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface'

// Multer reads a part's filename as latin1 unless told otherwise, which
// turns an upload named "Übersicht.pdf" into "Ãbersicht.pdf". Browsers send
// it as UTF-8.
export function uploadOptions(maxFileBytes: number): MulterOptions {
  return { limits: { fileSize: maxFileBytes }, defParamCharset: 'utf8' }
}

// RFC 5987 percent-encoding: encodeURIComponent leaves these unescaped.
function encodeRfc5987(value: string): string {
  return encodeURIComponent(value).replace(
    /['()*]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  )
}

// Node rejects a header holding characters outside latin1 (e.g. "ł"), so a
// non-ASCII name goes in `filename*` (RFC 6266), with an ASCII `filename`
// fallback for clients that ignore it. Assumes a name without quotes or
// line breaks, as safeFileName guarantees.
export function attachmentDisposition(fileName: string): string {
  if (/^[\x20-\x7e]*$/.test(fileName)) {
    return `attachment; filename="${fileName}"`
  }
  const fallback = fileName.replace(/[^\x20-\x7e]/g, '_')
  return `attachment; filename="${fallback}"; filename*=UTF-8''${encodeRfc5987(fileName)}`
}
