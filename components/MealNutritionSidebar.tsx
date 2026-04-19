'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import type { NutrientMeta, FoodRow } from '@/types/nutrition'
import type { RDAProfile } from '@/lib/rdaProfiles'
import { NUTRIENT_BEHAVIORS, NUTRIENT_UPPER_LIMITS, FOOD_METRIC_TARGETS } from '@/lib/rdaProfiles'
import { rdaCellColor } from '@/lib/rdaColorScale'
import type { Meal } from '@/types/meals'
import NutrientInfoCard from './NutrientInfoCard'

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
  const [infoNutrient, setInfoNutrient] = useState<NutrientMeta | null>(null)
  const [infoAnchor, setInfoAnchor] = useState<DOMRect | null>(null)

  const handleNutrientClick = useCallback((n: NutrientMeta, e: React.MouseEvent) => {
    if (!n.body_role) return
    if (infoNutrient?.nutrient_id === n.nutrient_id) {
      setInfoNutrient(null)
      setInfoAnchor(null)
    } else {
      setInfoNutrient(n)
      setInfoAnchor((e.currentTarget as HTMLElement).getBoundingClientRect())
    }
  }, [infoNutrient])

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

  // Resolve nutrient IDs for special-cased nutrients
  const giNutrientId = useMemo(
    () => nutrients.find((n) => n.nutrient_name === 'Glycemic Index')?.nutrient_id ?? null,
    [nutrients]
  )
  const carbsNutrientId = useMemo(
    () => nutrients.find((n) => n.nutrient_name === 'Carbohydrates')?.nutrient_id ?? null,
    [nutrients]
  )

  // Compute total nutrient values for the active meal selection.
  // GI is excluded here — it gets a carb-weighted average instead (see below).
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
          if (nId === giNutrientId) continue  // handled separately
          t[nId] = (t[nId] ?? 0) + (value as number) * multiplier
        }
      }
    }
    return t
  }, [activeMeals, foodsById, giNutrientId])

  // Carbohydrate-weighted average GI across all items that have both GI and carb data.
  // null = no carb-containing foods in the active selection (meats, oils, etc.).
  const weightedGI = useMemo<number | null>(() => {
    if (giNutrientId === null || carbsNutrientId === null) return null
    let sumGIxCarbs = 0
    let sumCarbs = 0
    for (const meal of activeMeals) {
      for (const item of meal.items) {
        const food = foodsById.get(item.food_id)
        if (!food) continue
        const multiplier = item.grams / 100
        const gi = food.nutrients[giNutrientId]
        const carbs = food.nutrients[carbsNutrientId]
        if (gi == null || carbs == null) continue
        const carbAmount = (carbs as number) * multiplier
        if (carbAmount > 0) {
          sumGIxCarbs += (gi as number) * carbAmount
          sumCarbs += carbAmount
        }
      }
    }
    return sumCarbs > 0 ? Math.round(sumGIxCarbs / sumCarbs) : null
  }, [activeMeals, foodsById, giNutrientId, carbsNutrientId])

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
    <>
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
                    const isGI = n.nutrient_id === giNutrientId

                    // GI uses carb-weighted average; all others use summed total
                    const effectiveTotal: number | null = isGI
                      ? weightedGI
                      : (totals[n.nutrient_id] ?? 0) > 0 || totals[n.nutrient_id] !== undefined
                        ? (totals[n.nutrient_id] ?? 0)
                        : 0

                    const rdaTarget = rdaProfile != null
                      ? (rdaProfile.values[n.nutrient_name] ?? FOOD_METRIC_TARGETS[n.nutrient_name] ?? null)
                      : null
                    const pct = rdaTarget != null && effectiveTotal !== null
                      ? (effectiveTotal / rdaTarget) * 100
                      : null
                    const behavior = NUTRIENT_BEHAVIORS[n.nutrient_name] ?? 'normal'
                    const ulValue = NUTRIENT_UPPER_LIMITS[n.nutrient_name]
                    const ulPct = rdaTarget != null && ulValue != null
                      ? (ulValue / rdaTarget) * 100
                      : undefined

                    // 100% DV = full bar
                    const barWidth = pct !== null ? Math.min(pct, 100) : 0
                    const barColor = pct !== null
                      ? rdaCellColor(pct, behavior, ulPct)
                      : (effectiveTotal ?? 0) > 0 ? '#475569' : '#334155'

                    const hasCap = behavior === 'limit' || behavior === 'normal-with-ul'

                    // Label shown when no DV profile is active
                    const rawVal = effectiveTotal ?? 0
                    const displayVal = isGI && effectiveTotal === null
                      ? null  // handled as N/A below
                      : rawVal === 0
                        ? null
                        : rawVal < 1
                          ? rawVal.toFixed(2)
                          : rawVal < 100
                            ? rawVal.toFixed(1)
                            : Math.round(rawVal).toString()

                    const isSelected = infoNutrient?.nutrient_id === n.nutrient_id
                    const isClickable = !!n.body_role

                    return (
                      <div
                        key={n.nutrient_id}
                        className={`flex items-center gap-1.5 px-1 rounded transition-colors ${
                          isClickable ? 'cursor-pointer hover:bg-slate-700/60' : ''
                        } ${isSelected ? 'bg-slate-700/60 ring-1 ring-violet-500/40' : ''}`}
                        onMouseDown={isClickable ? (e) => handleNutrientClick(n, e) : undefined}
                        title={isClickable ? `Click to learn about ${n.nutrient_name}` : undefined}
                      >
                        <div
                          className="flex items-center gap-0.5 flex-shrink-0"
                          style={{ width: 110 }}
                        >
                          {hasCap && (
                            <span
                              className="text-amber-400 text-[9px] flex-shrink-0 leading-none"
                              title={
                                behavior === 'limit'
                                  ? `${n.nutrient_name}: lower is better — this is a daily cap`
                                  : `${n.nutrient_name}: has a recommended upper limit`
                              }
                            >
                              ⚠
                            </span>
                          )}
                          <span
                            className={`truncate ${isClickable ? 'text-slate-200' : 'text-slate-300'}`}
                            title={n.nutrient_name}
                          >
                            {abbr(n.nutrient_name)}
                          </span>
                          {isClickable && (
                            <span className="text-slate-600 text-[8px] flex-shrink-0 ml-0.5">ⓘ</span>
                          )}
                        </div>
                        <div className="flex-1 h-3.5 bg-slate-700 rounded-sm overflow-hidden relative">
                          {pct !== null && (
                            <div
                              className="h-full rounded-sm transition-all duration-300"
                              style={{ width: `${barWidth}%`, backgroundColor: barColor }}
                            />
                          )}
                          {pct === null && (effectiveTotal ?? 0) > 0 && (
                            <div
                              className="h-full rounded-sm"
                              style={{ width: '100%', backgroundColor: barColor }}
                            />
                          )}
                          {/* % label (DV mode) */}
                          {pct !== null && (
                            <span className="absolute inset-0 flex items-center justify-end pr-1 text-[9px] text-white font-medium leading-none">
                              {pct < 1 ? '<1' : Math.round(pct)}%
                            </span>
                          )}
                          {/* Raw value label (no DV profile) */}
                          {pct === null && displayVal && (
                            <span className="absolute inset-0 flex items-center justify-end pr-1 text-[9px] text-slate-300 leading-none">
                              {displayVal} {n.unit}
                            </span>
                          )}
                          {/* GI N/A — plan has no carb-containing foods */}
                          {isGI && effectiveTotal === null && hasAnyItems && (
                            <span className="absolute inset-0 flex items-center justify-end pr-1 text-[9px] text-slate-500 leading-none">
                              N/A
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

    {infoNutrient && infoAnchor && (
      <NutrientInfoCard
        nutrient={infoNutrient}
        anchorRect={infoAnchor}
        onClose={() => { setInfoNutrient(null); setInfoAnchor(null) }}
      />
    )}
    </>
  )
}
