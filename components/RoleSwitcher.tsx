'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { focusRing } from '@/lib/styles'
import type { Student } from './RoleSwitcher.types'

type CurrentUser = {
  name: string
  initials: string
}

type Props = {
  currentUser: CurrentUser
  students: Student[]
  selectedStudentId?: string | null
  onSelect?: (student: Student | null) => void
}

function menuItemClass(isSelected: boolean) {
  return `flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-semibold text-black-300 ${
    isSelected ? 'bg-black-100' : 'hover:bg-black-100/60'
  } ${focusRing}`
}

function Avatar({ initials, color }: { initials: string; color?: string }) {
  return (
    <span
      aria-hidden='true'
      style={{ backgroundColor: color ?? 'var(--color-blue-300)' }}
      className='flex size-5.5 flex-none items-center justify-center rounded-full text-[10px] font-bold text-white'
    >
      {initials}
    </span>
  )
}

export default function RoleSwitcher({
  currentUser,
  students,
  selectedStudentId = null,
  onSelect,
}: Props) {
  const t = useTranslations('RoleSwitcher')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  function handleSelect(student: Student | null) {
    onSelect?.(student)
    setOpen(false)
  }

  const isInstructorSelected = selectedStudentId == null
  const selectedStudent =
    students.find((student) => student.id === selectedStudentId) ?? null
  const triggerLabel = selectedStudent
    ? selectedStudent.name
    : `${currentUser.name} · ${t('instructor')}`

  return (
    <div ref={containerRef} className='relative'>
      <button
        ref={triggerRef}
        type='button'
        aria-haspopup='true'
        aria-expanded={open}
        aria-label={triggerLabel}
        onClick={() => setOpen((value) => !value)}
        className={`flex items-center gap-2 rounded-full bg-white px-3 py-1.5 ${focusRing}`}
      >
        <Avatar
          initials={
            selectedStudent ? selectedStudent.initials : currentUser.initials
          }
          color={selectedStudent?.color}
        />
        <span className='text-xs font-bold whitespace-nowrap text-black-300'>
          {triggerLabel}
        </span>
        <ChevronDown
          size={14}
          className='flex-none text-black-300'
          aria-hidden='true'
        />
      </button>

      {open && (
        <div className='absolute top-full right-0 z-10 mt-2 w-72 rounded-lg bg-white p-2 shadow-lg'>
          <div className='px-2 py-1.5 text-[10px] font-bold tracking-[0.05em] text-black-200 uppercase'>
            {t('switchView')}
          </div>

          <button
            type='button'
            onClick={() => handleSelect(null)}
            aria-current={isInstructorSelected ? 'true' : undefined}
            className={menuItemClass(isInstructorSelected)}
          >
            <Avatar initials={currentUser.initials} />
            <span className='truncate'>
              {currentUser.name} ({t('instructor')})
            </span>
          </button>

          <ul className='list-none'>
            {students.map((student) => {
              const isSelected = selectedStudentId === student.id
              return (
                <li key={student.id}>
                  <button
                    type='button'
                    onClick={() => handleSelect(student)}
                    aria-current={isSelected ? 'true' : undefined}
                    className={menuItemClass(isSelected)}
                  >
                    <Avatar initials={student.initials} color={student.color} />
                    <span className='truncate'>
                      {student.name} (
                      {t('studentTrack', { track: student.track })})
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
