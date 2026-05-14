'use client'

import { useState, useRef } from 'react'
import { RATING_LABELS } from '@/lib/dietProfile'

interface Props {
  value: number // 1–5
  onChange: (rating: number) => void
}

export default function DietRatingControl({ value, onChange }: Props) {
  const [hoveredPip, setHoveredPip] = useState<number | null>(null)
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  function handleMouseEnter(pip: number) {
    setHoveredPip(pip)
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top })
    }
  }

  function handleMouseLeave() {
    setHoveredPip(null)
    setTooltipPos(null)
  }

  return (
    <div ref={containerRef} className="relative flex items-center gap-0.5 flex-shrink-0">
      {hoveredPip !== null && tooltipPos !== null && (
        <div
          className="fixed px-2 py-1 bg-slate-900 border border-slate-600 rounded text-[10px] text-slate-200 whitespace-nowrap z-[9999] pointer-events-none shadow-lg -translate-x-1/2 -translate-y-full"
          style={{ left: tooltipPos.x, top: tooltipPos.y - 6 }}
        >
          {RATING_LABELS[hoveredPip]}
        </div>
      )}

      {[1, 2, 3, 4, 5].map((pip) => (
        <button
          key={pip}
          onClick={() => onChange(pip)}
          onMouseEnter={() => handleMouseEnter(pip)}
          onMouseLeave={handleMouseLeave}
          className={`w-6 h-6 rounded border text-[10px] font-semibold transition-colors ${
            pip === value
              ? 'bg-violet-600 border-violet-500 text-white'
              : 'bg-transparent border-slate-600 text-slate-500 hover:border-slate-400 hover:text-slate-300'
          }`}
        >
          {pip}
        </button>
      ))}
    </div>
  )
}
