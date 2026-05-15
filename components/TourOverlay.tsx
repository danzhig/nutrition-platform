'use client'

import { useState, useEffect, useCallback } from 'react'
import type { TourStep, TourActionStep } from '@/lib/tourSteps'
import DemoCursor from './DemoCursor'

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

// ── Action runner utilities ────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms))
}

function setNativeValue(el: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
  setter?.call(el, value)
  el.dispatchEvent(new Event('input', { bubbles: true }))
}

async function getCenterOf(selector: string): Promise<{ x: number; y: number } | null> {
  for (let i = 0; i < 10; i++) {
    const el = document.querySelector(selector) as HTMLElement | null
    if (el) {
      el.scrollIntoView({ behavior: 'instant', block: 'nearest' })
      const r = el.getBoundingClientRect()
      if (r.width > 0 || r.height > 0) {
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
      }
    }
    await sleep(120)
  }
  return null
}

type CursorControls = {
  move: (x: number, y: number) => void
  setClicking: (v: boolean) => void
}

async function executeAction(actionSteps: TourActionStep[], cursor: CursorControls) {
  for (const s of actionSteps) {
    if (s.type === 'click') {
      const pos = await getCenterOf(s.selector)
      if (!pos) continue
      cursor.move(pos.x, pos.y)
      await sleep(500)
      cursor.setClicking(true)
      await sleep(100)
      ;(document.querySelector(s.selector) as HTMLElement | null)?.click()
      await sleep(100)
      cursor.setClicking(false)
      await sleep(200)

    } else if (s.type === 'type') {
      const pos = await getCenterOf(s.selector)
      if (!pos) continue
      cursor.move(pos.x, pos.y)
      await sleep(500)
      cursor.setClicking(true)
      await sleep(80)
      const el = document.querySelector(s.selector) as HTMLInputElement | null
      if (!el) { cursor.setClicking(false); continue }
      el.click()
      el.focus()
      setNativeValue(el, '')
      cursor.setClicking(false)
      await sleep(150)
      let accumulated = ''
      for (const char of s.text) {
        accumulated += char
        setNativeValue(el, accumulated)
        await sleep(s.charDelay ?? 75)
      }
      await sleep(200)

    } else if (s.type === 'wait') {
      await sleep(s.duration)

    } else if (s.type === 'key') {
      const el = document.querySelector(s.selector) as HTMLElement | null
      el?.dispatchEvent(new KeyboardEvent('keydown', { key: s.key, bubbles: true, cancelable: true }))
      await sleep(150)
    }
  }
}

// ── Component ─────────────────────────────────────────────────────────────

export default function TourOverlay({ steps, onEnd }: Props) {
  const [stepIdx, setStepIdx] = useState(0)
  const [spotBox, setSpotBox] = useState<SpotBox | null>(null)
  const [running, setRunning] = useState(false)
  const [cursorX, setCursorX] = useState(-200)
  const [cursorY, setCursorY] = useState(-200)
  const [cursorClicking, setCursorClicking] = useState(false)

  const step = steps[stepIdx]

  const updateSpot = useCallback(() => {
    if (!step?.target) { setSpotBox(null); return }
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
        setTimeout(() => measure(attemptsLeft - 1), 100)
      } else {
        setSpotBox(null)
      }
    }
    measure(8)
  }, [step?.target])

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

  // While an action is running, poll spotlight so it tracks DOM changes
  // (e.g. a dropdown opening and expanding the target's bounding rect).
  useEffect(() => {
    if (!running) return
    const id = setInterval(updateSpot, 150)
    return () => clearInterval(id)
  }, [running, updateSpot])

  async function goNext() {
    if (running) return
    const current = steps[stepIdx]
    if (current?.action && current.action.length > 0) {
      setRunning(true)
      await executeAction(current.action, {
        move: (x, y) => { setCursorX(x); setCursorY(y) },
        setClicking: setCursorClicking,
      })
      setRunning(false)
    }
    if (stepIdx < steps.length - 1) setStepIdx((i) => i + 1)
    else onEnd()
  }

  const isLast = stepIdx === steps.length - 1
  const totalContentSteps = steps.length - 1
  const displayStep = Math.min(stepIdx + 1, totalContentSteps)

  const vpW = typeof window !== 'undefined' ? window.innerWidth : 1200
  const vpH = typeof window !== 'undefined' ? window.innerHeight : 800
  const tooltipPos = computeTooltipPos(spotBox, step?.position ?? 'center', vpW, vpH)

  return (
    <>
      {/* Dark backdrop when no spotlight target */}
      {!spotBox && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 9996, pointerEvents: 'none' }} />
      )}

      {/* Spotlight ring */}
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
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold text-violet-400 uppercase tracking-wider">
            {isLast ? 'Complete' : `Step ${displayStep} of ${totalContentSteps}`}
          </span>
          <button onClick={onEnd} className="text-slate-500 hover:text-slate-300 text-[11px] transition-colors">
            ✕ End tour
          </button>
        </div>

        <h3 className="text-sm font-bold text-white mb-1.5">{step?.title}</h3>
        <p className="text-xs text-slate-300 leading-relaxed mb-4">{step?.body}</p>

        <div className="flex items-center justify-end">
          {running ? (
            <span className="text-[11px] text-slate-500 italic animate-pulse">Running…</span>
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

      {/* Animated hand cursor */}
      <DemoCursor x={cursorX} y={cursorY} clicking={cursorClicking} />
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
