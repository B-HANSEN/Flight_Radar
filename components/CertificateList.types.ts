export type CertificateStatus = 'current' | 'archived'

export type Certificate = {
  id: string
  name: string
  category: string
  status: CertificateStatus
  issued: string
  renewed?: string
  expiration: string
  comment?: string
  documentNumber?: string
  issuingAuthority?: string
  holderName?: string
}
