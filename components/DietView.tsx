'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import type { HeatmapData } from '@/types/nutrition'
import type { RDAProfile } from '@/lib/rdaProfiles'
import type { DietFood } from '@/lib/dietStorage'
import { loadDietList, saveDietList, clearLocalDietList } from '@/lib/dietStorage'
import { computeDietProfile, type FoodNutrientMap, type DietNutrientResult } from '@/lib/dietProfile'
import { computeDietSuggestions, type SuggestedFood } from '@/lib/dietSuggestions'
import { useAuth } from './AuthProvider'
import DietFoodBrowser from './DietFoodBrowser'
import DietSelectedFoods from './DietSelectedFoods'
import DietNutrientPanel from './DietNutrientPanel'
import DietCategoryCards from './DietCategoryCards'
import DietSuggestionsPanel from './DietSuggestionsPanel'

interface Props {
  data: HeatmapData
  rdaProfile: RDAProfile | null
}

export default function DietView({ data, rdaProfile }: Props) {
  const { user } = useAuth()
  const [selectedFoods, setSelectedFoods] = useState<DietFood[]>([])
  const [loaded, setLoaded] = useState(false)
  const prevUserIdRef = useRef<string | undefined>(undefined)

  // Load on mount / auth change; clear localStorage on logout
  useEffect(() => {
    const prevId = prevUserIdRef.current
    const currentId = user?.id
    prevUserIdRef.current = currentId

    // Detect logout: had a user ID, now don't — clear local cache and reset
    if (prevId !== undefined && currentId === undefined) {
      clearLocalDietList()
      setSelectedFoods([])
      setLoaded(true)
      return
    }

    loadDietList(currentId).then((foods) => {
      setSelectedFoods(foods)
      setLoaded(true)
    })
  }, [user?.id])

  const selectedFoodIds = useMemo(
    () => new Set(selectedFoods.map((f) => f.foodId)),
    [selectedFoods]
  )

  const foodMeta = useMemo(
    () => new Map(data.foods.map((f) => [f.food_id, f])),
    [data.foods]
  )

  // foodId → nutrientId → value_per_100g — built once from the static food list
  const foodNutrients = useMemo<FoodNutrientMap>(() => {
    const map: FoodNutrientMap = {}
    for (const food of data.foods) {
      map[food.food_id] = food.nutrients
    }
    return map
  }, [data.foods])

  const dailyWeightG = rdaProfile?.dailyWeightG ?? 1700

  // Full diet coverage calculation — recomputes when foods or profile changes.
  // Returns 0% results for all nutrients when selectedFoods is empty (enables zero-state bars).
  const dietResults = useMemo<DietNutrientResult[]>(() => {
    if (!rdaProfile) return []
    return computeDietProfile(selectedFoods, foodNutrients, rdaProfile, data.nutrients)
  }, [selectedFoods, foodNutrients, rdaProfile, data.nutrients])

  // Top-10 food suggestions — recomputes when foods or results change
  const dietSuggestions = useMemo<SuggestedFood[]>(() => {
    if (!rdaProfile || selectedFoods.length === 0 || dietResults.length === 0) return []
    return computeDietSuggestions(selectedFoods, dietResults, foodNutrients, data.foods)
  }, [selectedFoods, dietResults, foodNutrients, data.foods, rdaProfile])

  function handleAdd(foodId: number) {
    if (selectedFoodIds.has(foodId)) return
    const next = [...selectedFoods, { foodId, rating: 3 }]
    setSelectedFoods(next)
    saveDietList(next, user?.id)
  }

  function handleRemove(foodId: number) {
    const next = selectedFoods.filter((f) => f.foodId !== foodId)
    setSelectedFoods(next)
    saveDietList(next, user?.id)
  }

  function handleRatingChange(foodId: number, rating: number) {
    const next = selectedFoods.map((f) => (f.foodId === foodId ? { ...f, rating } : f))
    setSelectedFoods(next)
    saveDietList(next, user?.id)
  }

  function handleClearAll() {
    setSelectedFoods([])
    saveDietList([], user?.id)
  }

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-40 text-slate-500 text-sm">
        Loading…
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* ── Three-column top section ───────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4 h-[560px]">
        {/* Panel 1 — Browse Foods */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700 flex-shrink-0">
            <p className="text-sm font-semibold text-slate-200">Browse Foods</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Click a food to add it to your diet</p>
          </div>
          <div className="flex-1 overflow-hidden min-h-0">
            <DietFoodBrowser
              foods={data.foods}
              selectedFoodIds={selectedFoodIds}
              onAdd={handleAdd}
              onRemove={handleRemove}
            />
          </div>
        </div>

        {/* Panel 2 — Your Diet */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700 flex-shrink-0">
            <p className="text-sm font-semibold text-slate-200">Your Diet</p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Rate how often you eat each food
            </p>
          </div>
          <div className="flex-1 overflow-hidden min-h-0">
            <DietSelectedFoods
              foods={selectedFoods}
              foodMeta={foodMeta}
              dailyWeightG={dailyWeightG}
              onRatingChange={handleRatingChange}
              onRemove={handleRemove}
              onClearAll={handleClearAll}
            />
          </div>
        </div>

        {/* Panel 3 — Nutrient Coverage */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700 flex-shrink-0">
            <p className="text-sm font-semibold text-slate-200">Nutrient Coverage</p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {rdaProfile ? `vs. ${rdaProfile.shortLabel}` : 'Select a DV profile to see results'}
            </p>
          </div>
          <div className="flex-1 overflow-hidden min-h-0">
            <DietNutrientPanel
              results={dietResults}
              allNutrients={data.nutrients}
              foodsById={foodMeta}
              hasSelection={selectedFoods.length > 0}
              hasProfile={rdaProfile !== null}
              allFoodNutrients={foodNutrients}
              selectedFoodIds={selectedFoodIds}
              onAddFood={handleAdd}
            />
          </div>
        </div>
      </div>

      {/* ── Category Overview ─────────────────────────────────────────────── */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-4">
        <p className="text-sm font-semibold text-slate-200 mb-3">Category Overview</p>
        <DietCategoryCards results={dietResults} allNutrients={data.nutrients} />
      </div>

      {/* ── Suggestions ───────────────────────────────────────────────────── */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-4">
        <p className="text-sm font-semibold text-slate-200 mb-3">
          Foods that would strengthen your diet
        </p>
        <DietSuggestionsPanel
          suggestions={dietSuggestions}
          onAdd={handleAdd}
          hasSelection={selectedFoods.length > 0}
          hasProfile={rdaProfile !== null}
        />
      </div>
    </div>
  )
}

// Expose handlers for future child components (Phase 4+)
export type { Props as DietViewProps }
