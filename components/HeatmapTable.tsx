'use client'

import { useState, useMemo } from 'react'
import type { HeatmapData, NutrientCategory } from '@/types/nutrition'
import { FOOD_CATEGORY_LIST, ALL_NUTRIENT_CATEGORIES } from '@/lib/filterConstants'
import { getPortionSize } from '@/lib/portionSizes'
import type { ProfileId, RDAValues } from '@/lib/rdaProfiles'
import { getProfile, NUTRIENT_BEHAVIORS, NUTRIENT_UPPER_LIMITS } from '@/lib/rdaProfiles'
import HeatmapCell from './HeatmapCell'
import FilterPanel from './FilterPanel'
import NutrientSidebar from './NutrientSidebar'

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
  // Filter / view state
  const [selectedFoods, setSelectedFoods] = useState<string[]>([...FOOD_CATEGORY_LIST])
  const [selectedNutrients, setSelectedNutrients] = useState<NutrientCategory[]>([...ALL_NUTRIENT_CATEGORIES])
  const [search, setSearch] = useState('')
  const [perServing, setPerServing] = useState(false)

  // Sort state
  const [sortNutrientId, setSortNutrientId] = useState<number | null>(null)
  const [sortAsc, setSortAsc] = useState(false)

  // % Daily Value profile state
  const [rdaProfileId, setRdaProfileId] = useState<ProfileId | null>(null)
  const [customRdaValues, setCustomRdaValues] = useState<RDAValues>({})

  const activeRdaProfile = useMemo(
    () => getProfile(rdaProfileId, customRdaValues),
    [rdaProfileId, customRdaValues]
  )

  const visibleNutrients = useMemo(() => {
    return data.nutrients.filter((n) => selectedNutrients.includes(n.nutrient_category as NutrientCategory))
  }, [data.nutrients, selectedNutrients])

  // p10/p90 ranges — recomputed in per-serving mode
  const activeRanges = useMemo(() => {
    if (!perServing) return data.columnRanges

    const columnValues: Record<number, number[]> = {}
    for (const food of data.foods) {
      const multiplier = getPortionSize(food.food_id).grams / 100
      for (const [nIdStr, value] of Object.entries(food.nutrients)) {
        if (value === null || value === undefined) continue
        const nId = Number(nIdStr)
        if (!columnValues[nId]) columnValues[nId] = []
        columnValues[nId].push((value as number) * multiplier)
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

  const visibleFoods = useMemo(() => {
    let foods = data.foods

    foods = foods.filter((f) => selectedFoods.includes(f.category))

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      foods = foods.filter((f) => f.food_name.toLowerCase().includes(q))
    }

    if (sortNutrientId !== null) {
      foods = [...foods].sort((a, b) => {
        const mA = perServing ? getPortionSize(a.food_id).grams / 100 : 1
        const mB = perServing ? getPortionSize(b.food_id).grams / 100 : 1
        const av = (a.nutrients[sortNutrientId] ?? -Infinity) * mA
        const bv = (b.nutrients[sortNutrientId] ?? -Infinity) * mB
        return sortAsc ? av - bv : bv - av
      })
    }

    return foods
  }, [data.foods, selectedFoods, search, sortNutrientId, sortAsc, perServing])

  function handleColumnClick(nutrientId: number) {
    if (sortNutrientId === nutrientId) {
      setSortAsc((prev) => !prev)
    } else {
      setSortNutrientId(nutrientId)
      setSortAsc(false)
    }
  }

  // Sticky left offsets
  const categoryLeft = 160
  const servingLeft  = categoryLeft + 110

  return (
    <>
      <FilterPanel
        selectedFoods={selectedFoods}
        selectedNutrients={selectedNutrients}
        search={search}
        perServing={perServing}
        rdaProfileId={rdaProfileId}
        customRdaValues={customRdaValues}
        nutrients={data.nutrients}
        onFoodsChange={setSelectedFoods}
        onNutrientsChange={setSelectedNutrients}
        onSearchChange={setSearch}
        onPerServingChange={setPerServing}
        onRdaProfileChange={setRdaProfileId}
        onCustomRdaValuesChange={setCustomRdaValues}
      />

      {/* Thin status bar */}
      <p className="text-xs text-slate-500 mb-2">
        {visibleFoods.length} food{visibleFoods.length !== 1 ? 's' : ''} ·{' '}
        {visibleNutrients.length} nutrient{visibleNutrients.length !== 1 ? 's' : ''}
        {perServing && <span className="ml-2 text-emerald-500">· per serving</span>}
        {activeRdaProfile && (
          <span className="ml-2 text-violet-400">
            · % DV — {activeRdaProfile.label}
          </span>
        )}
        {sortNutrientId !== null && (
          <span className="ml-2">
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

      {/* Table + nutrient profile sidebar */}
      <div className="flex gap-2 items-start">

        {/* Scrollable table */}
        <div className="overflow-auto rounded-lg border border-slate-700 shadow-lg max-h-[calc(100vh-130px)] flex-1 min-w-0">
          <table className="border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-100">
                <th className="sticky top-0 left-0 z-30 bg-slate-950 px-3 py-2 text-left font-semibold whitespace-nowrap min-w-[160px] border-r border-b border-slate-700">
                  Food
                </th>
                <th
                  style={{ left: categoryLeft }}
                  className="sticky top-0 z-30 bg-slate-950 px-2 py-2 text-left font-semibold whitespace-nowrap min-w-[110px] border-r border-b border-slate-700"
                >
                  Category
                </th>
                {perServing && (
                  <th
                    style={{ left: servingLeft }}
                    className="sticky top-0 z-30 bg-slate-950 px-2 py-2 text-left font-semibold whitespace-nowrap min-w-[90px] border-r border-b border-slate-700 text-emerald-400"
                  >
                    Serving
                  </th>
                )}
                {visibleNutrients.map((n) => (
                  <th
                    key={n.nutrient_id}
                    onClick={() => handleColumnClick(n.nutrient_id)}
                    title={`Sort by ${n.nutrient_name} (${n.unit})`}
                    className={`sticky top-0 z-20 px-1 py-2 text-center font-medium whitespace-nowrap cursor-pointer select-none hover:bg-slate-800 transition-colors min-w-[3rem] border-b border-slate-700 ${
                      sortNutrientId === n.nutrient_id ? 'bg-slate-700' : 'bg-slate-950'
                    }`}
                  >
                    <span className="block text-[10px] leading-tight text-slate-200">
                      {n.nutrient_name.replace('Vitamin ', 'Vit. ')}
                    </span>
                    <span className="block text-[9px] text-slate-500 font-normal">
                      {activeRdaProfile
                        ? (activeRdaProfile.values[n.nutrient_name] != null ? '% DV' : n.unit)
                        : n.unit}
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
                    <td className={`sticky left-0 z-10 px-3 py-1 font-medium text-slate-100 whitespace-nowrap border-r border-slate-700 min-w-[160px] ${rowBg}`}>
                      {food.food_name}
                    </td>
                    <td
                      style={{ left: categoryLeft }}
                      className={`sticky z-10 px-2 py-1 text-slate-400 whitespace-nowrap border-r border-slate-700 min-w-[110px] ${rowBg}`}
                    >
                      {food.category}
                    </td>
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
                    {visibleNutrients.map((n) => {
                      const raw = food.nutrients[n.nutrient_id] ?? null
                      const value = raw !== null ? raw * multiplier : null
                      const range = activeRanges[n.nutrient_id] ?? { min: 0, max: 0 }

                      // DV mode props
                      const rdaTarget = activeRdaProfile
                        ? (activeRdaProfile.values[n.nutrient_name] ?? null)
                        : undefined
                      const behavior = NUTRIENT_BEHAVIORS[n.nutrient_name] ?? 'normal'
                      const ulValue  = NUTRIENT_UPPER_LIMITS[n.nutrient_name]

                      return (
                        <HeatmapCell
                          key={n.nutrient_id}
                          value={value}
                          min={range.min}
                          max={range.max}
                          unit={n.unit}
                          nutrientName={n.nutrient_name}
                          foodName={food.food_name}
                          rdaTarget={rdaTarget}
                          behavior={behavior}
                          ulValue={ulValue}
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

        {/* Nutrient average profile sidebar */}
        <NutrientSidebar
          nutrients={data.nutrients}
          visibleFoods={visibleFoods}
          columnRanges={activeRanges}
          perServing={perServing}
          rdaProfile={activeRdaProfile}
        />

      </div>
    </>
  )
}
