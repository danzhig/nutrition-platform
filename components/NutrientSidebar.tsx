'use client'

import { useMemo } from 'react'
import type { FoodRow, NutrientMeta } from '@/types/nutrition'
import { cellColor } from '@/lib/colorScale'
import { rdaCellColor } from '@/lib/rdaColorScale'
import { getPortionSize } from '@/lib/portionSizes'
import { NUTRIENT_GROUP_LIST } from '@/lib/filterConstants'
import type { RDAProfile, NutrientBehavior } from '@/lib/rdaProfiles'
import { NUTRIENT_BEHAVIORS, NUTRIENT_UPPER_LIMITS } from '@/lib/rdaProfiles'

interface Props {
  nutrients: NutrientMeta[]
  visibleFoods: FoodRow[]
  columnRanges: Record<number, { min: number; max: number }>
  perServing: boolean
  rdaProfile: RDAProfile | null
}

/** Abbreviate a nutrient name to fit in the sidebar. */
function abbr(name: string): string {
  return name
    .replace('Vitamin ', 'Vit ')
    .replace('Pantothenic Acid', 'Pantothenic Ac.')
    .replace('Antioxidant Capacity', 'Antioxidant')
    .replace('Glycemic Index', 'Glycemic Idx')
    .replace('Saturated Fat', 'Sat Fat')
    .replace('Monounsaturated Fat', 'MUFA')
    .replace('Polyunsaturated Fat', 'PUFA')
    .replace('Omega-3 Fatty Acids', 'Omega-3')
    .replace('Omega-6 Fatty Acids', 'Omega-6')
    .replace('Phenylalanine', 'Phe')
    .replace('Isoleucine', 'Ile')
    .replace('Threonine', 'Thr')
    .replace('Tryptophan', 'Trp')
    .replace('Histidine', 'His')
    .replace('Leucine', 'Leu')
    .replace('Lysine', 'Lys')
    .replace('Methionine', 'Met')
    .replace('Valine', 'Val')
}

export default function NutrientSidebar({
  nutrients,
  visibleFoods,
  columnRanges,
  perServing,
  rdaProfile,
}: Props) {
  // Average value per nutrient across all currently visible foods
  const averages = useMemo(() => {
    const avgs: Record<number, number | null> = {}
    for (const nutrient of nutrients) {
      const nId = nutrient.nutrient_id
      const values: number[] = []
      for (const food of visibleFoods) {
        const raw = food.nutrients[nId]
        if (raw === null || raw === undefined) continue
        const multiplier = perServing ? getPortionSize(food.food_id).grams / 100 : 1
        values.push((raw as number) * multiplier)
      }
      avgs[nId] = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null
    }
    return avgs
  }, [nutrients, visibleFoods, columnRanges, perServing])

  const groups = NUTRIENT_GROUP_LIST.map((g) => ({
    ...g,
    nutrients: nutrients.filter((n) => n.nutrient_category === g.value),
  }))

  const headerLabel = rdaProfile ? `Avg % DV` : 'Avg Profile'

  return (
    <div className="flex-shrink-0 flex flex-col overflow-y-auto max-h-[calc(100vh-130px)] rounded-lg border border-slate-700 shadow-lg bg-slate-950 w-[155px]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-950 px-1 py-1.5 text-center border-b border-slate-700">
        <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide leading-none">
          {headerLabel}
        </span>
        {rdaProfile && (
          <span className="block text-[8px] text-slate-500 leading-none mt-0.5">
            {rdaProfile.shortLabel}
          </span>
        )}
      </div>

      {groups.map((g) => {
        if (g.nutrients.length === 0) return null
        return (
          <div key={g.value}>
            {/* Group label */}
            <div className="sticky top-[29px] z-10 bg-slate-900 px-1 py-[3px] border-b border-slate-700/60">
              <span className="text-[8px] font-semibold text-slate-500 uppercase tracking-wider leading-none">
                {g.label.replace('nutrients', '').replace('Acids', '').trim()}
              </span>
            </div>

            {/* Nutrient rows */}
            {g.nutrients.map((n) => {
              const avg = averages[n.nutrient_id] ?? null
              let bg: string
              let labelRight: string | null = null

              if (rdaProfile) {
                const rdaTarget = rdaProfile.values[n.nutrient_name] ?? null
                if (rdaTarget != null && rdaTarget > 0 && avg !== null) {
                  const pct = (avg / rdaTarget) * 100
                  const behavior: NutrientBehavior = NUTRIENT_BEHAVIORS[n.nutrient_name] ?? 'normal'
                  const ulValue = NUTRIENT_UPPER_LIMITS[n.nutrient_name]
                  const ulPct = ulValue != null ? (ulValue / rdaTarget) * 100 : undefined
                  bg = rdaCellColor(pct, behavior, ulPct)
                  labelRight = pct >= 1000 ? '>999%' : `${Math.round(pct)}%`
                } else {
                  // No target for this nutrient — neutral
                  bg = '#1e293b'
                }
              } else {
                const range = columnRanges[n.nutrient_id] ?? { min: 0, max: 0 }
                bg = cellColor(avg, range.min, range.max)
              }

              const tooltipAvg =
                avg === null ? 'no data'
                : avg >= 1000 ? `${(avg / 1000).toFixed(1)}k ${n.unit}`
                : avg >= 100 ? `${Math.round(avg)} ${n.unit}`
                : avg >= 10  ? `${avg.toFixed(1)} ${n.unit}`
                : `${avg.toFixed(2)} ${n.unit}`

              const tooltipText = rdaProfile && rdaProfile.values[n.nutrient_name] != null
                ? `${n.nutrient_name}: avg ${tooltipAvg} = ${labelRight ?? '—'} of daily target`
                : `${n.nutrient_name}: avg ${tooltipAvg}`

              return (
                <div
                  key={n.nutrient_id}
                  title={tooltipText}
                  style={{ backgroundColor: bg }}
                  className="flex items-center justify-between px-1.5 h-[16px] border-b border-black/25 cursor-default select-none hover:brightness-125 transition-[filter]"
                >
                  <span className="text-[8.5px] text-white/75 leading-none flex-1 min-w-0 truncate">
                    {abbr(n.nutrient_name)}
                  </span>
                  {labelRight && (
                    <span className="text-[7.5px] text-white/60 font-mono ml-1 shrink-0 leading-none">
                      {labelRight}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )
      })}

      {visibleFoods.length === 0 && (
        <div className="flex-1 flex items-center justify-center p-2">
          <span className="text-[8px] text-slate-600 text-center leading-tight">No foods selected</span>
        </div>
      )}
    </div>
  )
}
