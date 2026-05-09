'use client'

import { useMemo } from 'react'
import type { FoodRow } from '@/types/nutrition'
import type { DietFood } from '@/lib/dietStorage'
import { RATING_MULTIPLIERS } from '@/lib/dietProfile'
import { getPortionSize } from '@/lib/portionSizes'
import DietRatingControl from './DietRatingControl'

interface Props {
  foods: DietFood[]
  foodMeta: Map<number, FoodRow>
  dailyWeightG: number
  onRatingChange: (foodId: number, rating: number) => void
  onRemove: (foodId: number) => void
  onClearAll: () => void
}

interface WeightBand {
  color: string
  barColor: string
  label: string
}

function getWeightBand(pct: number): WeightBand {
  if (pct <= 90)  return { color: 'text-amber-400', barColor: 'bg-amber-500',  label: 'Under — raise some ratings or add foods' }
  if (pct <= 110) return { color: 'text-emerald-400', barColor: 'bg-emerald-500', label: 'On target — ratings look calibrated' }
  if (pct <= 150) return { color: 'text-amber-400', barColor: 'bg-amber-500',  label: 'Over — consider lowering some ratings' }
  return           { color: 'text-red-400',   barColor: 'bg-red-500',    label: 'Well over — ratings are too aggressive' }
}

export default function DietSelectedFoods({
  foods,
  foodMeta,
  dailyWeightG,
  onRatingChange,
  onRemove,
  onClearAll,
}: Props) {
  const monthlyTarget = dailyWeightG * 30

  const totalMonthlyWeightG = useMemo(() => {
    return foods.reduce((sum, { foodId, rating }) => {
      const portionG = getPortionSize(foodId).grams
      return sum + portionG * RATING_MULTIPLIERS[rating]
    }, 0)
  }, [foods])

  const pct = monthlyTarget > 0 ? (totalMonthlyWeightG / monthlyTarget) * 100 : 0
  const band = getWeightBand(pct)
  const barFill = Math.min(pct, 100)

  // Empty state
  if (foods.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center px-4 text-center">
          <p className="text-slate-500 text-xs leading-relaxed">
            Add foods from the left panel<br />to build your diet profile
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Weight indicator */}
      <div className="px-4 py-3 border-b border-slate-700 flex-shrink-0 space-y-1.5">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-slate-500">Monthly target</span>
          <span className="text-slate-400 font-medium">{(monthlyTarget / 1000).toFixed(0)} kg</span>
        </div>
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-slate-500">Your diet implies</span>
          <span className={`font-semibold ${band.color}`}>
            {(totalMonthlyWeightG / 1000).toFixed(1)} kg&nbsp;
            <span className="font-normal opacity-80">({Math.round(pct)}%)</span>
          </span>
        </div>
        {/* Fill bar */}
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${band.barColor}`}
            style={{ width: `${barFill}%` }}
          />
        </div>
        <p className={`text-[9px] ${band.color} leading-none`}>{band.label}</p>
      </div>

      {/* Food list */}
      <div className="flex-1 overflow-y-auto min-h-0 py-1">
        {foods.map(({ foodId, rating }) => {
          const food = foodMeta.get(foodId)
          const name = food?.food_name ?? `Food #${foodId}`
          return (
            <div
              key={foodId}
              className="flex items-center gap-2 px-3 py-2 border-b border-slate-700/40 last:border-b-0"
            >
              {/* Food name */}
              <span className="flex-1 min-w-0 text-[11px] text-slate-300 truncate" title={name}>
                {name}
              </span>
              {/* Rating control */}
              <DietRatingControl value={rating} onChange={(r) => onRatingChange(foodId, r)} />
              {/* Remove */}
              <button
                onClick={() => onRemove(foodId)}
                className="ml-1 text-slate-600 hover:text-red-400 transition-colors text-xs leading-none flex-shrink-0"
                title="Remove"
              >
                ✕
              </button>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-700 flex-shrink-0">
        <span className="text-[10px] text-slate-500">
          {foods.length} food{foods.length !== 1 ? 's' : ''}
        </span>
        <button
          onClick={onClearAll}
          className="text-[10px] text-slate-500 hover:text-red-400 transition-colors"
        >
          Clear all
        </button>
      </div>
    </div>
  )
}
