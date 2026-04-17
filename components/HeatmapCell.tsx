'use client'

import { cellColor, textColor } from '@/lib/colorScale'
import { rdaCellColor, rdaTextColor } from '@/lib/rdaColorScale'
import type { NutrientBehavior } from '@/lib/rdaProfiles'

interface Props {
  value: number | null
  min: number
  max: number
  unit: string
  nutrientName: string
  foodName: string
  // DV mode props — only provided when a profile is active
  rdaTarget?: number | null   // daily target value; null = no target for this nutrient
  behavior?: NutrientBehavior
  ulValue?: number            // absolute upper limit (same unit as value)
}

export default function HeatmapCell({
  value,
  min,
  max,
  unit,
  nutrientName,
  foodName,
  rdaTarget,
  behavior = 'normal',
  ulValue,
}: Props) {
  const dvMode = rdaTarget != null && rdaTarget > 0

  let bg: string
  let fg: string
  let displayValue: string
  let tooltipText: string

  if (dvMode) {
    const pct = value !== null ? (value / rdaTarget!) * 100 : null
    const ulPct = ulValue != null ? (ulValue / rdaTarget!) * 100 : undefined
    bg = rdaCellColor(pct, behavior, ulPct)
    fg = rdaTextColor(pct)

    if (pct === null) {
      displayValue = '—'
    } else if (pct >= 1000) {
      displayValue = '>999%'
    } else if (pct >= 100) {
      displayValue = `${Math.round(pct)}%`
    } else if (pct >= 10) {
      displayValue = `${Math.round(pct)}%`
    } else {
      displayValue = `${pct.toFixed(1)}%`
    }

    const ulText = ulValue != null && pct !== null && pct > (ulValue / rdaTarget!) * 100
      ? ` ⚠ over UL (${ulValue} ${unit})`
      : ''
    tooltipText =
      value === null
        ? `${foodName} — ${nutrientName}: data not available`
        : `${foodName} — ${nutrientName}: ${value} ${unit} = ${displayValue} DV${ulText}`
  } else {
    // Relative (p10/p90) mode
    bg = cellColor(value, min, max)
    fg = textColor(value, min, max)

    displayValue =
      value === null
        ? '—'
        : value < 0.01 && value > 0
        ? '<0.01'
        : value >= 1000
        ? `${(value / 1000).toFixed(1)}k`
        : value >= 100
        ? Math.round(value).toString()
        : value >= 10
        ? value.toFixed(1)
        : value.toFixed(2)

    tooltipText =
      value === null
        ? `${foodName} — ${nutrientName}: data not available`
        : `${foodName} — ${nutrientName}: ${value} ${unit}`
  }

  return (
    <td
      title={tooltipText}
      style={{ backgroundColor: bg, color: fg }}
      className="w-12 min-w-[3rem] h-8 text-center text-[10px] font-mono cursor-default select-none border border-white/20 transition-opacity hover:opacity-80"
    >
      {displayValue}
    </td>
  )
}
