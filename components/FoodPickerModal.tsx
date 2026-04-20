'use client'

import { useState, useMemo, useCallback } from 'react'
import type { FoodRow, NutrientMeta } from '@/types/nutrition'
import type { Meal } from '@/types/meals'
import type { RDAProfile } from '@/lib/rdaProfiles'
import { FOOD_CATEGORY_LIST } from '@/lib/filterConstants'
import { getPortionSize } from '@/lib/portionSizes'
import { computeComplementScore } from '@/lib/complementScore'

interface Props {
  foods: FoodRow[]
  onAdd: (food: FoodRow) => void
  onClose: () => void
  currentMeals: Meal[]
  nutrients: NutrientMeta[]
  rdaProfile: RDAProfile | null
  foodsById: Map<number, FoodRow>
}

const ALL_CATEGORIES = ['All', ...FOOD_CATEGORY_LIST] as const

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 65
    ? 'text-emerald-400 border-emerald-700/60 bg-emerald-900/30'
    : score >= 35
    ? 'text-amber-400 border-amber-700/60 bg-amber-900/20'
    : 'text-slate-500 border-slate-600 bg-slate-800'
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] font-semibold tabular-nums flex-shrink-0 ${color}`}>
      {score}
    </span>
  )
}

export default function FoodPickerModal({ foods, onAdd, onClose, currentMeals, nutrients, rdaProfile, foodsById }: Props) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('All')
  const [recentlyAdded, setRecentlyAdded] = useState<Set<number>>(new Set())

  const handleAdd = useCallback((food: FoodRow) => {
    onAdd(food)
    setRecentlyAdded((prev) => new Set(prev).add(food.food_id))
    setTimeout(() => {
      setRecentlyAdded((prev) => {
        const next = new Set(prev)
        next.delete(food.food_id)
        return next
      })
    }, 1200)
  }, [onAdd])

  const foodScores = useMemo<Map<number, number>>(() => {
    const map = new Map<number, number>()
    if (!rdaProfile) return map
    for (const food of foods) {
      const portion = getPortionSize(food.food_id)
      const score = computeComplementScore(
        [{ food_id: food.food_id, grams: portion.grams }],
        currentMeals,
        nutrients,
        rdaProfile,
        foodsById,
      )
      map.set(food.food_id, score)
    }
    return map
  }, [foods, currentMeals, nutrients, rdaProfile, foodsById])

  const filtered = useMemo(() => {
    let list = foods
    if (category !== 'All') list = list.filter((f) => f.category === category)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter((f) => f.food_name.toLowerCase().includes(q))
    }
    if (rdaProfile) {
      list = [...list].sort((a, b) => (foodScores.get(b.food_id) ?? 0) - (foodScores.get(a.food_id) ?? 0))
    }
    return list
  }, [foods, category, search, rdaProfile, foodScores])

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
          <h2 className="text-sm font-semibold text-slate-100">Add Food</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1 rounded-md bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-colors"
            >
              Done
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 text-lg leading-none w-6 h-6 flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pt-3 pb-2">
          <input
            type="text"
            placeholder="Search foods…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500"
          />
        </div>

        {/* Category filter */}
        <div className="px-4 pb-2 flex flex-wrap gap-1">
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                category === cat
                  ? 'bg-violet-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Count */}
        <div className="px-4 pb-1">
          <span className="text-[11px] text-slate-500">{filtered.length} food{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Food list */}
        <div className="overflow-y-auto flex-1 px-4 pb-3">
          {filtered.length === 0 ? (
            <p className="text-center text-slate-500 py-8 text-sm">No foods found.</p>
          ) : (
            <div className="space-y-0.5">
              {filtered.map((food) => {
                const portion = getPortionSize(food.food_id)
                const added = recentlyAdded.has(food.food_id)
                return (
                  <button
                    key={food.food_id}
                    onClick={() => handleAdd(food)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left transition-colors group ${
                      added ? 'bg-violet-900/40' : 'hover:bg-slate-700'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-slate-100">{food.food_name}</span>
                      <span className="text-[11px] text-slate-500 ml-2">{food.category}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[11px] text-slate-400">
                        {portion.label} · {portion.grams}g
                      </span>
                      {rdaProfile && foodScores.has(food.food_id) && (
                        <ScoreBadge score={foodScores.get(food.food_id)!} />
                      )}
                      <span className={`text-[11px] font-medium transition-opacity ${
                        added
                          ? 'text-green-400 opacity-100'
                          : 'text-violet-400 opacity-0 group-hover:opacity-100'
                      }`}>
                        {added ? '✓ Added' : '+ Add'}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
