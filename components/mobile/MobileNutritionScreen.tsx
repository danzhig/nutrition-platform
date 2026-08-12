'use client'

import { useEffect, useState } from 'react'
import type { FoodRow } from '@/types/nutrition'
import type { RDAProfile } from '@/lib/rdaProfiles'
import { getPortionSize } from '@/lib/portionSizes'
import MobileFoodSearch from './MobileFoodSearch'
import MobileGramInput from './MobileGramInput'
import MobileUnitToggle, { type NutritionUnit } from './MobileUnitToggle'

const LS_FOOD_ID = 'np:m:nutrition-food-id'
const LS_GRAMS = 'np:m:nutrition-grams'
const LS_UNIT = 'np:m:nutrition-unit'

interface MobileNutritionScreenProps {
  foods: FoodRow[]
  rdaProfile: RDAProfile | null
}

export default function MobileNutritionScreen({ foods, rdaProfile }: MobileNutritionScreenProps) {
  const [selectedFood, setSelectedFood] = useState<FoodRow | null>(null)
  const [selectedGrams, setSelectedGrams] = useState<number>(100)
  const [unit, setUnit] = useState<NutritionUnit>('pct')
  const [hydrated, setHydrated] = useState(false)

  // Restore persisted selection after mount (avoids SSR hydration mismatch).
  useEffect(() => {
    const savedFoodId = localStorage.getItem(LS_FOOD_ID)
    const savedGrams = localStorage.getItem(LS_GRAMS)
    const savedUnit = localStorage.getItem(LS_UNIT)

    if (savedFoodId) {
      const food = foods.find((f) => f.food_id === Number(savedFoodId))
      if (food) {
        setSelectedFood(food)
        setSelectedGrams(savedGrams ? Number(savedGrams) : getPortionSize(food.food_id).grams)
      }
    }
    if (savedUnit === 'pct' || savedUnit === 'serving' || savedUnit === '100g') {
      setUnit(savedUnit)
    }
    setHydrated(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!hydrated) return
    if (selectedFood) {
      localStorage.setItem(LS_FOOD_ID, String(selectedFood.food_id))
      localStorage.setItem(LS_GRAMS, String(selectedGrams))
    } else {
      localStorage.removeItem(LS_FOOD_ID)
      localStorage.removeItem(LS_GRAMS)
    }
  }, [hydrated, selectedFood, selectedGrams])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(LS_UNIT, unit)
  }, [hydrated, unit])

  function handleSelectFood(food: FoodRow) {
    setSelectedFood(food)
    setSelectedGrams(getPortionSize(food.food_id).grams)
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      {!selectedFood && <MobileFoodSearch foods={foods} onSelect={handleSelectFood} />}

      {selectedFood && (
        <>
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-100 truncate">{selectedFood.food_name}</p>
              <button
                type="button"
                onClick={() => setSelectedFood(null)}
                className="text-xs text-violet-400"
              >
                × change food
              </button>
            </div>
            <MobileGramInput grams={selectedGrams} onChange={setSelectedGrams} />
          </div>

          <MobileUnitToggle value={unit} onChange={setUnit} />

          {!rdaProfile && unit === 'pct' && (
            <p className="text-xs text-amber-400/80 px-1">
              Set a DV Profile to see %DV values.
            </p>
          )}

          <div className="p-4 text-slate-500 text-sm text-center border border-dashed border-slate-800 rounded-lg">
            Nutrient list coming in Phase 4b
          </div>
        </>
      )}
    </div>
  )
}
