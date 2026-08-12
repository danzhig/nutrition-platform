'use client'

import { rdaCellColor } from '@/lib/rdaColorScale'
import type { NutrientBehavior } from '@/lib/rdaProfiles'

interface MobileNutrientRowProps {
  name: string
  value: number | null
  unit: string
  pctDv: number | null
  behavior: NutrientBehavior
  upperLimitPct?: number
  showBar: boolean
}

export default function MobileNutrientRow({
  name,
  value,
  unit,
  pctDv,
  behavior,
  upperLimitPct,
  showBar,
}: MobileNutrientRowProps) {
  const hasRda = pctDv !== null
  const barColor = hasRda ? rdaCellColor(pctDv, behavior, upperLimitPct) : undefined

  return (
    <div className="px-3 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className={`text-sm truncate ${hasRda ? 'text-slate-200' : 'text-slate-500'}`}>
          {name}
        </span>
        <span className={`text-sm shrink-0 ${hasRda ? 'text-slate-100' : 'text-slate-500'}`}>
          {value === null ? '—' : `${formatValue(value)} ${unit}`}
        </span>
      </div>
      {showBar && hasRda && (
        <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{ width: `${Math.min(pctDv!, 200) / 2}%`, backgroundColor: barColor }}
          />
        </div>
      )}
    </div>
  )
}

function formatValue(value: number): string {
  if (Math.abs(value) >= 100) return value.toFixed(0)
  if (Math.abs(value) >= 10) return value.toFixed(1)
  return value.toFixed(2)
}
