import { useRef, useState } from 'react'
import type { MouseEvent, PointerEvent } from 'react'

const DRAG_CLICK_THRESHOLD = 5

export function useDragScroll<T extends HTMLElement>() {
  const [isDragging, setIsDragging] = useState(false)
  const dragState = useRef({
    active: false,
    startX: 0,
    scrollLeft: 0,
    dragged: false,
  })

  function onPointerDown(event: PointerEvent<T>) {
    if (event.pointerType !== 'mouse') return
    if ((event.target as HTMLElement).closest('button, a')) return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragState.current = {
      active: true,
      startX: event.clientX,
      scrollLeft: event.currentTarget.scrollLeft,
      dragged: false,
    }
    setIsDragging(true)
  }

  function onPointerMove(event: PointerEvent<T>) {
    if (!dragState.current.active) return
    const delta = event.clientX - dragState.current.startX
    if (Math.abs(delta) > DRAG_CLICK_THRESHOLD) dragState.current.dragged = true
    event.currentTarget.scrollLeft = dragState.current.scrollLeft - delta
  }

  function onPointerUp(event: PointerEvent<T>) {
    event.currentTarget.releasePointerCapture(event.pointerId)
    dragState.current.active = false
    setIsDragging(false)
  }

  function onClickCapture(event: MouseEvent<T>) {
    if (dragState.current.dragged) {
      event.preventDefault()
      event.stopPropagation()
    }
    dragState.current.dragged = false
  }

  return {
    isDragging,
    dragHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
      onClickCapture,
    },
  }
}
