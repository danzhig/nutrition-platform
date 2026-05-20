'use client'

import type { FoodRow } from '@/types/nutrition'
import type { DietFood } from '@/lib/dietStorage'
import type { DietFoodComposition } from '@/lib/dietProfile'
import { getPortionSize } from '@/lib/portionSizes'
import DietFrequencyControl from './DietFrequencyControl'
import DietCompositionBar from './DietCompositionBar'

interface Props {
  foods: DietFood[]
  foodMeta: Map<number, FoodRow>
  compositions: DietFoodComposition[]
  monthlyBudgetG: number
  onFrequencyChange: (foodId: number, daysPerWeek: number) => void
  onGramsOverrideChange: (foodId: number, grams: number | undefined) => void
  onRemove: (foodId: number) => void
  onClearAll: () => void
}

export default function DietSelectedFoods({
  foods,
  foodMeta,
  compositions,
  monthlyBudgetG,
  onFrequencyChange,
  onGramsOverrideChange,
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
        {foods.map(({ foodId, daysPerWeek, gramsOverride }) => {
          const food = foodMeta.get(foodId)
          const name = food?.food_name ?? `Food #${foodId}`
          const defaultGrams = getPortionSize(foodId).grams
          const isGramsMode = gramsOverride !== undefined

          return (
            <div
              key={foodId}
              className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-700/40 last:border-b-0"
            >
              {/* Food name */}
              <span className="flex-1 min-w-0 text-[11px] text-slate-300 truncate" title={name}>
                {name}
              </span>

              {/* srv | g toggle */}
              <div className="flex rounded overflow-hidden border border-slate-600 flex-shrink-0 text-[9px]">
                <button
                  onClick={() => onGramsOverrideChange(foodId, undefined)}
                  className={`px-1.5 py-0.5 transition-colors ${
                    !isGramsMode
                      ? 'bg-violet-700 text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                  title={`Use default serving (${defaultGrams}g)`}
                >
                  srv
                </button>
                <button
                  onClick={() => {
                    if (!isGramsMode) onGramsOverrideChange(foodId, defaultGrams)
                  }}
                  className={`px-1.5 py-0.5 transition-colors ${
                    isGramsMode
                      ? 'bg-violet-700 text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                  title="Enter a custom gram amount"
                >
                  g
                </button>
              </div>

              {/* Serving hint (srv mode) or grams input (g mode) */}
              {isGramsMode ? (
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <input
                    type="number"
                    min="1"
                    max="9999"
                    value={gramsOverride}
                    onChange={(e) => {
                      const v = Math.round(Number(e.target.value))
                      if (v > 0) onGramsOverrideChange(foodId, v)
                    }}
                    className="w-14 bg-slate-700 border border-slate-600 rounded text-[10px] text-slate-200 px-1.5 py-0.5 text-right focus:outline-none focus:border-violet-500"
                  />
                  <span className="text-[9px] text-slate-500">g</span>
                </div>
              ) : (
                <span className="text-[9px] text-slate-500 flex-shrink-0 w-[52px] text-right tabular-nums">
                  {defaultGrams}g
                </span>
              )}

              {/* Days-per-week selector */}
              <DietFrequencyControl
                value={daysPerWeek}
                onChange={(d) => onFrequencyChange(foodId, d)}
              />

              {/* Remove */}
              <button
                onClick={() => onRemove(foodId)}
                className="ml-0.5 text-slate-600 hover:text-red-400 transition-colors text-xs leading-none flex-shrink-0"
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
