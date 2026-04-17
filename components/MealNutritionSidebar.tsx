'use client'

import { useState, useMemo, useEffect } from 'react'
import type { NutrientMeta, FoodRow } from '@/types/nutrition'
import type { RDAProfile } from '@/lib/rdaProfiles'
import { NUTRIENT_BEHAVIORS, NUTRIENT_UPPER_LIMITS } from '@/lib/rdaProfiles'
import { rdaCellColor } from '@/lib/rdaColorScale'
import type { Meal } from '@/types/meals'

interface Props {
  nutrients: NutrientMeta[]
  meals: Meal[]
  foodsById: Map<number, FoodRow>
  rdaProfile: RDAProfile | null
}

const CATEGORY_ORDER = ['Macronutrient', 'Vitamin', 'Mineral', 'Fatty Acid', 'Amino Acid', 'Food Metric']

function abbr(name: string): string {
  return name
    .replace('Vitamin ', 'Vit. ')
    .replace('Pantothenic Acid', 'Pantothenic')
    .replace('Polyunsaturated Fat', 'PUFA')
    .replace('Monounsaturated Fat', 'MUFA')
    .replace('Antioxidant Capacity', 'Antioxidant')
    .replace('Omega-3 Fatty Acids', 'Omega-3')
    .replace('Omega-6 Fatty Acids', 'Omega-6')
}

export default function MealNutritionSidebar({ nutrients, meals, foodsById, rdaProfile }: Props) {
  // 'all' = full plan; meal id = individual meal
  const [viewId, setViewId] = useState<'all' | string>('all')

  // If the selected meal is deleted, fall back to full plan
  useEffect(() => {
    if (viewId !== 'all' && !meals.some((m) => m.id === viewId)) {
      setViewId('all')
    }
  }, [meals, viewId])

  const activeMeals = useMemo(
    () => (viewId === 'all' ? meals : meals.filter((m) => m.id === viewId)),
    [meals, viewId]
  )

  // Compute total nutrient values for the active meal selection
  const totals = useMemo<Record<number, number>>(() => {
    const t: Record<number, number> = {}
    for (const meal of activeMeals) {
      for (const item of meal.items) {
        const food = foodsById.get(item.food_id)
        if (!food) continue
        const multiplier = item.grams / 100
        for (const [nIdStr, value] of Object.entries(food.nutrients)) {
          if (value === null || value === undefined) continue
          const nId = Number(nIdStr)
          t[nId] = (t[nId] ?? 0) + (value as number) * multiplier
        }
      }
    }
    return t
  }, [activeMeals, foodsById])

  const hasAnyItems = meals.some((m) => m.items.length > 0)
  const mealsWithItems = meals.filter((m) => m.items.length > 0)

  const grouped = useMemo(() => {
    const groups: Record<string, NutrientMeta[]> = {}
    for (const n of nutrients) {
      if (!groups[n.nutrient_category]) groups[n.nutrient_category] = []
      groups[n.nutrient_category].push(n)
    }
    return groups
  }, [nutrients])

  return (
    <div className="w-72 flex-shrink-0 bg-slate-800 border border-slate-700 rounded-lg overflow-y-auto max-h-[calc(100vh-130px)] text-xs">
      <div className="sticky top-0 bg-slate-800 border-b border-slate-700 z-10">
        {/* Title row */}
        <div className="px-3 pt-2 pb-1.5">
          <p className="text-slate-300 font-semibold text-xs">
            {rdaProfile ? `% Daily Value — ${rdaProfile.shortLabel}` : 'Total Nutrients'}
          </p>
          {!rdaProfile && (
            <p className="text-slate-500 text-[10px] mt-0.5">Select a profile above to see % daily value</p>
          )}
        </div>

        {/* Meal selector — only shown when there are multiple meals with items */}
        {mealsWithItems.length > 1 && (
          <div className="px-3 pb-2 flex flex-wrap gap-1">
            <button
              onClick={() => setViewId('all')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                viewId === 'all'
                  ? 'bg-violet-600 text-white'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              Full Plan
            </button>
            {mealsWithItems.map((meal) => (
              <button
                key={meal.id}
                onClick={() => setViewId(meal.id)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors max-w-[90px] truncate ${
                  viewId === meal.id
                    ? 'bg-violet-600 text-white'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
                title={meal.name}
              >
                {meal.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {!hasAnyItems ? (
        <p className="text-slate-500 text-[11px] text-center py-8 px-4">
          Add foods to your meals to see nutrition totals.
        </p>
      ) : (
        <div className="px-2 py-2 space-y-3">
          {CATEGORY_ORDER.map((cat) => {
            const group = grouped[cat]
            if (!group?.length) return null
            return (
              <div key={cat}>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 px-1">
                  {cat}
                </p>
                <div className="space-y-0.5">
                  {group.map((n) => {
                    const total = totals[n.nutrient_id] ?? 0
                    const rdaTarget = rdaProfile?.values[n.nutrient_name] ?? null
                    const pct = rdaTarget != null ? (total / rdaTarget) * 100 : null
                    const behavior = NUTRIENT_BEHAVIORS[n.nutrient_name] ?? 'normal'
                    const ulValue = NUTRIENT_UPPER_LIMITS[n.nutrient_name]
                    const ulPct = rdaTarget != null && ulValue != null
                      ? (ulValue / rdaTarget) * 100
                      : undefined
                    // Bar fills to 200% max
                    const barWidth = pct !== null ? Math.min(pct, 200) / 200 * 100 : 0
                    const barColor = pct !== null
                      ? rdaCellColor(pct, behavior, ulPct)
                      : total > 0 ? '#475569' : '#334155'

                    // Display value
                    const displayVal = total === 0
                      ? null
                      : total < 1
                        ? total.toFixed(2)
                        : total < 100
                          ? total.toFixed(1)
                          : Math.round(total).toString()

                    return (
                      <div key={n.nutrient_id} className="flex items-center gap-1.5 px-1">
                        <span
                          className="text-slate-300 truncate flex-shrink-0"
                          style={{ width: 110 }}
                          title={n.nutrient_name}
                        >
                          {abbr(n.nutrient_name)}
                        </span>
                        <div className="flex-1 h-3.5 bg-slate-700 rounded-sm overflow-hidden relative">
                          {(pct !== null || total > 0) && (
                            <div
                              className="h-full rounded-sm transition-all duration-300"
                              style={{ width: `${barWidth}%`, backgroundColor: barColor }}
                            />
                          )}
                          {pct !== null && (
                            <span className="absolute inset-0 flex items-center justify-end pr-1 text-[9px] text-white font-medium leading-none">
                              {pct < 1 ? '<1' : Math.round(pct)}%
                            </span>
                          )}
                          {pct === null && displayVal && (
                            <span className="absolute inset-0 flex items-center justify-end pr-1 text-[9px] text-slate-300 leading-none">
                              {displayVal}{n.unit}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
