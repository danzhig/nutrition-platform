'use client'

import { useMemo, useState } from 'react'
import type { FoodLogEntry, FoodLogEntryType, FoodLogItem } from '@/types/calendar'
import type { NutrientMeta, FoodRow } from '@/types/nutrition'
import type { RDAProfile } from '@/lib/rdaProfiles'
import { logItemToMealItem } from '@/lib/foodLogAdapters'
import MobileVisualizationCard from './MobileVisualizationCard'

interface MobileDayLogProps {
  entries: FoodLogEntry[]
  nutrients: NutrientMeta[]
  foodsById: Map<number, FoodRow>
  rdaProfile: RDAProfile | null
  onOpenAddSheet: () => void
  onOpenNutrientSheet: (nutrientName: string) => void
}

function entryBadgeClass(type: FoodLogEntryType): string {
  if (type === 'plan') return 'bg-violet-900/50 text-violet-300 border-violet-700/50'
  if (type === 'meal') return 'bg-teal-900/50 text-teal-300 border-teal-700/50'
  return 'bg-amber-900/50 text-amber-300 border-amber-700/50'
}

const MACROS: { name: string; short: string; emoji?: string }[] = [
  { name: 'Calories', short: 'kcal', emoji: '🔥' },
  { name: 'Protein', short: 'P' },
  { name: 'Total Fat', short: 'F' },
  { name: 'Net Carbohydrates', short: 'C' },
]

export default function MobileDayLog({
  entries,
  nutrients,
  foodsById,
  rdaProfile,
  onOpenAddSheet,
  onOpenNutrientSheet,
}: MobileDayLogProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  function toggleExpanded(entryId: string) {
    setExpanded((cur) => {
      const next = new Set(cur)
      if (next.has(entryId)) next.delete(entryId)
      else next.add(entryId)
      return next
    })
  }

  const allItems = useMemo(() => entries.flatMap((e) => e.items), [entries])

  const giNutrientId = useMemo(
    () => nutrients.find((n) => n.nutrient_name === 'Glycemic Index')?.nutrient_id ?? null,
    [nutrients]
  )

  // Raw nutrient totals for the day, excluding GI (which needs a carb-weighted
  // average, not a sum — see MealNutritionSidebar.tsx / PROJECT_STATE.md).
  const totals = useMemo<Record<number, number>>(() => {
    const t: Record<number, number> = {}
    for (const item of allItems) {
      const food = foodsById.get(item.food_id)
      if (!food) continue
      const mult = item.amount_g / 100
      for (const [nIdStr, value] of Object.entries(food.nutrients)) {
        if (value === null || value === undefined) continue
        const nId = Number(nIdStr)
        if (nId === giNutrientId) continue
        t[nId] = (t[nId] ?? 0) + (value as number) * mult
      }
    }
    return t
  }, [allItems, foodsById, giNutrientId])

  const macroTotals = useMemo(() => {
    return MACROS.map((macro) => {
      const meta = nutrients.find((n) => n.nutrient_name === macro.name)
      const value = meta ? totals[meta.nutrient_id] ?? 0 : 0
      const target = meta ? rdaProfile?.values[meta.nutrient_name] ?? null : null
      const hit = target != null && target > 0 && value >= target
      return { ...macro, value, hit }
    })
  }, [nutrients, totals, rdaProfile])

  const dayMeals = useMemo(() => {
    const items = allItems.map(logItemToMealItem)
    if (items.length === 0) return []
    return [{ id: 'day-total', name: 'Day Total', items }]
  }, [allItems])

  const hasEntries = entries.length > 0

  return (
    <div className="flex flex-col gap-3 p-4 pb-32">
      {hasEntries && (
        <div className="grid grid-cols-4 gap-2">
          {macroTotals.map((m) => (
            <button
              key={m.name}
              type="button"
              onClick={() => onOpenNutrientSheet(m.name)}
              className={`flex flex-col items-center justify-center gap-0.5 rounded-lg py-2 active:opacity-70 touch-manipulation ${
                m.hit ? 'bg-violet-600/25 border border-violet-500/50' : 'bg-slate-800 border border-slate-700'
              }`}
            >
              <span className="text-xs font-semibold text-slate-100">
                {m.emoji ? `${m.emoji} ${Math.round(m.value)}` : `${m.short} ${Math.round(m.value)}g`}
              </span>
              {m.emoji && <span className="text-[9px] text-slate-500">{m.short}</span>}
            </button>
          ))}
        </div>
      )}

      {!hasEntries ? (
        <p className="text-center text-slate-500 text-sm py-10">No entries for this day.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map((entry) => {
            const isExpanded = expanded.has(entry.id)
            const groups: Record<string, FoodLogItem[]> = {}
            for (const item of entry.items) {
              const label = item.meal_label ?? 'Other'
              ;(groups[label] ??= []).push(item)
            }
            const labels = Object.keys(groups)

            return (
              <div key={entry.id} className="rounded-lg border border-slate-800 bg-slate-800/40 overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleExpanded(entry.id)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 active:bg-slate-800 touch-manipulation"
                >
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium shrink-0 ${entryBadgeClass(entry.entry_type)}`}>
                    {entry.entry_type}
                  </span>
                  <span className="text-sm text-slate-200 flex-1 min-w-0 truncate text-left">
                    {entry.label ?? entry.entry_type}
                  </span>
                  <span className={`text-slate-500 text-xs transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▾</span>
                </button>

                {isExpanded && (
                  <div className="divide-y divide-slate-800/60 border-t border-slate-800">
                    {entry.entry_type === 'plan'
                      ? labels.map((label) => (
                          <div key={label}>
                            <div className="px-3 pt-2 pb-0.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                              {label}
                            </div>
                            {groups[label].map((item, i) => (
                              <ItemRow key={`${item.food_id}-${i}`} item={item} />
                            ))}
                          </div>
                        ))
                      : entry.items.map((item, i) => <ItemRow key={`${item.food_id}-${i}`} item={item} />)}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {hasEntries && rdaProfile && dayMeals.length > 0 && (
        <MobileVisualizationCard
          nutrients={nutrients}
          foodsById={foodsById}
          meals={dayMeals}
          totals={totals}
          rdaProfile={rdaProfile}
        />
      )}

      <button
        type="button"
        onClick={onOpenAddSheet}
        className="fixed z-30 w-14 h-14 rounded-full bg-violet-600 text-white text-2xl leading-none flex items-center justify-center shadow-xl active:opacity-80 active:scale-95 transition-transform duration-150 touch-manipulation"
        style={{ bottom: 'calc(56px + env(safe-area-inset-bottom) + 16px)', right: 16 }}
        aria-label="Add entry"
      >
        +
      </button>
    </div>
  )
}

function ItemRow({ item }: { item: FoodLogItem }) {
  return (
    <div className="flex items-center justify-between px-3 py-2">
      <span className="text-xs text-slate-300 truncate pr-2">{item.food_name}</span>
      <span className="text-xs text-slate-500 shrink-0 tabular-nums">{item.amount_g}g</span>
    </div>
  )
}
