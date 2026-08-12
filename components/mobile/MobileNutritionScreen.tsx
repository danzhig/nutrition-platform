'use client'

import { useEffect, useState } from 'react'
import type { FoodRow, NutrientMeta } from '@/types/nutrition'
import type { RDAProfile } from '@/lib/rdaProfiles'
import { getPortionSize } from '@/lib/portionSizes'
import { addEntry } from '@/lib/foodLogStorage'
import MobileFoodSearch from './MobileFoodSearch'
import MobileGramInput from './MobileGramInput'
import MobileUnitToggle, { type NutritionUnit } from './MobileUnitToggle'
import MobileNutrientAccordion from './MobileNutrientAccordion'

const LS_FOOD_ID = 'np:m:nutrition-food-id'
const LS_GRAMS = 'np:m:nutrition-grams'
const LS_UNIT = 'np:m:nutrition-unit'

interface MobileNutritionScreenProps {
  foods: FoodRow[]
  allNutrients: NutrientMeta[]
  rdaProfile: RDAProfile | null
  userId: string | null
  onOpenNutrientSheet: (nutrientName: string) => void
  onSwitchToAccount?: () => void
  jumpToFood: FoodRow | null
  onJumpHandled: () => void
}

export default function MobileNutritionScreen({
  foods,
  allNutrients,
  rdaProfile,
  userId,
  onOpenNutrientSheet,
  onSwitchToAccount,
  jumpToFood,
  onJumpHandled,
}: MobileNutritionScreenProps) {
  const [selectedFood, setSelectedFood] = useState<FoodRow | null>(null)
  const [selectedGrams, setSelectedGrams] = useState<number>(100)
  const [unit, setUnit] = useState<NutritionUnit>('pct')
  const [hydrated, setHydrated] = useState(false)
  const [logging, setLogging] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

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

  // A nutrient info sheet's "top foods" list can request a jump to a
  // different food — handled here so the search bar collapses correctly.
  useEffect(() => {
    if (jumpToFood) {
      handleSelectFood(jumpToFood)
      onJumpHandled()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jumpToFood])

  function handleSelectFood(food: FoodRow) {
    setSelectedFood(food)
    setSelectedGrams(getPortionSize(food.food_id).grams)
  }

  async function handleLogToToday() {
    if (!selectedFood) return
    if (!userId) {
      onSwitchToAccount?.()
      return
    }
    setLogging(true)
    try {
      await addEntry({
        log_date: new Date().toISOString().slice(0, 10),
        entry_type: 'food',
        label: selectedFood.food_name,
        items: [{
          food_id: selectedFood.food_id,
          food_name: selectedFood.food_name,
          amount_g: selectedGrams,
          mode: 'grams',
        }],
        source_id: null,
        notes: null,
      })
      setToast(`Logged ${selectedFood.food_name} (${selectedGrams}g) to today`)
      setTimeout(() => setToast(null), 1500)
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Failed to log food')
      setTimeout(() => setToast(null), 1500)
    } finally {
      setLogging(false)
    }
  }

  return (
    <div className="p-4 flex flex-col gap-4" style={{ paddingBottom: selectedFood ? 140 : undefined }}>
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

          <MobileNutrientAccordion
            food={selectedFood}
            allNutrients={allNutrients}
            selectedGrams={selectedGrams}
            unit={unit}
            rdaProfile={rdaProfile}
            onNutrientTap={(nutrient) => onOpenNutrientSheet(nutrient.nutrient_name)}
          />

          <div
            className="fixed inset-x-0 z-30 px-4"
            style={{ bottom: 'calc(56px + env(safe-area-inset-bottom))' }}
          >
            <button
              type="button"
              onClick={handleLogToToday}
              disabled={logging}
              className="w-full py-3 rounded-xl bg-violet-600 disabled:opacity-60 text-white text-sm font-semibold shadow-lg active:opacity-80 active:scale-[0.98] transition-transform duration-150 touch-manipulation"
            >
              {userId ? `+ Log ${selectedGrams}g to Today` : 'Sign in to log'}
            </button>
          </div>

          {toast && (
            <div
              className="fixed inset-x-4 z-40 rounded-lg bg-slate-700 border border-slate-600 px-4 py-2.5 text-center text-xs text-slate-100 shadow-xl transition-opacity"
              style={{ bottom: 'calc(56px + env(safe-area-inset-bottom) + 64px)' }}
            >
              {toast}
            </div>
          )}
        </>
      )}
    </div>
  )
}
