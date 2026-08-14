import { useRef, useState } from 'react'
import type { MouseEvent, PointerEvent } from 'react'

const DRAG_CLICK_THRESHOLD = 5

export function useDragScroll<T extends HTMLElement>(axis: 'x' | 'y' = 'x') {
  const [isDragging, setIsDragging] = useState(false)
  const dragState = useRef({
    active: false,
    start: 0,
    scrollPos: 0,
    dragged: false,
  })

  function onPointerDown(event: PointerEvent<T>) {
    if (event.pointerType !== 'mouse') return
    if ((event.target as HTMLElement).closest('button, a')) return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragState.current = {
      active: true,
      start: axis === 'x' ? event.clientX : event.clientY,
      scrollPos:
        axis === 'x'
          ? event.currentTarget.scrollLeft
          : event.currentTarget.scrollTop,
      dragged: false,
    }
    setIsDragging(true)
  }

  function onPointerMove(event: PointerEvent<T>) {
    if (!dragState.current.active) return
    const position = axis === 'x' ? event.clientX : event.clientY
    const delta = position - dragState.current.start
    if (Math.abs(delta) > DRAG_CLICK_THRESHOLD) dragState.current.dragged = true
    if (axis === 'x') {
      event.currentTarget.scrollLeft = dragState.current.scrollPos - delta
    } else {
      event.currentTarget.scrollTop = dragState.current.scrollPos - delta
    }
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
