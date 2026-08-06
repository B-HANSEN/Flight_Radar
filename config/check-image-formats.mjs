import { readdirSync, statSync } from 'node:fs'
import { extname, join, relative } from 'node:path'

const PUBLIC_DIR = 'public'
const RASTER_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.bmp',
  '.tiff',
])

function findRasterImages(dir) {
  const offenders = []
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)
    if (statSync(fullPath).isDirectory()) {
      offenders.push(...findRasterImages(fullPath))
    } else if (RASTER_EXTENSIONS.has(extname(entry).toLowerCase())) {
      offenders.push(fullPath)
    }
  }
  return offenders
}

const offenders = findRasterImages(PUBLIC_DIR)

if (offenders.length > 0) {
  console.error(
    `Non-WebP raster image(s) found in ${PUBLIC_DIR}/ — convert to .webp before committing:`,
  )
  for (const file of offenders) {
    console.error(`  ${relative('.', file)}`)
  }
  process.exit(1)
}
