import { fireEvent, render, screen, within } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import CertificateList from './CertificateList'
import type { Certificate } from './CertificateList.types'
import enMessages from '@/messages/en.json'

const certificates: Certificate[] = [
  {
    id: 'cert-1',
    name: 'Private Pilot Licence (PPL)',
    category: 'Licences',
    status: 'current',
    issued: '02/06/2024',
    expiration: '—',
  },
  {
    id: 'cert-2',
    name: 'Medical certificate class 2',
    category: 'Medical',
    status: 'current',
    issued: '12/03/2025',
    expiration: '12/03/2030',
  },
  {
    id: 'cert-3',
    name: 'Old medical certificate',
    category: 'Medical',
    status: 'archived',
    issued: '10/03/2020',
    expiration: '10/03/2025',
  },
  {
    id: 'cert-4',
    name: 'Radiotelephony Certificate',
    category: 'Certificates',
    status: 'current',
    issued: '18/09/2023',
    renewed: '18/09/2025',
    expiration: '18/09/2028',
    comment: 'Awaiting renewal confirmation',
  },
]

function renderList(
  props: Partial<React.ComponentProps<typeof CertificateList>> = {},
) {
  return render(
    <NextIntlClientProvider locale='en' messages={enMessages}>
      <CertificateList {...props} />
    </NextIntlClientProvider>,
  )
}

describe('CertificateList', () => {
  it('groups certificates under licences/medical/other headings and renders their details', () => {
    renderList({ certificates })

    const licencesSection = screen
      .getByRole('heading', { name: 'Licences & ratings' })
      .closest('section') as HTMLElement
    const medicalSection = screen
      .getByRole('heading', { name: 'Medical certificates' })
      .closest('section') as HTMLElement
    const otherSection = screen
      .getByRole('heading', { name: 'Other certificates' })
      .closest('section') as HTMLElement

    expect(
      within(licencesSection).getByText('Private Pilot Licence (PPL)'),
    ).toBeInTheDocument()
    expect(
      within(medicalSection).getByText('Medical certificate class 2'),
    ).toBeInTheDocument()
    expect(
      within(medicalSection).getByText('Old medical certificate'),
    ).toBeInTheDocument()
    expect(
      within(otherSection).getByText('Radiotelephony Certificate'),
    ).toBeInTheDocument()

    expect(within(otherSection).getByText('18/09/2025')).toBeInTheDocument()
    // Renewed + expiration both fall back to '—' for the PPL row.
    expect(within(licencesSection).getAllByText('—').length).toBe(2)

    expect(
      screen.getByText('Awaiting renewal confirmation'),
    ).toBeInTheDocument()
  })

  it('shows empty-state messages for all sections when no certificates are given', () => {
    renderList()

    expect(screen.getByText('No licences or ratings')).toBeInTheDocument()
    expect(screen.getByText('No medical certificates')).toBeInTheDocument()
    expect(screen.getByText('No other certificates')).toBeInTheDocument()
    expect(
      screen.queryByText('Awaiting renewal confirmation'),
    ).not.toBeInTheDocument()
  })

  it('opens the document modal for the clicked row and closes it again', () => {
    renderList({ certificates })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', {
        name: 'View document for Medical certificate class 2',
      }),
    )

    const dialog = screen.getByRole('dialog')
    expect(
      within(dialog).getByRole('heading', {
        name: 'Medical certificate class 2',
      }),
    ).toBeInTheDocument()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
