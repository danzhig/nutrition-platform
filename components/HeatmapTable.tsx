'use client'

import { useState, useMemo } from 'react'
import type { HeatmapData, NutrientCategory } from '@/types/nutrition'
import { getPortionSize } from '@/lib/portionSizes'
import HeatmapCell from './HeatmapCell'
import CategoryFilter from './CategoryFilter'

interface Props {
  data: HeatmapData
}

/** Linear-interpolation percentile on a pre-sorted array. */
function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0
  const idx = (p / 100) * (sorted.length - 1)
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  if (lo === hi) return sorted[lo]
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo)
}

export default function HeatmapTable({ data }: Props) {
  const [foodCategory, setFoodCategory] = useState<string>('All')
  const [nutrientCategory, setNutrientCategory] = useState<NutrientCategory>('All')
  const [search, setSearch] = useState('')
  const [sortNutrientId, setSortNutrientId] = useState<number | null>(null)
  const [sortAsc, setSortAsc] = useState(false)
  const [perServing, setPerServing] = useState(false)

  const visibleNutrients = useMemo(() => {
    if (nutrientCategory === 'All') return data.nutrients
    return data.nutrients.filter((n) => n.nutrient_category === nutrientCategory)
  }, [data.nutrients, nutrientCategory])

  // Per-serving column ranges: recompute p10/p90 using scaled values so the
  // colour scale reflects actual serving amounts, not per-100g.
  const servingColumnRanges = useMemo(() => {
    if (!perServing) return data.columnRanges

    const columnValues: Record<number, number[]> = {}
    for (const food of data.foods) {
      const portion = getPortionSize(food.food_id)
      const multiplier = portion.grams / 100
      for (const [nIdStr, value] of Object.entries(food.nutrients)) {
        if (value === null || value === undefined) continue
        const nId = Number(nIdStr)
        if (!columnValues[nId]) columnValues[nId] = []
        columnValues[nId].push(value * multiplier)
      }
    }

    const ranges: Record<number, { min: number; max: number }> = {}
    for (const [nIdStr, values] of Object.entries(columnValues)) {
      values.sort((a, b) => a - b)
      ranges[Number(nIdStr)] = {
        min: percentile(values, 10),
        max: percentile(values, 90),
      }
    }
    return ranges
  }, [data.foods, data.columnRanges, perServing])

  const activeRanges = perServing ? servingColumnRanges : data.columnRanges

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
        const multiplierA = perServing ? getPortionSize(a.food_id).grams / 100 : 1
        const multiplierB = perServing ? getPortionSize(b.food_id).grams / 100 : 1
        const av = (a.nutrients[sortNutrientId] ?? -Infinity) * multiplierA
        const bv = (b.nutrients[sortNutrientId] ?? -Infinity) * multiplierB
        return sortAsc ? av - bv : bv - av
      })
    }

    return foods
  }, [data.foods, foodCategory, search, sortNutrientId, sortAsc, perServing])

  function handleColumnClick(nutrientId: number) {
    if (sortNutrientId === nutrientId) {
      setSortAsc((prev) => !prev)
    } else {
      setSortNutrientId(nutrientId)
      setSortAsc(false)
    }
  }

  // Sticky left offsets: Food (160px) + Category (110px) + optional Serving (90px)
  const categoryLeft = 160
  const servingLeft = categoryLeft + 110
  const firstNutrientLeft = servingLeft + (perServing ? 90 : 0)

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
        <div className="flex items-center gap-3">
          {/* Per serving toggle */}
          <button
            onClick={() => setPerServing((v) => !v)}
            title={perServing ? 'Switch to per 100g' : 'Switch to per serving'}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              perServing
                ? 'bg-emerald-600 border-emerald-500 text-white'
                : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 hover:text-white'
            }`}
          >
            <span className={`inline-block w-7 h-4 rounded-full relative transition-colors ${perServing ? 'bg-emerald-400' : 'bg-slate-500'}`}>
              <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all ${perServing ? 'left-3.5' : 'left-0.5'}`} />
            </span>
            {perServing ? 'Per serving' : 'Per 100g'}
          </button>

          <input
            type="search"
            placeholder="Search foods…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-56 px-3 py-1.5 text-sm bg-slate-700 border border-slate-600 text-slate-100 placeholder-slate-400 rounded-lg outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
      </div>

      {/* Row count + mode note */}
      <p className="text-xs text-slate-500">
        {visibleFoods.length} food{visibleFoods.length !== 1 ? 's' : ''} ·{' '}
        {visibleNutrients.length} nutrient{visibleNutrients.length !== 1 ? 's' : ''}
        {perServing && <span className="ml-2 text-emerald-500">· values scaled to typical serving size</span>}
        {sortNutrientId !== null && (
          <span className="ml-2 text-slate-500">
            · sorted by{' '}
            <span className="font-medium text-slate-300">
              {data.nutrients.find((n) => n.nutrient_id === sortNutrientId)?.nutrient_name}
            </span>{' '}
            ({sortAsc ? 'low → high' : 'high → low'})
            <button
              onClick={() => { setSortNutrientId(null); setSortAsc(false) }}
              className="ml-1 text-slate-500 hover:text-slate-300"
              title="Clear sort"
            >
              ✕
            </button>
          </span>
        )}
      </p>

      {/* Scrollable table */}
      <div className="overflow-auto rounded-lg border border-slate-700 shadow-lg">
        <table className="border-collapse text-xs">
          <thead>
            <tr className="sticky top-0 z-10 bg-slate-950 text-slate-100">
              {/* Food name — always sticky at left-0 */}
              <th className="sticky left-0 z-20 bg-slate-950 px-3 py-2 text-left font-semibold whitespace-nowrap min-w-[160px] border-r border-slate-700">
                Food
              </th>
              {/* Category — sticky after food */}
              <th
                style={{ left: categoryLeft }}
                className="sticky z-20 bg-slate-950 px-2 py-2 text-left font-semibold whitespace-nowrap min-w-[110px] border-r border-slate-700"
              >
                Category
              </th>
              {/* Serving size column — only visible in per-serving mode */}
              {perServing && (
                <th
                  style={{ left: servingLeft }}
                  className="sticky z-20 bg-slate-950 px-2 py-2 text-left font-semibold whitespace-nowrap min-w-[90px] border-r border-slate-700 text-emerald-400"
                >
                  Serving
                </th>
              )}
              {/* Nutrient columns */}
              {visibleNutrients.map((n) => (
                <th
                  key={n.nutrient_id}
                  onClick={() => handleColumnClick(n.nutrient_id)}
                  title={`Sort by ${n.nutrient_name} (${n.unit})`}
                  className={`px-1 py-2 text-center font-medium whitespace-nowrap cursor-pointer select-none hover:bg-slate-800 transition-colors min-w-[3rem] ${
                    sortNutrientId === n.nutrient_id ? 'bg-slate-700' : ''
                  }`}
                >
                  <span className="block text-[10px] leading-tight text-slate-200">
                    {n.nutrient_name.replace('Vitamin ', 'Vit. ')}
                  </span>
                  <span className="block text-[9px] text-slate-500 font-normal">
                    {n.unit}
                  </span>
                  {sortNutrientId === n.nutrient_id && (
                    <span className="text-[9px] text-slate-300">{sortAsc ? '▲' : '▼'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleFoods.map((food, i) => {
              const portion = getPortionSize(food.food_id)
              const multiplier = perServing ? portion.grams / 100 : 1
              const rowBg = i % 2 === 0 ? 'bg-slate-900' : 'bg-slate-800'

              return (
                <tr key={food.food_id} className={i % 2 === 0 ? 'bg-slate-900' : 'bg-slate-800/50'}>
                  {/* Sticky food name */}
                  <td className={`sticky left-0 z-10 px-3 py-1 font-medium text-slate-100 whitespace-nowrap border-r border-slate-700 min-w-[160px] ${rowBg}`}>
                    {food.food_name}
                  </td>
                  {/* Sticky category */}
                  <td
                    style={{ left: categoryLeft }}
                    className={`sticky z-10 px-2 py-1 text-slate-400 whitespace-nowrap border-r border-slate-700 min-w-[110px] ${rowBg}`}
                  >
                    {food.category}
                  </td>
                  {/* Sticky serving size — only in per-serving mode */}
                  {perServing && (
                    <td
                      style={{ left: servingLeft }}
                      className={`sticky z-10 px-2 py-1 whitespace-nowrap border-r border-slate-700 min-w-[90px] ${rowBg}`}
                      title={`${portion.grams}g`}
                    >
                      <span className="text-emerald-400 font-medium">{portion.grams}g</span>
                      <span className="text-slate-500 ml-1">{portion.label}</span>
                    </td>
                  )}
                  {/* Nutrient cells */}
                  {visibleNutrients.map((n) => {
                    const raw = food.nutrients[n.nutrient_id] ?? null
                    const value = raw !== null ? raw * multiplier : null
                    const range = activeRanges[n.nutrient_id] ?? { min: 0, max: 0 }
                    return (
                      <HeatmapCell
                        key={n.nutrient_id}
                        value={value}
                        min={range.min}
                        max={range.max}
                        unit={n.unit}
                        nutrientName={n.nutrient_name}
                        foodName={food.food_name}
                      />
                    )
                  })}
                </tr>
              )
            })}
            {visibleFoods.length === 0 && (
              <tr>
                <td
                  colSpan={visibleNutrients.length + (perServing ? 3 : 2)}
                  className="py-12 text-center text-slate-500 bg-slate-900"
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
