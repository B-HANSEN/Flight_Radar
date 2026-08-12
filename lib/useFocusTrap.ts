import { useEffect } from 'react'
import type { RefObject } from 'react'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Focuses the dialog on open, restores focus to the previously-focused
 * element on close, traps Tab within it, and calls `onDismiss` on Escape.
 * Pass `active: false` to temporarily yield Escape/Tab handling to a nested
 * overlay rendered inside the dialog, while keeping the open/close focus
 * restoration intact.
 */
export function useFocusTrap<T extends HTMLElement>(
  dialogRef: RefObject<T | null>,
  isOpen: boolean,
  onDismiss: () => void,
  active = true,
) {
  useEffect(() => {
    if (!isOpen) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    dialogRef.current?.focus()
    return () => {
      previouslyFocused?.focus()
    }
  }, [isOpen, dialogRef])

  useEffect(() => {
    if (!isOpen || !active) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onDismiss()
        return
      }

      if (event.key !== 'Tab' || !dialogRef.current) return

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      )
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, active, onDismiss, dialogRef])
}
