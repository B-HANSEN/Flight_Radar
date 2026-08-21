import { fireEvent, render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import CertificateDocumentModal from './CertificateDocumentModal'
import type { Certificate } from './CertificateList.types'
import enMessages from '@/messages/en.json'

const fullCertificate: Certificate = {
  id: 'cert-1',
  name: 'Medical certificate class 2',
  category: 'Certificates',
  status: 'current',
  issued: '12/03/2025',
  renewed: '12/03/2026',
  expiration: '06/03/2027',
  documentNumber: 'MED2-2025-04821',
  issuingAuthority: 'AESA — Agencia Estatal de Seguridad Aérea',
  holderName: 'Torres, Jamie',
}

const minimalCertificate: Certificate = {
  id: 'cert-2',
  name: 'Radiotelephony Certificate',
  category: 'Certificates',
  status: 'current',
  issued: '18/09/2023',
  expiration: '18/09/2028',
}

function renderModal(
  props: Partial<React.ComponentProps<typeof CertificateDocumentModal>> = {},
) {
  const onClose = props.onClose ?? vi.fn()
  render(
    <NextIntlClientProvider locale='en' messages={enMessages}>
      <CertificateDocumentModal
        certificate={fullCertificate}
        onClose={onClose}
        {...props}
      />
    </NextIntlClientProvider>,
  )
  return onClose
}

describe('CertificateDocumentModal', () => {
  it('renders nothing when no certificate is selected', () => {
    renderModal({ certificate: null })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders the full document details for the selected certificate', () => {
    renderModal()

    expect(
      screen.getByRole('heading', { name: 'Certificate document' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Medical certificate class 2' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('AESA — Agencia Estatal de Seguridad Aérea'),
    ).toBeInTheDocument()
    expect(screen.getByText('Torres, Jamie')).toBeInTheDocument()
    expect(screen.getByText('MED2-2025-04821')).toBeInTheDocument()
    expect(screen.getByText('12/03/2025')).toBeInTheDocument()
    expect(screen.getByText('12/03/2026')).toBeInTheDocument()
    expect(screen.getByText('06/03/2027')).toBeInTheDocument()
    expect(
      screen.getByText(/Issued under the applicable EASA/),
    ).toBeInTheDocument()
  })

  it('falls back to a dash for optional fields that are missing', () => {
    renderModal({ certificate: minimalCertificate })

    expect(screen.getAllByText('—').length).toBe(4)
  })

  it('calls onClose when the close button is clicked', () => {
    const onClose = renderModal()
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
