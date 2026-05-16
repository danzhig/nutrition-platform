'use client'

import type { NutrientMeta } from '@/types/nutrition'
import type { DietNutrientResult } from '@/lib/dietProfile'
import { NUTRIENT_GROUP_LIST } from '@/lib/filterConstants'
import { rdaCellColor } from '@/lib/rdaColorScale'

interface Props {
  results: DietNutrientResult[]
  allNutrients: NutrientMeta[]
}

// Diet-optimized color: < 30% red, 30–70% amber, ≥ 70% green.
// Limit and normal-with-ul behaviors delegate to rdaCellColor for correct semantics.
function dietBarColor(
  pctDV: number,
  behavior: string,
  upperLimit?: number,
  rdaTarget?: number,
): string {
  const pct = pctDV * 100
  if (behavior === 'limit') return rdaCellColor(pct, 'limit')
  if (behavior === 'normal-with-ul' && upperLimit !== undefined && rdaTarget !== undefined) {
    if (pct >= 70) return rdaCellColor(pct, 'normal-with-ul', (upperLimit / rdaTarget) * 100)
  }
  if (pct < 30) return 'hsl(0, 72%, 40%)'
  if (pct < 70) return 'hsl(38, 82%, 44%)'
  return 'hsl(142, 65%, 34%)'
}

// Average bar uses simple diet thresholds (average across mixed behaviors is
// semantically imprecise but gives a useful at-a-glance summary).
function avgBarColor(pct: number): string {
  if (pct < 30) return 'hsl(0, 72%, 40%)'
  if (pct < 70) return 'hsl(38, 82%, 44%)'
  return 'hsl(142, 65%, 34%)'
}

function abbr(name: string): string {
  return name
    .replace('Vitamin ', 'Vit. ')
    .replace('Pantothenic Acid', 'Pantothenic')
    .replace('Polyunsaturated Fat', 'PUFA')
    .replace('Monounsaturated Fat', 'MUFA')
    .replace('Antioxidant Capacity', 'Antioxidant')
    .replace('Omega-3 Fatty Acids', 'Omega-3')
    .replace('Omega-6 Fatty Acids', 'Omega-6')
    .replace('Net Carbohydrates', 'Net Carbs')
}

export default function DietCategoryCards({ results, allNutrients }: Props) {
  // Index results by nutrientId for O(1) lookup
  const resultById = new Map(results.map((r) => [r.nutrientId, r]))

  // Group allNutrients by category in canonical order
  const grouped = new Map<string, NutrientMeta[]>()
  for (const { value } of NUTRIENT_GROUP_LIST) grouped.set(value, [])
  for (const n of allNutrients) {
    const list = grouped.get(n.nutrient_category)
    if (list) list.push(n)
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {NUTRIENT_GROUP_LIST.map(({ value: cat, label }) => {
        const nutrients = grouped.get(cat) ?? []
        if (nutrients.length === 0) return null

        // Category average — only over nutrients that have an RDA target in results
        const tracked = nutrients.filter((n) => resultById.has(n.nutrient_id))
        const avgPctDV =
          tracked.length > 0
            ? tracked.reduce((sum, n) => sum + (resultById.get(n.nutrient_id)?.pctDV ?? 0), 0) /
              tracked.length
            : 0
        const avgPct = avgPctDV * 100

        return (
          <div
            key={cat}
            className="bg-slate-800/50 border border-slate-700 rounded-lg p-3"
          >
            {/* Category header */}
            <p className="text-[11px] font-semibold text-slate-200 mb-2">{label}</p>

            {/* Category-average bar */}
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[9px] text-slate-500 font-medium w-8 flex-shrink-0">avg</span>
              <div className="flex-1 h-3 bg-slate-700 rounded-sm overflow-hidden relative">
                <div
                  className="h-full rounded-sm transition-all duration-300"
                  style={{
                    width: `${Math.min(avgPct, 100)}%`,
                    backgroundColor: avgBarColor(avgPct),
                  }}
                />
                <span className="absolute inset-0 flex items-center justify-end pr-1 text-[9px] text-white font-semibold leading-none">
                  {avgPct < 1 ? '<1' : Math.round(avgPct)}%
                </span>
              </div>
            </div>

            <div className="border-t border-slate-700/50 mb-2 mt-2" />

            {/* Individual nutrient mini bars */}
            <div className="space-y-0.5">
              {nutrients.map((n) => {
                const result = resultById.get(n.nutrient_id)

                // Nutrient has no RDA target — show a "—" indicator
                if (!result) {
                  return (
                    <div key={n.nutrient_id} className="flex items-center gap-1.5">
                      <span
                        className="text-[9px] text-slate-600 truncate flex-shrink-0"
                        style={{ width: 72 }}
                        title={`${n.nutrient_name} — no daily target set`}
                      >
                        {abbr(n.nutrient_name)}
                      </span>
                      <span className="text-[9px] text-slate-600 leading-none">—</span>
                    </div>
                  )
                }

                const pct = result.pctDV * 100
                const barColor = dietBarColor(
                  result.pctDV,
                  result.behavior,
                  result.upperLimit,
                  result.rdaTarget,
                )

                return (
                  <div key={n.nutrient_id} className="flex items-center gap-1.5">
                    <span
                      className="text-[9px] text-slate-400 truncate flex-shrink-0"
                      style={{ width: 72 }}
                      title={n.nutrient_name}
                    >
                      {abbr(n.nutrient_name)}
                    </span>
                    <div className="flex-1 h-2.5 bg-slate-700 rounded-sm overflow-hidden relative">
                      <div
                        className="h-full rounded-sm transition-all duration-300"
                        style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: barColor }}
                      />
                      <span className="absolute inset-0 flex items-center justify-end pr-0.5 text-[8px] text-white/90 font-medium leading-none">
                        {pct < 1 ? '<1' : Math.round(pct)}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
