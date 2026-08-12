'use client'

import { useRef, useState } from 'react'

/**
 * Drag-down-to-dismiss for bottom sheets. Attach `handlers` to the sheet's
 * drag-handle area; apply `style` to the sheet's root so dragging tracks the
 * finger with no transition, then either dismisses (>80px) or snaps back
 * (0.2s ease, transition re-enabled only for the snap-back).
 */
export function useSwipeToDismiss(onDismiss: () => void) {
  const [dragY, setDragY] = useState(0)
  const [dragging, setDragging] = useState(false)
  const startY = useRef(0)

  function onTouchStart(e: React.TouchEvent) {
    startY.current = e.touches[0].clientY
    setDragging(true)
  }

  function onTouchMove(e: React.TouchEvent) {
    const delta = e.touches[0].clientY - startY.current
    if (delta > 0) setDragY(delta)
  }

  function onTouchEnd() {
    setDragging(false)
    if (dragY > 80) {
      onDismiss()
    }
    setDragY(0)
  }

  const style: React.CSSProperties = dragging
    ? { transform: `translateY(${dragY}px)`, transition: 'none' }
    : {}

  return { dragging, style, handlers: { onTouchStart, onTouchMove, onTouchEnd } }
}
