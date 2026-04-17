'use client'

import { useMemo } from 'react'
import type { FoodRow, NutrientMeta } from '@/types/nutrition'
import { cellColor } from '@/lib/colorScale'
import { getPortionSize } from '@/lib/portionSizes'
import { NUTRIENT_GROUP_LIST } from '@/lib/filterConstants'

interface Props {
  nutrients: NutrientMeta[]
  visibleFoods: FoodRow[]
  columnRanges: Record<number, { min: number; max: number }>
  perServing: boolean
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

export default function NutrientSidebar({ nutrients, visibleFoods, columnRanges, perServing }: Props) {
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

  return (
    <div className="flex-shrink-0 flex flex-col overflow-y-auto max-h-[calc(100vh-130px)] rounded-lg border border-slate-700 shadow-lg bg-slate-950 w-[155px]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-950 px-1 py-1.5 text-center border-b border-slate-700">
        <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide leading-none">
          Avg Profile
        </span>
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
              const range = columnRanges[n.nutrient_id] ?? { min: 0, max: 0 }
              const bg = cellColor(avg, range.min, range.max)
              const displayAvg =
                avg === null ? null
                : avg >= 1000 ? `${(avg / 1000).toFixed(1)}k`
                : avg >= 100 ? Math.round(avg).toString()
                : avg >= 10  ? avg.toFixed(1)
                : avg >= 0.01 ? avg.toFixed(2)
                : '<0.01'

              const tooltipText =
                avg === null
                  ? `${n.nutrient_name}: no data in selection`
                  : `${n.nutrient_name}: avg ${displayAvg} ${n.unit}`

              return (
                <div
                  key={n.nutrient_id}
                  title={tooltipText}
                  style={{ backgroundColor: bg }}
                  className="flex items-center justify-between px-1.5 h-[16px] border-b border-black/25 cursor-default select-none hover:brightness-125 transition-[filter]"
                >
                  <span className="text-[8.5px] text-white/75 leading-none">
                    {abbr(n.nutrient_name)}
                  </span>
                </div>
              )
            })}
          </div>
        )
      })}

      {/* Empty state */}
      {visibleFoods.length === 0 && (
        <div className="flex-1 flex items-center justify-center p-2">
          <span className="text-[8px] text-slate-600 text-center leading-tight">No foods selected</span>
        </div>
      )}
    </div>
  )
}
