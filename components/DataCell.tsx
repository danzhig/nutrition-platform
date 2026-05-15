'use client'

interface Props {
  value: number | null
  unit: string
  nutrientName: string
  foodName: string
  rdaTarget?: number | null
  ulValue?: number
}

export default function DataCell({
  value,
  unit,
  nutrientName,
  foodName,
  rdaTarget,
  ulValue,
}: Props) {
  const dvMode = rdaTarget != null && rdaTarget > 0

  let displayValue: string
  let tooltipText: string

  if (dvMode) {
    const pct = value !== null ? (value / rdaTarget!) * 100 : null

    if (pct === null) {
      displayValue = '—'
    } else if (pct >= 1000) {
      displayValue = '>999%'
    } else if (pct >= 10) {
      displayValue = `${Math.round(pct)}%`
    } else {
      displayValue = `${pct.toFixed(1)}%`
    }

    const ulText =
      ulValue != null && pct !== null && pct > (ulValue / rdaTarget!) * 100
        ? ` ⚠ over UL (${ulValue} ${unit})`
        : ''
    tooltipText =
      value === null
        ? `${foodName} — ${nutrientName}: data not available`
        : `${foodName} — ${nutrientName}: ${value} ${unit} = ${displayValue} DV${ulText}`
  } else {
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
      className="w-12 min-w-[3rem] h-8 text-center text-[10px] font-mono cursor-default select-none border border-slate-700/40 text-slate-300"
    >
      {displayValue}
    </td>
  )
}
