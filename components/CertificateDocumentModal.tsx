'use client'

import { useTranslations } from 'next-intl'
import Modal from './Modal'
import type { Certificate } from './CertificateList.types'

type Props = {
  certificate: Certificate | null
  onClose: () => void
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className='font-secondary text-[11px] tracking-wide text-black-200 uppercase'>
        {label}
      </div>
      <div className='mt-0.5 font-secondary text-sm font-semibold text-black-300'>
        {value}
      </div>
    </div>
  )
}

export default function CertificateDocumentModal({
  certificate,
  onClose,
}: Props) {
  const t = useTranslations('CertificateDocumentModal')

  return (
    <Modal
      isOpen={certificate !== null}
      onClose={onClose}
      title={t('title')}
      closeLabel={t('close')}
    >
      {certificate && (
        <div className='flex flex-col gap-5 rounded-lg border border-black-100 bg-black-100/10 p-5'>
          <div>
            <p className='font-secondary text-xs font-semibold tracking-wide text-black-200 uppercase'>
              {certificate.issuingAuthority ?? '—'}
            </p>
            <h3 className='mt-1 font-primary text-lg font-bold text-black-300'>
              {certificate.name}
            </h3>
            <p className='font-secondary text-xs text-black-200'>
              {certificate.category}
            </p>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <DetailField
              label={t('holder')}
              value={certificate.holderName ?? '—'}
            />
            <DetailField
              label={t('documentNumber')}
              value={certificate.documentNumber ?? '—'}
            />
            <DetailField label={t('issued')} value={certificate.issued} />
            <DetailField
              label={t('renewed')}
              value={certificate.renewed ?? '—'}
            />
            <DetailField
              label={t('expiration')}
              value={certificate.expiration}
            />
          </div>

          <p className='border-t border-black-100 pt-4 font-secondary text-xs text-black-200'>
            {t('regulatoryNote')}
          </p>
        </div>
      )}
    </Modal>
  )
}
