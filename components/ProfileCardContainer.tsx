'use client'

import { useState } from 'react'
import { fetchApi } from '@/lib/api'
import ProfileCard from './ProfileCard'
import EmergencyContactModal from './EmergencyContactModal'
import ChangePasswordModal from './ChangePasswordModal'
import type { EmergencyContact } from './ProfileCard'

type Props = {
  name: string
  avatarSrc?: string
  email: string
  phone: string
  birthday: string
  info: string
  role: string
  emergencyContact: EmergencyContact
}

export default function ProfileCardContainer({
  emergencyContact: initialEmergencyContact,
  ...profile
}: Props) {
  const [emergencyContact, setEmergencyContact] = useState(
    initialEmergencyContact,
  )
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isPasswordOpen, setIsPasswordOpen] = useState(false)

  async function handleSave(values: EmergencyContact) {
    const updated = await fetchApi<EmergencyContact>('/emergency-contact', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
      cache: 'no-store',
    })
    setEmergencyContact(updated)
    setIsEditOpen(false)
  }

  async function handleDelete() {
    const cleared = await fetchApi<EmergencyContact>('/emergency-contact', {
      method: 'DELETE',
      cache: 'no-store',
    })
    setEmergencyContact(cleared)
    setIsEditOpen(false)
  }

  return (
    <>
      <ProfileCard
        {...profile}
        emergencyContact={emergencyContact}
        onEdit={() => setIsEditOpen(true)}
        onLock={() => setIsPasswordOpen(true)}
        isPasswordModalOpen={isPasswordOpen}
      />
      {/* key forces a remount on every open so the form starts from the
          latest emergencyContact instead of a stale edit left over from a
          cancelled previous open */}
      <EmergencyContactModal
        key={isEditOpen ? 'edit-open' : 'edit-closed'}
        isOpen={isEditOpen}
        emergencyContact={emergencyContact}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
      <ChangePasswordModal
        isOpen={isPasswordOpen}
        onClose={() => setIsPasswordOpen(false)}
      />
    </>
  )
}
