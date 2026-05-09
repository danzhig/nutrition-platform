'use client'

import { useState } from 'react'
import { RATING_LABELS } from '@/lib/dietProfile'

interface Props {
  value: number // 1–5
  onChange: (rating: number) => void
}

export default function DietRatingControl({ value, onChange }: Props) {
  const [hoveredPip, setHoveredPip] = useState<number | null>(null)

  return (
    <div className="relative flex items-center gap-0.5 flex-shrink-0">
      {/* Tooltip — appears above the control */}
      {hoveredPip !== null && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-slate-900 border border-slate-600 rounded text-[10px] text-slate-200 whitespace-nowrap z-20 pointer-events-none shadow-lg">
          {RATING_LABELS[hoveredPip]}
        </div>
      )}

      {[1, 2, 3, 4, 5].map((pip) => (
        <button
          key={pip}
          onClick={() => onChange(pip)}
          onMouseEnter={() => setHoveredPip(pip)}
          onMouseLeave={() => setHoveredPip(null)}
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
