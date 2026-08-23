'use client'

import { useState } from 'react'
import { fetchApi } from '@/lib/api'
import ProfileCard from './ProfileCard'
import EmergencyContactModal from './EmergencyContactModal'
import ChangePasswordModal from './ChangePasswordModal'
import type { EmergencyContact } from './ProfileCard'

type Props = {
  // The student or instructor this profile belongs to — null only if
  // whoever is currently being previewed couldn't be resolved at all, in
  // which case emergency contact editing is a local-only no-op since
  // there's nothing to scope it to.
  personId: string | null
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
  personId,
  emergencyContact: initialEmergencyContact,
  ...profile
}: Props) {
  const [emergencyContact, setEmergencyContact] = useState(
    initialEmergencyContact,
  )
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isPasswordOpen, setIsPasswordOpen] = useState(false)

  async function handleSave(values: EmergencyContact) {
    if (personId === null) {
      setEmergencyContact(values)
      setIsEditOpen(false)
      return
    }

    const updated = await fetchApi<EmergencyContact>(
      `/emergency-contact?personId=${personId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
        cache: 'no-store',
      },
    )
    setEmergencyContact(updated)
    setIsEditOpen(false)
  }

  async function handleDelete() {
    if (personId === null) {
      setEmergencyContact({ name: '', relation: '', phone: '' })
      setIsEditOpen(false)
      return
    }

    const cleared = await fetchApi<EmergencyContact>(
      `/emergency-contact?personId=${personId}`,
      { method: 'DELETE', cache: 'no-store' },
    )
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
