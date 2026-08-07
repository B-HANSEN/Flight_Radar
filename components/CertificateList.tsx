'use client'

import { useState } from 'react'
import { Archive, Check, FileText } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { focusRing } from '@/lib/styles'
import CertificateDocumentModal from './CertificateDocumentModal'
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

function CertificateRow({
  certificate,
  archived,
  onViewDocument,
}: {
  certificate: Certificate
  archived?: boolean
  onViewDocument: (certificate: Certificate) => void
}) {
  const t = useTranslations('CertificateList')
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
        <button
          type='button'
          onClick={() => onViewDocument(certificate)}
          aria-label={t('viewDocumentLabel', { name: certificate.name })}
          className={`flex-none cursor-pointer rounded-sm p-1 text-black-200 ${focusRing}`}
        >
          <FileText size={16} aria-hidden='true' />
        </button>
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
  archived,
  onViewDocument,
}: {
  headingId: string
  heading: string
  emptyLabel: string
  certificates: Certificate[]
  archived?: boolean
  onViewDocument: (certificate: Certificate) => void
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
              <CertificateRow
                key={certificate.id}
                certificate={certificate}
                archived={archived}
                onViewDocument={onViewDocument}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

export default function CertificateList({ certificates = [] }: Props) {
  const t = useTranslations('CertificateList')
  const [selectedCertificate, setSelectedCertificate] =
    useState<Certificate | null>(null)
  const current = certificates.filter((cert) => cert.status === 'current')
  const archived = certificates.filter((cert) => cert.status === 'archived')

  return (
    <div className='flex flex-col gap-9'>
      <CertificateSection
        headingId='certificate-list-current-heading'
        heading={t('current')}
        emptyLabel={t('noCurrent')}
        certificates={current}
        onViewDocument={setSelectedCertificate}
      />
      <CertificateSection
        headingId='certificate-list-archived-heading'
        heading={t('archived')}
        emptyLabel={t('noArchived')}
        certificates={archived}
        archived
        onViewDocument={setSelectedCertificate}
      />
      <CertificateDocumentModal
        certificate={selectedCertificate}
        onClose={() => setSelectedCertificate(null)}
      />
    </div>
  )
}
