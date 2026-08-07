import { fireEvent, render, screen, within } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import CertificateList from './CertificateList'
import type { Certificate } from './CertificateList.types'
import enMessages from '@/messages/en.json'

const certificates: Certificate[] = [
  {
    id: 'cert-1',
    name: 'Medical certificate class 2',
    category: 'Certificates',
    status: 'current',
    issued: '12/03/2025',
    expiration: '06/03/2027',
  },
  {
    id: 'cert-2',
    name: 'Radiotelephony Certificate',
    category: 'Certificates',
    status: 'current',
    issued: '18/09/2023',
    renewed: '18/09/2025',
    expiration: '18/09/2028',
    comment: 'Awaiting renewal confirmation',
  },
  {
    id: 'cert-3',
    name: 'Old medical certificate',
    category: 'Certificates',
    status: 'archived',
    issued: '10/03/2023',
    expiration: '06/03/2025',
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
  it('groups certificates under current/archived headings and renders their details', () => {
    renderList({ certificates })

    const currentSection = screen
      .getByRole('heading', { name: 'Current certificates' })
      .closest('section') as HTMLElement
    const archivedSection = screen
      .getByRole('heading', { name: 'Archived certificates' })
      .closest('section') as HTMLElement

    expect(
      within(currentSection).getByText('Medical certificate class 2'),
    ).toBeInTheDocument()
    expect(
      within(currentSection).getByText('Radiotelephony Certificate'),
    ).toBeInTheDocument()
    expect(
      within(archivedSection).getByText('Old medical certificate'),
    ).toBeInTheDocument()
    expect(
      within(currentSection).queryByText('Old medical certificate'),
    ).not.toBeInTheDocument()

    expect(within(currentSection).getByText('18/09/2025')).toBeInTheDocument()
    expect(within(currentSection).getAllByText('—').length).toBe(1)

    expect(
      screen.getByText('Awaiting renewal confirmation'),
    ).toBeInTheDocument()
  })

  it('shows empty-state messages for both sections when no certificates are given', () => {
    renderList()

    expect(screen.getByText('No current certificates')).toBeInTheDocument()
    expect(screen.getByText('No archived certificates')).toBeInTheDocument()
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
