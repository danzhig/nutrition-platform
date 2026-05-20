'use client'

import { useRef, useState } from 'react'
import type { DietFoodComposition } from '@/lib/dietProfile'

const PALETTE = [
  'hsl(262, 75%, 56%)',
  'hsl(142, 65%, 34%)',
  'hsl(38, 82%, 44%)',
  'hsl(199, 89%, 46%)',
  'hsl(338, 82%, 52%)',
  'hsl(25, 85%, 52%)',
  'hsl(83, 67%, 39%)',
  'hsl(231, 77%, 63%)',
  'hsl(174, 72%, 40%)',
  'hsl(0, 72%, 52%)',
]

interface Props {
  compositions: DietFoodComposition[]
  monthlyBudgetG: number  // dailyWeightG × 28
}

export default function DietCompositionBar({ compositions, monthlyBudgetG }: Props) {
  const barRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState<{ idx: number; x: number; y: number } | null>(null)

  if (compositions.length === 0) return null

  const totalFilledG = compositions.reduce((s, c) => s + c.monthlyGrams, 0)
  const overfilled = totalFilledG > monthlyBudgetG
  const filledKg = (totalFilledG / 1000).toFixed(1)
  const budgetKg = (monthlyBudgetG / 1000).toFixed(1)
  const fillPct = Math.round((totalFilledG / monthlyBudgetG) * 100)

  const hoveredComp = hovered !== null ? compositions[hovered.idx] : null

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!barRef.current) return
    const rect = barRef.current.getBoundingClientRect()
    const xRatio = (e.clientX - rect.left) / rect.width

    let cumulative = 0
    for (let i = 0; i < compositions.length; i++) {
      cumulative += compositions[i].monthlyGrams / monthlyBudgetG
      if (xRatio <= Math.min(cumulative, 1)) {
        setHovered({ idx: i, x: e.clientX, y: e.clientY })
        return
      }
    }
    setHovered(null)
  }

  return (
    <div className="px-4 py-3 border-b border-slate-700 flex-shrink-0 space-y-2">
      {/* Fill bar — grey background is the unfilled budget remainder */}
      <div
        ref={barRef}
        className="flex h-4 rounded-sm overflow-hidden cursor-default bg-slate-700/50"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHovered(null)}
      >
        {compositions.map(({ foodId, monthlyGrams }, i) => (
          <div
            key={foodId}
            className="h-full flex-shrink-0 transition-opacity duration-100"
            style={{
              width: `${(monthlyGrams / monthlyBudgetG) * 100}%`,
              background: PALETTE[i % PALETTE.length],
              opacity: hovered === null || hovered.idx === i ? 1 : 0.35,
            }}
          />
        ))}
      </div>

      {/* Labels */}
      <div className="flex items-baseline justify-between gap-2">
        <span className={`text-[9px] font-medium ${overfilled ? 'text-amber-400' : 'text-slate-300'}`}>
          {filledKg} kg filled{overfilled ? ' — over budget' : ''}
        </span>
        <span className="text-[9px] text-slate-500 tabular-nums">
          {fillPct}% of {budgetKg} kg · 28-day budget
        </span>
      </div>

      {/* Hover tooltip */}
      {hoveredComp && hovered && (
        <div
          className="fixed z-50 px-2 py-1 bg-slate-900 border border-slate-600 rounded text-[10px] text-slate-200 whitespace-nowrap pointer-events-none shadow-lg"
          style={{
            left: hovered.x,
            top: hovered.y - 36,
            transform: 'translateX(-50%)',
          }}
        >
          <span className="font-medium">{hoveredComp.foodName}</span>
          <span className="text-slate-400 ml-1">
            — {(hoveredComp.monthlyGrams / 1000).toFixed(2)} kg/month
          </span>
        </div>
      )}
    </div>
  )
}
