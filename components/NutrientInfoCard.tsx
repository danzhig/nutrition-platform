'use client'

import { useEffect, useRef } from 'react'
import type { NutrientMeta } from '@/types/nutrition'

interface Props {
  nutrient: NutrientMeta
  anchorRect: DOMRect
  onClose: () => void
}

export default function NutrientInfoCard({ nutrient, anchorRect, onClose }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  // Close on Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  // Position: left of the anchor element, vertically centred on it
  const cardWidth = 288
  const gap = 8
  const left = Math.max(8, anchorRect.left - cardWidth - gap)
  const top = Math.min(
    window.innerHeight - 20,  // never below viewport
    Math.max(8, anchorRect.top - 20)
  )

  const hasDeficiency = nutrient.deficiency_symptoms && nutrient.deficiency_symptoms !== 'N/A'
  const hasExcess = nutrient.excess_symptoms && nutrient.excess_symptoms !== 'N/A'

  return (
    <div
      ref={cardRef}
      className="fixed z-50 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl p-4 text-xs"
      style={{ width: cardWidth, top, left }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="text-slate-100 font-semibold text-sm leading-tight">{nutrient.nutrient_name}</p>
          <p className="text-slate-500 text-[10px] mt-0.5">{nutrient.nutrient_category} · {nutrient.unit}</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-300 flex-shrink-0 leading-none mt-0.5"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {/* Body role */}
      {nutrient.body_role && (
        <div className="mb-3">
          <p className="text-violet-400 text-[10px] font-semibold uppercase tracking-wider mb-1">Function</p>
          <p className="text-slate-300 leading-relaxed">{nutrient.body_role}</p>
        </div>
      )}

      {/* Deficiency */}
      {hasDeficiency && (
        <div className="mb-3">
          <p className="text-amber-400 text-[10px] font-semibold uppercase tracking-wider mb-1">Too little</p>
          <p className="text-slate-300 leading-relaxed">{nutrient.deficiency_symptoms}</p>
        </div>
      )}

      {/* Excess */}
      {hasExcess && (
        <div>
          <p className="text-red-400 text-[10px] font-semibold uppercase tracking-wider mb-1">Too much</p>
          <p className="text-slate-300 leading-relaxed">{nutrient.excess_symptoms}</p>
        </div>
      )}

      {/* Metrics — no clinical deficiency/excess */}
      {!hasDeficiency && !hasExcess && nutrient.body_role && (
        <p className="text-slate-500 text-[10px] italic">No deficiency or toxicity thresholds — this is a food metric.</p>
      )}
    </div>
  )
}
