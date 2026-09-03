'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { focusRing } from '@/lib/styles'
import type { Instructor, Student } from './RoleSwitcher.types'

type Props = {
  instructors: Instructor[]
  students: Student[]
  selectedStudentId?: string | null
  selectedInstructorId?: string | null
  onSelectStudent?: (student: Student) => void
  onSelectInstructor?: (instructor: Instructor) => void
}

function abbreviateName(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length < 2) return name
  const firstInitial = parts[0].charAt(0).toUpperCase()
  const lastName = parts[parts.length - 1]
  return `${firstInitial}.${lastName}`
}

function menuItemClass(isSelected: boolean) {
  return `flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-semibold text-black-300 ${
    isSelected ? 'bg-black-100' : 'hover:bg-black-100/60'
  } ${focusRing}`
}

function Avatar({
  initials,
  color,
  photoSrc,
}: {
  initials: string
  color?: string
  photoSrc?: string
}) {
  if (photoSrc) {
    return (
      <span
        aria-hidden='true'
        className='relative block size-5.5 flex-none overflow-hidden rounded-full'
      >
        <Image
          src={photoSrc}
          alt=''
          fill
          sizes='22px'
          className='object-cover'
        />
      </span>
    )
  }

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
  instructors,
  students,
  selectedStudentId = null,
  selectedInstructorId = null,
  onSelectStudent,
  onSelectInstructor,
}: Props) {
  const t = useTranslations('RoleSwitcher')
  const [open, setOpen] = useState(false)

  const roleLabel = (instructor: Instructor) =>
    instructor.isChief ? t('chiefInstructor') : t('instructor')
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

  function handleSelectStudent(student: Student) {
    onSelectStudent?.(student)
    setOpen(false)
  }

  function handleSelectInstructor(instructor: Instructor) {
    onSelectInstructor?.(instructor)
    setOpen(false)
  }

  const isInstructorSelected = selectedStudentId == null
  const selectedStudent =
    students.find((student) => student.id === selectedStudentId) ?? null
  const activeInstructor =
    instructors.find((instructor) => instructor.id === selectedInstructorId) ??
    instructors[0] ??
    null
  const triggerLabel = selectedStudent
    ? selectedStudent.name
    : activeInstructor
      ? `${activeInstructor.name} · ${roleLabel(activeInstructor)}`
      : ''
  const triggerAbbreviated = selectedStudent
    ? abbreviateName(selectedStudent.name)
    : activeInstructor
      ? abbreviateName(activeInstructor.name)
      : ''

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
            selectedStudent
              ? selectedStudent.initials
              : (activeInstructor?.initials ?? '')
          }
          color={selectedStudent?.color ?? activeInstructor?.color}
          photoSrc={
            selectedStudent
              ? selectedStudent.photoSrc
              : activeInstructor?.photoSrc
          }
        />
        <span className='text-xs font-bold whitespace-nowrap text-black-300'>
          <span className='md:hidden'>{triggerAbbreviated}</span>
          <span className='hidden md:inline'>{triggerLabel}</span>
        </span>
        <ChevronDown
          size={14}
          className='flex-none text-black-300'
          aria-hidden='true'
        />
      </button>

      {open && (
        <div className='absolute top-full right-0 z-10 mt-2 w-max max-w-[92vw] rounded-lg bg-white p-2 shadow-lg'>
          <div className='px-2 py-1.5 text-[10px] font-bold tracking-wider text-black-200 uppercase'>
            {t('switchView')}
          </div>

          <ul className='list-none'>
            {instructors.map((instructor) => {
              const isSelected =
                isInstructorSelected && instructor.id === activeInstructor?.id
              return (
                <li key={instructor.id}>
                  <button
                    type='button'
                    onClick={() => handleSelectInstructor(instructor)}
                    aria-current={isSelected ? 'true' : undefined}
                    aria-label={`${instructor.name} (${roleLabel(instructor)})`}
                    className={menuItemClass(isSelected)}
                  >
                    <Avatar
                      initials={instructor.initials}
                      color={instructor.color}
                      photoSrc={instructor.photoSrc}
                    />
                    <span className='truncate'>
                      <span className='md:hidden'>
                        {abbreviateName(instructor.name)}
                      </span>
                      <span className='hidden md:inline'>
                        {instructor.name} ({roleLabel(instructor)})
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>

          <ul className='list-none'>
            {students.map((student) => {
              const isSelected = selectedStudentId === student.id
              return (
                <li key={student.id}>
                  <button
                    type='button'
                    onClick={() => handleSelectStudent(student)}
                    aria-current={isSelected ? 'true' : undefined}
                    aria-label={`${student.name} (${t('studentTrack', { track: student.track })})`}
                    className={menuItemClass(isSelected)}
                  >
                    <Avatar
                      initials={student.initials}
                      color={student.color}
                      photoSrc={student.photoSrc}
                    />
                    <span className='truncate'>
                      <span className='md:hidden'>
                        {abbreviateName(student.name)}
                      </span>
                      <span className='hidden md:inline'>
                        {student.name} (
                        {t('studentTrack', { track: student.track })})
                      </span>
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
