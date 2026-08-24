import type { Certificate } from './CertificateList.types'

const AESA = 'AESA — Agencia Estatal de Seguridad Aérea'

export const DUMMY_CERTIFICATES: Certificate[] = [
  {
    id: 'cert-1',
    name: 'Private Pilot Licence (PPL)',
    category: 'Licences',
    status: 'current',
    issued: '02/06/2024',
    expiration: '—',
    documentNumber: 'ES.FCL.PPL.00318',
    issuingAuthority: AESA,
    holderName: 'Torres, Jamie',
  },
  {
    id: 'cert-2',
    name: 'Medical certificate class 2',
    category: 'Medical',
    status: 'current',
    issued: '12/03/2025',
    expiration: '12/03/2030',
    documentNumber: 'MED2-2025-04821',
    issuingAuthority: AESA,
    holderName: 'Torres, Jamie',
  },
  {
    id: 'cert-3',
    name: 'Medical certificate class 2',
    category: 'Medical',
    status: 'archived',
    issued: '10/03/2020',
    expiration: '10/03/2025',
    documentNumber: 'MED2-2020-04821',
    issuingAuthority: AESA,
    holderName: 'Torres, Jamie',
  },
  {
    id: 'cert-4',
    name: 'Radiotelephony Certificate',
    category: 'Certificates',
    status: 'current',
    issued: '18/09/2023',
    renewed: '18/09/2025',
    expiration: '18/09/2028',
    documentNumber: 'RTF-2023-00912',
    issuingAuthority: AESA,
    holderName: 'Torres, Jamie',
    comment: 'Spanish',
  },
]
