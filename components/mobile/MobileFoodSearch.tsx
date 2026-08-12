'use client'

import { useMemo, useState } from 'react'
import type { FoodRow } from '@/types/nutrition'
import { FOOD_CATEGORY_LIST } from '@/lib/filterConstants'

interface MobileFoodSearchProps {
  foods: FoodRow[]
  onSelect: (food: FoodRow) => void
}

const MAX_RESULTS = 20

export default function MobileFoodSearch({ foods, onSelect }: MobileFoodSearchProps) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>('')

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.trim().toLowerCase()
    return foods
      .filter((f) => (category ? f.category === category : true))
      .filter((f) => f.food_name.toLowerCase().includes(q))
      .slice(0, MAX_RESULTS)
  }, [foods, query, category])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          type="search"
          inputMode="text"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search foods…"
          className="flex-1 min-w-0 text-base bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-lg px-3 py-3 outline-none focus:ring-2 focus:ring-violet-500"
        />
        {/* TODO(Ph-6): replace native select with a bottom-sheet / pill-row category picker (Ph-7 "No Native Selects" audit) */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="text-sm bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-2 outline-none"
        >
          <option value="">All</option>
          {FOOD_CATEGORY_LIST.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {query.trim() === '' ? (
        <p className="text-sm text-slate-500 px-1">Search for a food to see its nutrients</p>
      ) : results.length === 0 ? (
        <p className="text-sm text-slate-500 px-1">No foods match &ldquo;{query}&rdquo;</p>
      ) : (
        <div className="flex flex-col divide-y divide-slate-800 rounded-lg overflow-hidden border border-slate-800">
          {results.map((food) => (
            <button
              key={food.food_id}
              type="button"
              data-food-name={food.food_name.toLowerCase()}
              onClick={() => onSelect(food)}
              className="flex items-center justify-between px-3 py-3 bg-slate-900 text-left active:bg-slate-800 touch-manipulation"
            >
              <span className="text-sm text-slate-100 truncate">{food.food_name}</span>
              <span className="text-xs text-slate-500 shrink-0 ml-2">{food.category}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
