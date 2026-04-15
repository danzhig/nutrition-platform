'use client'

import { cellColor, textColor } from '@/lib/colorScale'

interface Props {
  value: number | null
  min: number
  max: number
  unit: string
  nutrientName: string
  foodName: string
}

export default function HeatmapCell({
  value,
  min,
  max,
  unit,
  nutrientName,
  foodName,
}: Props) {
  const bg = cellColor(value, min, max)
  const fg = textColor(value, min, max)

  const displayValue =
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

  const tooltipText =
    value === null
      ? `${foodName} — ${nutrientName}: data not available`
      : `${foodName} — ${nutrientName}: ${value} ${unit}`

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
