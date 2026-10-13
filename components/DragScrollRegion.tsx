'use client'

import type { AriaRole, ReactNode } from 'react'
import { focusRingInset } from '@/lib/styles'
import { useDragScroll } from '@/lib/useDragScroll'

type Props = {
  axis?: 'x' | 'y'
  className?: string
  role?: AriaRole
  'aria-label'?: string
  'aria-labelledby'?: string
  children: ReactNode
}

// Client leaf for a mouse-drag-scrollable region, so the content inside it
// can stay server-rendered.
export default function DragScrollRegion({
  axis = 'x',
  className = '',
  children,
  ...ariaProps
}: Props) {
  const { isDragging, dragHandlers } = useDragScroll<HTMLDivElement>(axis)

  return (
    <div
      {...ariaProps}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- drag-scroll region must be keyboard-scrollable (WCAG 2.1.1)
      tabIndex={0}
      className={`${className} ${focusRingInset} ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
      {...dragHandlers}
    >
      {children}
    </div>
  )
}
