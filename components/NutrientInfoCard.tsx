'use client'

import { useEffect, useLayoutEffect, useRef, useState, useMemo } from 'react'
import type { NutrientMeta, FoodRow } from '@/types/nutrition'
import type { Meal } from '@/types/meals'

interface Props {
  nutrient: NutrientMeta
  anchorRect: DOMRect
  onClose: () => void
  meals: Meal[]
  foodsById: Map<number, FoodRow>
}

const CONTRIB_COLORS = ['#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#f472b6', '#64748b']

export default function NutrientInfoCard({ nutrient, anchorRect, onClose, meals, foodsById }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)

  // Per-food contribution to this nutrient across active meals
  const contribs = useMemo(() => {
    const byFood = new Map<number, { name: string; value: number }>()
    for (const meal of meals) {
      for (const item of meal.items) {
        const food = foodsById.get(item.food_id)
        if (!food) continue
        const val = ((food.nutrients[nutrient.nutrient_id] as number) ?? 0) * (item.grams / 100)
        if (val <= 0) continue
        const prev = byFood.get(item.food_id)
        byFood.set(item.food_id, {
          name: item.food_name || food.food_name,
          value: (prev?.value ?? 0) + val,
        })
      }
    }
    const sorted = [...byFood.values()].sort((a, b) => b.value - a.value)
    const top5 = sorted.slice(0, 5)
    const otherVal = sorted.slice(5).reduce((s, f) => s + f.value, 0)
    const result = top5.map((f, i) => ({ ...f, color: CONTRIB_COLORS[i] }))
    if (otherVal > 0) result.push({ name: 'Other', value: otherVal, color: CONTRIB_COLORS[5] })
    return result
  }, [meals, foodsById, nutrient.nutrient_id])

  const totalContrib = contribs.reduce((s, c) => s + c.value, 0)

  // Measure card height after render then clamp into viewport
  useLayoutEffect(() => {
    if (!cardRef.current) return
    const cardHeight = cardRef.current.offsetHeight
    const cardWidth = 288
    const gap = 8

    // Prefer left of the anchor; fall back to right if not enough room
    let left = anchorRect.left - cardWidth - gap
    if (left < 8) left = Math.min(8, anchorRect.right + gap)

    let top = anchorRect.top - 20
    top = Math.max(8, top)
    top = Math.min(top, window.innerHeight - cardHeight - 8)

    setPos({ top, left })
  }, [anchorRect, contribs])

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) onClose()
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

  const hasDeficiency = nutrient.deficiency_symptoms && nutrient.deficiency_symptoms !== 'N/A'
  const hasExcess = nutrient.excess_symptoms && nutrient.excess_symptoms !== 'N/A'

  function fmt(v: number) {
    return v < 1 ? v.toFixed(2) : v < 100 ? v.toFixed(1) : Math.round(v).toString()
  }

  return (
    <div
      ref={cardRef}
      className="fixed z-50 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl p-4 text-xs"
      style={{
        width: 288,
        top: pos?.top ?? 0,
        left: pos?.left ?? 0,
        visibility: pos ? 'visible' : 'hidden',
      }}
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

      {/* Food contribution bar */}
      {contribs.length > 0 && (
        <div className="mb-3">
          <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1.5">Sources in plan</p>
          {/* Stacked bar */}
          <div className="h-2.5 rounded-sm overflow-hidden flex mb-2">
            {contribs.map((c, i) => (
              <div
                key={i}
                className="h-full"
                style={{ width: `${(c.value / totalContrib) * 100}%`, backgroundColor: c.color }}
                title={`${c.name}: ${fmt(c.value)} ${nutrient.unit}`}
              />
            ))}
          </div>
          {/* Legend */}
          <div className="space-y-0.5">
            {contribs.map((c, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: c.color }} />
                <span className="text-slate-300 truncate flex-1 min-w-0" title={c.name}>{c.name}</span>
                <span className="text-slate-400 flex-shrink-0 ml-1">
                  {Math.round((c.value / totalContrib) * 100)}%
                </span>
                <span className="text-slate-600 flex-shrink-0 text-[9px]">
                  {fmt(c.value)}{nutrient.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Separator */}
      {contribs.length > 0 && (nutrient.body_role || hasDeficiency || hasExcess) && (
        <div className="border-t border-slate-700 mb-3" />
      )}

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

      {!hasDeficiency && !hasExcess && nutrient.body_role && (
        <p className="text-slate-500 text-[10px] italic">No deficiency or toxicity thresholds — this is a food metric.</p>
      )}
    </div>
  )
}
