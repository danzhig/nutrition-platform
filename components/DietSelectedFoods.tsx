'use client'

import type { FoodRow } from '@/types/nutrition'
import type { DietFood } from '@/lib/dietStorage'
import type { DietFoodComposition } from '@/lib/dietProfile'
import DietFrequencyControl from './DietFrequencyControl'
import DietCompositionBar from './DietCompositionBar'

interface Props {
  foods: DietFood[]
  foodMeta: Map<number, FoodRow>
  compositions: DietFoodComposition[]
  monthlyBudgetG: number
  onFrequencyChange: (foodId: number, daysPerWeek: number) => void
  onRemove: (foodId: number) => void
  onClearAll: () => void
}

export default function DietSelectedFoods({
  foods,
  foodMeta,
  compositions,
  monthlyBudgetG,
  onFrequencyChange,
  onRemove,
  onClearAll,
}: Props) {
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
      {/* Monthly fill bar */}
      <DietCompositionBar compositions={compositions} monthlyBudgetG={monthlyBudgetG} />

      {/* Food list */}
      <div className="flex-1 overflow-y-auto min-h-0 py-1">
        {foods.map(({ foodId, daysPerWeek }) => {
          const food = foodMeta.get(foodId)
          const name = food?.food_name ?? `Food #${foodId}`
          return (
            <div
              key={foodId}
              className="flex items-center gap-2 px-3 py-2 border-b border-slate-700/40 last:border-b-0"
            >
              <span className="flex-1 min-w-0 text-[11px] text-slate-300 truncate" title={name}>
                {name}
              </span>
              <DietFrequencyControl
                value={daysPerWeek}
                onChange={(d) => onFrequencyChange(foodId, d)}
              />
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
