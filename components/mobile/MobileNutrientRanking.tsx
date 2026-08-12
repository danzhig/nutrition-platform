'use client'

import { useMemo } from 'react'
import type { FoodRow } from '@/types/nutrition'
import { getPortionSize } from '@/lib/portionSizes'

interface MobileNutrientRankingProps {
  nutrientId: number
  foods: FoodRow[]
  unit: 'serving' | '100g'
  limit?: number
  onSelectFood?: (food: FoodRow) => void
}

export default function MobileNutrientRanking({
  nutrientId,
  foods,
  unit,
  limit = 5,
  onSelectFood,
}: MobileNutrientRankingProps) {
  const ranked = useMemo(() => {
    return foods
      .map((food) => {
        const per100g = food.nutrients[nutrientId]
        if (per100g === null || per100g === undefined) return null
        const grams = unit === 'serving' ? getPortionSize(food.food_id).grams : 100
        return { food, value: per100g * (grams / 100) }
      })
      .filter((row): row is { food: FoodRow; value: number } => row !== null && row.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, limit)
  }, [nutrientId, foods, unit, limit])

  if (ranked.length === 0) {
    return <p className="text-xs text-slate-500 px-1">No food data available.</p>
  }

  const maxValue = ranked[0].value

  return (
    <div className="flex flex-col gap-2">
      {ranked.map(({ food, value }) => (
        <button
          key={food.food_id}
          type="button"
          onClick={() => onSelectFood?.(food)}
          className="text-left active:opacity-70 touch-manipulation"
        >
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-sm text-slate-200 truncate">{food.food_name}</span>
            <span className="text-xs text-slate-400 shrink-0">{formatValue(value)}</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-violet-500"
              style={{ width: `${Math.max(4, (value / maxValue) * 100)}%` }}
            />
          </div>
        </button>
      ))}
    </div>
  )
}

function formatValue(value: number): string {
  if (Math.abs(value) >= 100) return value.toFixed(0)
  if (Math.abs(value) >= 10) return value.toFixed(1)
  return value.toFixed(2)
}
