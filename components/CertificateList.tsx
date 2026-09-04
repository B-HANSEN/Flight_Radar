'use client'

import { Archive, Check, Download } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { apiUrl } from '@/lib/api'
import { focusRing } from '@/lib/styles'
import type { Certificate } from './CertificateList.types'

type Props = {
  certificates?: Certificate[]
}

function LabelValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className='mb-0.5 font-secondary text-[11px] tracking-wide text-black-200 uppercase'>
        {label}
      </div>
      <div className='font-secondary text-sm font-semibold text-black-300'>
        {value}
      </div>
    </div>
  )
}

function CertificateRow({ certificate }: { certificate: Certificate }) {
  const t = useTranslations('CertificateList')
  const archived = certificate.status === 'archived'
  const Icon = archived ? Archive : Check

  return (
    <div className='grid grid-cols-[auto_1.4fr_0.8fr_0.8fr_0.8fr_1fr] items-center gap-4 rounded-lg border border-black-100 bg-black-100/10 px-4.5 py-4'>
      <div
        className={`flex size-8 items-center justify-center rounded-full ${
          archived ? 'bg-black-100' : 'bg-green-100'
        }`}
      >
        <Icon
          size={16}
          className={archived ? 'text-black-200' : 'text-green-300'}
          aria-hidden='true'
        />
      </div>

      <div>
        <div className='font-primary text-sm font-bold text-black-300'>
          {certificate.name}
        </div>
        <div className='mt-0.5 font-secondary text-xs text-black-200'>
          {certificate.category}
        </div>
      </div>

      <LabelValue label={t('issued')} value={certificate.issued} />
      <LabelValue label={t('renewed')} value={certificate.renewed ?? '—'} />
      <LabelValue label={t('expiration')} value={certificate.expiration} />

      <div className='flex items-center justify-end gap-2'>
        <a
          href={apiUrl(`/certificates/${certificate.id}/document`)}
          download={`${certificate.name}.pdf`}
          aria-label={t('downloadDocumentLabel', { name: certificate.name })}
          className={`flex-none cursor-pointer rounded-sm p-1 text-black-200 ${focusRing}`}
        >
          <Download size={16} aria-hidden='true' />
        </a>
        {certificate.comment && (
          <span className='font-secondary text-xs text-black-200'>
            {certificate.comment}
          </span>
        )}
      </div>
    </div>
  )
}

function CertificateSection({
  headingId,
  heading,
  emptyLabel,
  certificates,
}: {
  headingId: string
  heading: string
  emptyLabel: string
  certificates: Certificate[]
}) {
  return (
    <section aria-labelledby={headingId}>
      <h2
        id={headingId}
        className='mb-5 font-primary text-lg font-bold text-black-300'
      >
        {heading}
      </h2>

      {certificates.length === 0 ? (
        <p className='rounded-lg border border-dashed border-black-100 px-6 py-6 text-center font-secondary text-sm text-black-200'>
          {emptyLabel}
        </p>
      ) : (
        <div className='overflow-x-auto'>
          <div className='flex min-w-180 flex-col gap-2.5'>
            {certificates.map((certificate) => (
              <CertificateRow key={certificate.id} certificate={certificate} />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

// Ratings (IR, ME, ...) are endorsements on a licence, so they're grouped
// with Licences rather than with Certificates (medical, radiotelephony, FI).
const LICENCE_OR_RATING_CATEGORIES = new Set(['Licences', 'Ratings'])

export default function CertificateList({ certificates = [] }: Props) {
  const t = useTranslations('CertificateList')

  const licencesAndRatings = certificates.filter((cert) =>
    LICENCE_OR_RATING_CATEGORIES.has(cert.category),
  )
  const medical = certificates.filter((cert) => cert.category === 'Medical')
  const other = certificates.filter(
    (cert) =>
      !LICENCE_OR_RATING_CATEGORIES.has(cert.category) &&
      cert.category !== 'Medical',
  )

  return (
    <div className='flex flex-col gap-9'>
      <CertificateSection
        headingId='certificate-list-licences-heading'
        heading={t('licencesAndRatings')}
        emptyLabel={t('noLicencesAndRatings')}
        certificates={licencesAndRatings}
      />
      <CertificateSection
        headingId='certificate-list-medical-heading'
        heading={t('medical')}
        emptyLabel={t('noMedical')}
        certificates={medical}
      />
      <CertificateSection
        headingId='certificate-list-other-heading'
        heading={t('other')}
        emptyLabel={t('noOther')}
        certificates={other}
      />
    </div>
  )
}
