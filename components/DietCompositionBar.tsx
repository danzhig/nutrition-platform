'use client'

import { useState } from 'react'
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
}

export default function DietCompositionBar({ compositions }: Props) {
  const [hovered, setHovered] = useState<{
    idx: number
    x: number
    y: number
  } | null>(null)

  if (compositions.length === 0) return null

  const hoveredComp = hovered !== null ? compositions[hovered.idx] : null

  return (
    <div className="px-4 py-3 border-b border-slate-700 flex-shrink-0 space-y-1.5">
      {/* Stacked bar */}
      <div className="flex h-3 rounded-full overflow-hidden">
        {compositions.map(({ foodId, proportion }, i) => (
          <div
            key={foodId}
            className="h-full transition-opacity duration-100 cursor-default"
            style={{
              width: `${proportion * 100}%`,
              background: PALETTE[i % PALETTE.length],
              opacity: hovered === null || hovered.idx === i ? 1 : 0.35,
            }}
            onMouseEnter={(e) => setHovered({ idx: i, x: e.clientX, y: e.clientY })}
            onMouseMove={(e) =>
              setHovered((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : prev))
            }
            onMouseLeave={() => setHovered(null)}
          />
        ))}
      </div>

      <p className="text-[9px] text-slate-500 leading-none">
        Diet composition — daily food weight by proportion
      </p>

      {/* Fixed tooltip follows cursor */}
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
            — {Math.round(hoveredComp.proportion * 100)}% of daily diet
          </span>
        </div>
      )}
    </div>
  )
}
