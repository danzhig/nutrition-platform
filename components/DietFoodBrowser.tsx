'use client'

import { useState, useMemo } from 'react'
import { FOOD_CATEGORY_LIST } from '@/lib/filterConstants'
import type { FoodRow } from '@/types/nutrition'

interface Props {
  foods: FoodRow[]
  selectedFoodIds: Set<number>
  onAdd: (foodId: number) => void
  onRemove: (foodId: number) => void
}

export default function DietFoodBrowser({ foods, selectedFoodIds, onAdd, onRemove }: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  function toggleCategory(cat: string) {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  function handleSearchChange(q: string) {
    setSearchQuery(q)
    // Collapse all when search is cleared
    if (!q) setExpandedCategories(new Set())
  }

  // Group all foods by category, preserving FOOD_CATEGORY_LIST order
  const foodsByCategory = useMemo(() => {
    const map = new Map<string, FoodRow[]>()
    for (const cat of FOOD_CATEGORY_LIST) map.set(cat, [])
    for (const food of foods) {
      const bucket = map.get(food.category)
      if (bucket) bucket.push(food)
    }
    return map
  }, [foods])

  const isSearching = searchQuery.trim().length > 0
  const lowerQuery = searchQuery.toLowerCase()

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Search bar */}
      <div className="px-3 py-2.5 border-b border-slate-700 flex-shrink-0">
        <div className="relative">
          <input
            type="text"
            placeholder="Search foods…"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-7 pr-7 py-1.5 text-xs bg-slate-700 border border-slate-600 text-slate-100 placeholder-slate-500 rounded-md focus:ring-1 focus:ring-violet-500 outline-none"
          />
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-[11px]">🔍</span>
          {searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-[11px] leading-none"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Category accordion */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {FOOD_CATEGORY_LIST.map((cat) => {
          const catFoods = foodsByCategory.get(cat) ?? []

          const visibleFoods = isSearching
            ? catFoods.filter((f) => f.food_name.toLowerCase().includes(lowerQuery))
            : catFoods

          // Hide category entirely when searching and nothing matches
          if (isSearching && visibleFoods.length === 0) return null

          const isExpanded = isSearching || expandedCategories.has(cat)
          const selectedCount = catFoods.filter((f) => selectedFoodIds.has(f.food_id)).length

          return (
            <div key={cat} className="border-b border-slate-700/60 last:border-b-0">
              {/* Category header */}
              <button
                onClick={() => { if (!isSearching) toggleCategory(cat) }}
                className={`w-full flex items-center justify-between px-3 py-2 text-left ${
                  isSearching ? 'cursor-default' : 'hover:bg-slate-700/40 transition-colors'
                }`}
              >
                <span className="text-[11px] font-semibold text-slate-300">
                  {cat}
                  {selectedCount > 0 && (
                    <span className="ml-1.5 text-[10px] font-normal text-violet-400">
                      ({selectedCount} selected)
                    </span>
                  )}
                </span>
                {!isSearching && (
                  <span className="text-slate-500 text-[9px] ml-1 shrink-0">
                    {isExpanded ? '▲' : '▼'}
                  </span>
                )}
              </button>

              {/* Food rows */}
              {isExpanded && (
                <div>
                  {visibleFoods.map((food) => {
                    const isSelected = selectedFoodIds.has(food.food_id)
                    return (
                      <button
                        key={food.food_id}
                        onClick={() => isSelected ? onRemove(food.food_id) : onAdd(food.food_id)}
                        className={`w-full flex items-center gap-2 pl-5 pr-3 py-1.5 text-left transition-colors border-t border-slate-700/30 ${
                          isSelected
                            ? 'bg-violet-900/25 hover:bg-violet-900/35 text-violet-200'
                            : 'hover:bg-slate-700/30 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span className="text-[10px] w-3 shrink-0 text-violet-400 font-bold">
                          {isSelected ? '✓' : ''}
                        </span>
                        <span className="text-[11px] leading-snug">{food.food_name}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
