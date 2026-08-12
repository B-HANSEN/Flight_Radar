import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useArgs } from 'storybook/preview-api'
import CertificateDocumentModal from './CertificateDocumentModal'
import type { Certificate } from './CertificateList.types'

const SAMPLE_CERTIFICATE: Certificate = {
  id: 'cert-1',
  name: 'Medical certificate class 2',
  category: 'Certificates',
  status: 'current',
  issued: '12/03/2025',
  expiration: '06/03/2027',
  documentNumber: 'MED2-2025-04821',
  issuingAuthority: 'AESA — Agencia Estatal de Seguridad Aérea',
  holderName: 'Doe, John',
}

const meta: Meta<typeof CertificateDocumentModal> = {
  component: CertificateDocumentModal,
  title: 'Components/Modals/CertificateDocumentModal',
  args: {
    certificate: SAMPLE_CERTIFICATE,
  },
}
export default meta

export const Default: StoryObj<typeof CertificateDocumentModal> = {
  render: (args) => {
    const [, updateArgs] = useArgs()
    return (
      <CertificateDocumentModal
        {...args}
        onClose={() => updateArgs({ certificate: null })}
      />
    )
  },
}
