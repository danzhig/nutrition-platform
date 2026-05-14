'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import type { HeatmapData } from '@/types/nutrition'
import type { RDAProfile } from '@/lib/rdaProfiles'
import type { DietFood } from '@/lib/dietStorage'
import { loadDietList, saveDietList, clearLocalDietList } from '@/lib/dietStorage'
import {
  computeDietProfile,
  type FoodNutrientMap,
  type DietNutrientResult,
  type DietFoodComposition,
} from '@/lib/dietProfile'
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

const INFO_TOOLTIP =
  'Rate foods by how often you eat them per month. Ratings are scaled by typical serving sizes and normalized to your daily food weight, so the nutrition results always reflect a realistic full day of eating.'

export default function DietView({ data, rdaProfile }: Props) {
  const { user } = useAuth()
  const [selectedFoods, setSelectedFoods] = useState<DietFood[]>([])
  const [loaded, setLoaded] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [infoPos, setInfoPos] = useState<{ x: number; y: number } | null>(null)
  const infoButtonRef = useRef<HTMLButtonElement>(null)
  const prevUserIdRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    const prevId = prevUserIdRef.current
    const currentId = user?.id
    prevUserIdRef.current = currentId

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

  const foodNames = useMemo(
    () => new Map(data.foods.map((f) => [f.food_id, f.food_name])),
    [data.foods]
  )

  const foodNutrients = useMemo<FoodNutrientMap>(() => {
    const map: FoodNutrientMap = {}
    for (const food of data.foods) {
      map[food.food_id] = food.nutrients
    }
    return map
  }, [data.foods])

  const dailyWeightG = rdaProfile?.dailyWeightG ?? 1700

  const { results: dietResults, compositions: dietCompositions } = useMemo<{
    results: DietNutrientResult[]
    compositions: DietFoodComposition[]
  }>(() => {
    if (!rdaProfile) return { results: [], compositions: [] }
    return computeDietProfile(
      selectedFoods,
      foodNutrients,
      rdaProfile,
      data.nutrients,
      foodNames,
    )
  }, [selectedFoods, foodNutrients, rdaProfile, data.nutrients, foodNames])

  const dietSuggestions = useMemo<SuggestedFood[]>(() => {
    if (!rdaProfile || selectedFoods.length === 0 || dietResults.length === 0) return []
    return computeDietSuggestions(
      selectedFoods,
      dietResults,
      foodNutrients,
      data.foods,
      dailyWeightG,
    )
  }, [selectedFoods, dietResults, foodNutrients, data.foods, rdaProfile, dailyWeightG])

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
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-slate-200">Your Diet</p>
              {/* Info icon */}
              <div className="flex-shrink-0">
                <button
                  ref={infoButtonRef}
                  className="w-4 h-4 rounded-full border border-slate-600 text-slate-500 hover:text-slate-300 hover:border-slate-400 transition-colors text-[9px] font-bold leading-none flex items-center justify-center"
                  onMouseEnter={() => {
                    if (infoButtonRef.current) {
                      const r = infoButtonRef.current.getBoundingClientRect()
                      setInfoPos({ x: r.right, y: r.top + r.height / 2 })
                    }
                    setShowInfo(true)
                  }}
                  onMouseLeave={() => setShowInfo(false)}
                >
                  i
                </button>
                {showInfo && infoPos && (
                  <div
                    className="fixed ml-2 w-56 px-2.5 py-2 bg-slate-900 border border-slate-600 rounded text-[10px] text-slate-300 leading-relaxed z-[9999] shadow-xl pointer-events-none -translate-y-1/2"
                    style={{ left: infoPos.x, top: infoPos.y }}
                  >
                    {INFO_TOOLTIP}
                  </div>
                )}
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              How often do you eat each food per month?
            </p>
          </div>
          <div className="flex-1 overflow-hidden min-h-0">
            <DietSelectedFoods
              foods={selectedFoods}
              foodMeta={foodMeta}
              compositions={dietCompositions}
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
              selectedFoods={selectedFoods}
              dailyWeightG={dailyWeightG}
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

export type { Props as DietViewProps }
