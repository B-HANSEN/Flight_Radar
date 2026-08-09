export type DocumentFile = {
  name: string
  ext: string
}

export type DocumentFolder = {
  id: string
  name: string
  files: DocumentFile[]
}
