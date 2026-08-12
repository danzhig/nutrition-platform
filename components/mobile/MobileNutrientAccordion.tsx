'use client'

import { useEffect, useState } from 'react'
import type { FoodRow, NutrientMeta } from '@/types/nutrition'
import type { RDAProfile } from '@/lib/rdaProfiles'
import { NUTRIENT_BEHAVIORS, NUTRIENT_UPPER_LIMITS, FOOD_METRIC_TARGETS } from '@/lib/rdaProfiles'
import { NUTRIENT_GROUP_LIST } from '@/lib/filterConstants'
import type { NutritionUnit } from './MobileUnitToggle'
import MobileNutrientRow from './MobileNutrientRow'

const LS_OPEN_GROUPS = 'np:m:nutrient-groups'
const DEFAULT_OPEN = ['Macronutrient']

interface MobileNutrientAccordionProps {
  food: FoodRow
  allNutrients: NutrientMeta[]
  selectedGrams: number
  unit: NutritionUnit
  rdaProfile: RDAProfile | null
  onNutrientTap?: (nutrient: NutrientMeta) => void
}

export default function MobileNutrientAccordion({
  food,
  allNutrients,
  selectedGrams,
  unit,
  rdaProfile,
  onNutrientTap,
}: MobileNutrientAccordionProps) {
  const [openGroups, setOpenGroups] = useState<string[]>(DEFAULT_OPEN)

  useEffect(() => {
    const saved = localStorage.getItem(LS_OPEN_GROUPS)
    if (saved) {
      try {
        setOpenGroups(JSON.parse(saved))
      } catch { /* ignore */ }
    }
  }, [])

  function toggleGroup(value: string) {
    setOpenGroups((cur) => {
      const next = cur.includes(value) ? cur.filter((g) => g !== value) : [...cur, value]
      localStorage.setItem(LS_OPEN_GROUPS, JSON.stringify(next))
      return next
    })
  }

  return (
    <div className="flex flex-col gap-2">
      {NUTRIENT_GROUP_LIST.map((group) => {
        const members = allNutrients.filter((n) => n.nutrient_category === group.value)
        const isOpen = openGroups.includes(group.value)

        return (
          <div key={group.value} className="rounded-lg border border-slate-800 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleGroup(group.value)}
              className="w-full flex items-center justify-between px-3 min-h-11 py-2.5 bg-slate-800/60 active:bg-slate-800 touch-manipulation"
            >
              <span className="text-sm font-medium text-slate-200">{group.label}</span>
              <span className={`text-slate-500 text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`}>▾</span>
            </button>

            <div
              className="grid transition-[grid-template-rows] duration-200"
              style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
            >
              <div className="overflow-hidden">
                <div className="divide-y divide-slate-800/60">
                  {members.map((nutrient) => {
                    const per100g = food.nutrients[nutrient.nutrient_id] ?? null
                    const behavior = NUTRIENT_BEHAVIORS[nutrient.nutrient_name] ?? 'normal'
                    const rdaTarget =
                      rdaProfile?.values[nutrient.nutrient_name] ??
                      FOOD_METRIC_TARGETS[nutrient.nutrient_name] ??
                      null

                    let displayValue: number | null = null
                    if (per100g !== null) {
                      if (unit === '100g') displayValue = per100g
                      else displayValue = per100g * (selectedGrams / 100)
                    }

                    let pctDv: number | null = null
                    if (per100g !== null && rdaTarget) {
                      pctDv = (per100g * (selectedGrams / 100) / rdaTarget) * 100
                    }

                    const upperLimit = NUTRIENT_UPPER_LIMITS[nutrient.nutrient_name]
                    const upperLimitPct =
                      behavior === 'normal-with-ul' && upperLimit && rdaTarget
                        ? (upperLimit / rdaTarget) * 100
                        : undefined

                    return (
                      <button
                        key={nutrient.nutrient_id}
                        type="button"
                        onClick={() => onNutrientTap?.(nutrient)}
                        className="w-full text-left active:bg-slate-800/60 touch-manipulation"
                      >
                        <MobileNutrientRow
                          name={nutrient.nutrient_name}
                          value={unit === 'pct' ? pctDv : displayValue}
                          unit={unit === 'pct' ? '%' : nutrient.unit}
                          pctDv={pctDv}
                          behavior={behavior}
                          upperLimitPct={upperLimitPct}
                          showBar={unit === 'pct'}
                        />
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
