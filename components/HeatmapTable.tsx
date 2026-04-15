'use client'

import { useState, useMemo } from 'react'
import type { HeatmapData, NutrientCategory } from '@/types/nutrition'
import HeatmapCell from './HeatmapCell'
import CategoryFilter from './CategoryFilter'

interface Props {
  data: HeatmapData
}

export default function HeatmapTable({ data }: Props) {
  const [foodCategory, setFoodCategory] = useState<string>('All')
  const [nutrientCategory, setNutrientCategory] = useState<NutrientCategory>('All')
  const [search, setSearch] = useState('')
  const [sortNutrientId, setSortNutrientId] = useState<number | null>(null)
  const [sortAsc, setSortAsc] = useState(false)

  // Filter nutrient columns
  const visibleNutrients = useMemo(() => {
    if (nutrientCategory === 'All') return data.nutrients
    return data.nutrients.filter((n) => n.nutrient_category === nutrientCategory)
  }, [data.nutrients, nutrientCategory])

  // Filter food rows
  const visibleFoods = useMemo(() => {
    let foods = data.foods

    if (foodCategory !== 'All') {
      foods = foods.filter((f) => f.category === foodCategory)
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      foods = foods.filter((f) => f.food_name.toLowerCase().includes(q))
    }

    if (sortNutrientId !== null) {
      foods = [...foods].sort((a, b) => {
        const av = a.nutrients[sortNutrientId] ?? -Infinity
        const bv = b.nutrients[sortNutrientId] ?? -Infinity
        return sortAsc ? av - bv : bv - av
      })
    }

    return foods
  }, [data.foods, foodCategory, search, sortNutrientId, sortAsc])

  function handleColumnClick(nutrientId: number) {
    if (sortNutrientId === nutrientId) {
      setSortAsc((prev) => !prev)
    } else {
      setSortNutrientId(nutrientId)
      setSortAsc(false) // default: high → low
    }
  }

  return (
    <div className="space-y-4">
      {/* Controls bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <CategoryFilter
          selectedFood={foodCategory}
          selectedNutrient={nutrientCategory}
          onFoodChange={setFoodCategory}
          onNutrientChange={setNutrientCategory}
        />
        <input
          type="search"
          placeholder="Search foods…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-56 px-3 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-400"
        />
      </div>

      {/* Row count */}
      <p className="text-xs text-slate-400">
        {visibleFoods.length} food{visibleFoods.length !== 1 ? 's' : ''} ·{' '}
        {visibleNutrients.length} nutrient{visibleNutrients.length !== 1 ? 's' : ''}
        {sortNutrientId !== null && (
          <span className="ml-2 text-slate-500">
            sorted by{' '}
            <span className="font-medium text-slate-700">
              {data.nutrients.find((n) => n.nutrient_id === sortNutrientId)?.nutrient_name}
            </span>{' '}
            ({sortAsc ? 'low → high' : 'high → low'})
            <button
              onClick={() => { setSortNutrientId(null); setSortAsc(false) }}
              className="ml-1 text-slate-400 hover:text-slate-700"
              title="Clear sort"
            >
              ✕
            </button>
          </span>
        )}
      </p>

      {/* Scrollable table */}
      <div className="overflow-auto rounded-lg border border-slate-200 shadow-sm">
        <table className="border-collapse text-xs">
          <thead>
            <tr className="sticky top-0 z-10 bg-slate-800 text-white">
              {/* Food name column */}
              <th className="sticky left-0 z-20 bg-slate-800 px-3 py-2 text-left font-semibold whitespace-nowrap min-w-[160px]">
                Food
              </th>
              <th className="sticky left-[160px] z-20 bg-slate-800 px-2 py-2 text-left font-semibold whitespace-nowrap min-w-[110px]">
                Category
              </th>
              {visibleNutrients.map((n) => (
                <th
                  key={n.nutrient_id}
                  onClick={() => handleColumnClick(n.nutrient_id)}
                  title={`Sort by ${n.nutrient_name} (${n.unit})`}
                  className={`px-1 py-2 text-center font-medium whitespace-nowrap cursor-pointer select-none hover:bg-slate-700 transition-colors min-w-[3rem] ${
                    sortNutrientId === n.nutrient_id ? 'bg-slate-600' : ''
                  }`}
                >
                  <span className="block text-[10px] leading-tight">
                    {n.nutrient_name.replace('Vitamin ', 'Vit. ')}
                  </span>
                  <span className="block text-[9px] text-slate-400 font-normal">
                    {n.unit}
                  </span>
                  {sortNutrientId === n.nutrient_id && (
                    <span className="text-[9px]">{sortAsc ? '▲' : '▼'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleFoods.map((food, i) => (
              <tr
                key={food.food_id}
                className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
              >
                {/* Sticky food name */}
                <td
                  className={`sticky left-0 z-10 px-3 py-1 font-medium whitespace-nowrap border-r border-slate-200 min-w-[160px] ${
                    i % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                  }`}
                >
                  {food.food_name}
                </td>
                {/* Sticky category */}
                <td
                  className={`sticky left-[160px] z-10 px-2 py-1 text-slate-500 whitespace-nowrap border-r border-slate-200 min-w-[110px] ${
                    i % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                  }`}
                >
                  {food.category}
                </td>
                {/* Nutrient cells */}
                {visibleNutrients.map((n) => {
                  const range = data.columnRanges[n.nutrient_id] ?? { min: 0, max: 0 }
                  return (
                    <HeatmapCell
                      key={n.nutrient_id}
                      value={food.nutrients[n.nutrient_id] ?? null}
                      min={range.min}
                      max={range.max}
                      unit={n.unit}
                      nutrientName={n.nutrient_name}
                      foodName={food.food_name}
                    />
                  )
                })}
              </tr>
            ))}
            {visibleFoods.length === 0 && (
              <tr>
                <td
                  colSpan={visibleNutrients.length + 2}
                  className="py-12 text-center text-slate-400"
                >
                  No foods match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
