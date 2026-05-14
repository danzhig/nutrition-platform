'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { TourStep } from '@/lib/tourSteps'

const SPOT_PAD = 10
const TOOLTIP_W = 300
const TOOLTIP_H_EST = 200

interface SpotBox {
  top: number
  left: number
  width: number
  height: number
}

interface Props {
  steps: TourStep[]
  onEnd: () => void
}

export default function TourOverlay({ steps, onEnd }: Props) {
  const [stepIdx, setStepIdx] = useState(0)
  const [spotBox, setSpotBox] = useState<SpotBox | null>(null)

  const step = steps[stepIdx]

  // Keep a ref to stepIdx so the master event listener always sees the current value
  const stepIdxRef = useRef(stepIdx)
  useEffect(() => { stepIdxRef.current = stepIdx }, [stepIdx])

  const updateSpot = useCallback(() => {
    if (!step?.target) {
      setSpotBox(null)
      return
    }
    const measure = (attemptsLeft: number) => {
      const el = document.querySelector(step.target!) as HTMLElement | null
      if (!el) {
        if (attemptsLeft > 0) setTimeout(() => measure(attemptsLeft - 1), 100)
        else setSpotBox(null)
        return
      }
      el.scrollIntoView({ behavior: 'instant', block: 'nearest' })
      const r = el.getBoundingClientRect()
      if (r.width > 0 || r.height > 0) {
        setSpotBox({
          top: r.top - SPOT_PAD,
          left: r.left - SPOT_PAD,
          width: r.width + SPOT_PAD * 2,
          height: r.height + SPOT_PAD * 2,
        })
      } else if (attemptsLeft > 0) {
        // Element in DOM but not yet laid out — retry
        setTimeout(() => measure(attemptsLeft - 1), 100)
      } else {
        setSpotBox(null)
      }
    }
    measure(8)
  }, [step?.target])

  // Reposition spotlight when step changes or on scroll/resize
  useEffect(() => {
    const timer = setTimeout(updateSpot, 150)
    window.addEventListener('resize', updateSpot)
    window.addEventListener('scroll', updateSpot, true)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updateSpot)
      window.removeEventListener('scroll', updateSpot, true)
    }
  }, [updateSpot])

  // Register ALL advance-event listeners once on mount so there is never a gap
  // between a step becoming active and its listener being ready.
  useEffect(() => {
    function masterHandler(e: Event) {
      const current = steps[stepIdxRef.current]
      if (current?.advanceOn === e.type) {
        setStepIdx((i) => (i < steps.length - 1 ? i + 1 : i))
      }
    }
    const unique = [...new Set(steps.map((s) => s.advanceOn).filter(Boolean))] as string[]
    unique.forEach((ev) => window.addEventListener(ev, masterHandler))
    return () => unique.forEach((ev) => window.removeEventListener(ev, masterHandler))
  }, [steps])

  function goNext() {
    if (stepIdx < steps.length - 1) setStepIdx((i) => i + 1)
    else onEnd()
  }

  function goPrev() {
    if (stepIdx > 0) setStepIdx((i) => i - 1)
  }

  const isFirst = stepIdx === 0
  const isLast = stepIdx === steps.length - 1
  const totalContentSteps = steps.length - 1
  const displayStep = Math.min(stepIdx + 1, totalContentSteps)
  const isAutoAdvance = !!step?.advanceOn

  const vpW = typeof window !== 'undefined' ? window.innerWidth : 1200
  const vpH = typeof window !== 'undefined' ? window.innerHeight : 800
  const tooltipPos = computeTooltipPos(spotBox, step?.position ?? 'center', vpW, vpH)

  return (
    <>
      {/* Dark backdrop when no spotlight target */}
      {!spotBox && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 9996, pointerEvents: 'none' }}
        />
      )}

      {/* Spotlight ring — box-shadow creates the backdrop outside the ring */}
      {spotBox && (
        <div
          style={{
            position: 'fixed',
            top: spotBox.top,
            left: spotBox.left,
            width: spotBox.width,
            height: spotBox.height,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.65)',
            border: '2px solid rgba(139, 92, 246, 0.9)',
            borderRadius: 8,
            zIndex: 9997,
            pointerEvents: 'none',
            transition: 'top 280ms ease, left 280ms ease, width 280ms ease, height 280ms ease',
          }}
        />
      )}

      {/* Tooltip card */}
      <div
        style={{
          position: 'fixed',
          top: tooltipPos.top,
          left: tooltipPos.left,
          width: TOOLTIP_W,
          zIndex: 9999,
          transition: 'top 280ms ease, left 280ms ease',
        }}
        className="bg-slate-800 border border-violet-500/70 rounded-xl shadow-2xl shadow-black/70 p-4"
      >
        {/* Header row */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold text-violet-400 uppercase tracking-wider">
            {isLast ? 'Complete' : `Step ${displayStep} of ${totalContentSteps}`}
          </span>
          <button
            onClick={onEnd}
            className="text-slate-500 hover:text-slate-300 text-[11px] transition-colors"
          >
            ✕ End tour
          </button>
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-white mb-1.5">{step?.title}</h3>

        {/* Body */}
        <p className="text-xs text-slate-300 leading-relaxed mb-4">{step?.body}</p>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={goPrev}
            disabled={isFirst}
            className="text-xs px-3 py-1.5 rounded-md border border-slate-600 text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Back
          </button>
          {isAutoAdvance ? (
            <span className="text-[11px] text-slate-500 italic">Complete the action above ↑</span>
          ) : (
            <button
              onClick={goNext}
              className="text-xs px-4 py-1.5 rounded-md bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-colors"
            >
              {isLast ? 'Finish' : 'Next →'}
            </button>
          )}
        </div>
      </div>
    </>
  )
}

function computeTooltipPos(
  spot: SpotBox | null,
  position: TourStep['position'],
  vpW: number,
  vpH: number,
): { top: number; left: number } {
  if (!spot || position === 'center') {
    return {
      top: Math.max(12, (vpH - TOOLTIP_H_EST) / 2),
      left: Math.max(12, (vpW - TOOLTIP_W) / 2),
    }
  }

  const cx = spot.left + spot.width / 2
  let top: number
  let left: number

  switch (position) {
    case 'bottom':
      top = spot.top + spot.height + 14
      left = cx - TOOLTIP_W / 2
      break
    case 'top':
      top = spot.top - TOOLTIP_H_EST - 14
      left = cx - TOOLTIP_W / 2
      break
    case 'right':
      top = spot.top + spot.height / 2 - TOOLTIP_H_EST / 2
      left = spot.left + spot.width + 14
      break
    case 'left':
    default:
      top = spot.top + spot.height / 2 - TOOLTIP_H_EST / 2
      left = spot.left - TOOLTIP_W - 14
      break
  }

  return {
    top: Math.max(12, Math.min(top, vpH - TOOLTIP_H_EST - 12)),
    left: Math.max(12, Math.min(left, vpW - TOOLTIP_W - 12)),
  }
}
