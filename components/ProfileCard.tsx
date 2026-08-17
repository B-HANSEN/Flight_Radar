'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import {
  Cake,
  HeartHandshake,
  Info,
  Lock,
  LockOpen,
  Mail,
  Pencil,
  Phone,
  User,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { focusRing } from '@/lib/styles'

export type EmergencyContact = {
  name: string
  relation: string
  phone: string
}

type Props = {
  name: string
  avatarSrc?: string
  email: string
  phone: string
  birthday: string
  info: string
  role: string
  emergencyContact: EmergencyContact
  onEdit?: () => void
  onLock?: () => void
  isPasswordModalOpen?: boolean
}

type Tab = 'information' | 'emergency'

type Row = {
  icon: LucideIcon
  label: string
  value: string
}

function FieldRow({
  icon: Icon,
  label,
  value,
  iconClassName,
}: Row & { iconClassName: string }) {
  return (
    <div className='grid grid-cols-[22px_1fr] items-center gap-3 border-b border-black-100 py-1.25'>
      <Icon size={16} className={iconClassName} aria-hidden='true' />
      <span className='font-secondary text-xs text-black-300'>
        <span className='sr-only'>{label}: </span>
        {value}
      </span>
    </div>
  )
}

export default function ProfileCard({
  name,
  avatarSrc,
  email,
  phone,
  birthday,
  info,
  role,
  emergencyContact,
  onEdit,
  onLock,
  isPasswordModalOpen = false,
}: Props) {
  const t = useTranslations('MePage.profileCard')
  const [activeTab, setActiveTab] = useState<Tab>('information')
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const infoRows: Row[] = [
    { icon: Mail, label: t('fields.email'), value: email },
    { icon: Phone, label: t('fields.phone'), value: phone },
    { icon: Cake, label: t('fields.birthday'), value: birthday },
    { icon: Info, label: t('fields.info'), value: info },
    { icon: User, label: t('fields.role'), value: role },
  ]

  const emergencyRows: Row[] = [
    {
      icon: User,
      label: t('emergencyFields.name'),
      value: emergencyContact.name,
    },
    {
      icon: HeartHandshake,
      label: t('emergencyFields.relation'),
      value: emergencyContact.relation,
    },
    {
      icon: Phone,
      label: t('emergencyFields.phone'),
      value: emergencyContact.phone,
    },
  ]

  const tabs: { key: Tab; label: string }[] = [
    { key: 'information', label: t('tabs.information') },
    { key: 'emergency', label: t('tabs.emergency') },
  ]

  const tabContent: Record<Tab, { rows: Row[]; iconClassName: string }> = {
    information: { rows: infoRows, iconClassName: 'text-blue-200' },
    emergency: { rows: emergencyRows, iconClassName: 'text-red-200' },
  }
  const { rows, iconClassName } = tabContent[activeTab]

  function focusTab(index: number) {
    const wrappedIndex = (index + tabs.length) % tabs.length
    setActiveTab(tabs[wrappedIndex].key)
    tabRefs.current[wrappedIndex]?.focus()
  }

  function handleTabKeyDown(
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      focusTab(index + 1)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      focusTab(index - 1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      focusTab(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      focusTab(tabs.length - 1)
    }
  }

  return (
    <section className='max-w-lg overflow-hidden rounded-xl border border-black-100 bg-white'>
      <div className='flex items-center justify-between border-b border-black-100 px-7 pt-6 pb-5'>
        <h2 className='font-primary text-[26px] font-bold text-black-300'>
          {name}
        </h2>
        <div className='flex gap-3.5 text-black-200'>
          <button
            type='button'
            onClick={onEdit}
            aria-label={t('editLabel')}
            className={`rounded-sm p-1.5 ${focusRing}`}
          >
            <Pencil size={18} aria-hidden='true' />
          </button>
          <button
            type='button'
            onClick={onLock}
            aria-label={t('lockLabel')}
            className={`rounded-sm p-1.5 ${focusRing}`}
          >
            {isPasswordModalOpen ? (
              <LockOpen size={18} aria-hidden='true' />
            ) : (
              <Lock size={18} aria-hidden='true' />
            )}
          </button>
        </div>
      </div>

      <div className='flex items-start gap-5 px-7 py-6'>
        <div
          className='relative size-50 flex-none overflow-hidden rounded-full bg-black-100'
          role={avatarSrc ? undefined : 'img'}
          aria-label={avatarSrc ? undefined : t('avatarAlt')}
        >
          {avatarSrc ? (
            <Image
              src={avatarSrc}
              alt={t('avatarAlt')}
              fill
              sizes='200px'
              className='object-cover'
            />
          ) : (
            <div className='flex size-full items-center justify-center'>
              <UserRound
                size={72}
                className='text-black-200'
                aria-hidden='true'
              />
            </div>
          )}
        </div>

        <div className='flex flex-1 flex-col gap-4'>
          <div
            role='tablist'
            aria-label={t('tabsLabel')}
            className='flex gap-1.5'
          >
            {tabs.map((tab, index) => {
              const isActive = tab.key === activeTab
              return (
                <button
                  key={tab.key}
                  ref={(el) => {
                    tabRefs.current[index] = el
                  }}
                  type='button'
                  role='tab'
                  id={`profile-tab-${tab.key}`}
                  tabIndex={isActive ? 0 : -1}
                  aria-selected={isActive}
                  aria-controls={
                    isActive ? `profile-panel-${tab.key}` : undefined
                  }
                  onClick={() => setActiveTab(tab.key)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                  className={`rounded-lg px-4.5 py-2.25 font-primary text-xs font-semibold ${focusRing} ${
                    isActive ? 'bg-blue-100 text-blue-300' : 'text-black-200'
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          <div
            id={`profile-panel-${activeTab}`}
            role='tabpanel'
            aria-labelledby={`profile-tab-${activeTab}`}
            className='flex flex-col'
          >
            {rows.map((row) => (
              <FieldRow
                key={row.label}
                {...row}
                iconClassName={iconClassName}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
