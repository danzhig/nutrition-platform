'use client'

import { useState, useMemo, useEffect } from 'react'
import type { AppData, NutrientCategory } from '@/types/nutrition'
import { FOOD_CATEGORY_LIST, ALL_NUTRIENT_CATEGORIES } from '@/lib/filterConstants'
import { getPortionSize } from '@/lib/portionSizes'
import type { RDAProfile } from '@/lib/rdaProfiles'
import { NUTRIENT_UPPER_LIMITS, FOOD_METRIC_TARGETS } from '@/lib/rdaProfiles'
import type { SavedFilterSet } from '@/lib/filterSetStorage'
import { loadFilterSets, saveFilterSet, deleteFilterSet } from '@/lib/filterSetStorage'
import { useAuth } from './AuthProvider'
import DataCell from './DataCell'
import FilterPanel from './FilterPanel'

interface Props {
  data: AppData
  rdaProfile: RDAProfile | null
}

export default function DataTable({ data, rdaProfile }: Props) {
  // Filter / view state
  const [selectedFoods, setSelectedFoods] = useState<string[]>([...FOOD_CATEGORY_LIST])
  const [selectedNutrients, setSelectedNutrients] = useState<NutrientCategory[]>([...ALL_NUTRIENT_CATEGORIES])
  const [search, setSearch] = useState('')
  const [perServing, setPerServing] = useState(false)

  // Sort state
  const [sortNutrientId, setSortNutrientId] = useState<number | null>(null)
  const [sortAsc, setSortAsc] = useState(false)

  // Filter sets from Supabase
  const { user } = useAuth()
  const [savedFilterSets, setSavedFilterSets] = useState<SavedFilterSet[]>([])

  // Load / clear filter sets when auth changes
  useEffect(() => {
    if (!user) {
      setSavedFilterSets([])
      return
    }
    loadFilterSets().then(setSavedFilterSets).catch(console.error)
  }, [user])

  async function handleSaveFilterSet(name: string) {
    const fs = await saveFilterSet(name, {
      selectedFoods,
      selectedNutrients,
      perServing,
      rdaProfileId: null,
      savedRdaProfileId: null,
    })
    setSavedFilterSets((prev) => [...prev, fs])
  }

  async function handleDeleteFilterSet(id: string) {
    await deleteFilterSet(id)
    setSavedFilterSets((prev) => prev.filter((f) => f.id !== id))
  }

  function handleApplyFilterSet(fs: SavedFilterSet) {
    const { state } = fs
    setSelectedFoods(state.selectedFoods)
    setSelectedNutrients(state.selectedNutrients as NutrientCategory[])
    setPerServing(state.perServing)
    // DV profile is now managed globally — filter sets do not change it
  }

  const visibleNutrients = useMemo(() => {
    return data.nutrients.filter((n) => selectedNutrients.includes(n.nutrient_category as NutrientCategory))
  }, [data.nutrients, selectedNutrients])

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
        savedFilterSets={savedFilterSets}
        isLoggedIn={!!user}
        onFoodsChange={setSelectedFoods}
        onNutrientsChange={setSelectedNutrients}
        onSearchChange={setSearch}
        onPerServingChange={setPerServing}
        onSaveFilterSet={handleSaveFilterSet}
        onDeleteFilterSet={handleDeleteFilterSet}
        onApplyFilterSet={handleApplyFilterSet}
      />

      {/* Thin status bar */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-slate-500">
          {visibleFoods.length} food{visibleFoods.length !== 1 ? 's' : ''} ·{' '}
          {visibleNutrients.length} nutrient{visibleNutrients.length !== 1 ? 's' : ''}
          {perServing && <span className="ml-2 text-emerald-500">· per serving</span>}
          {rdaProfile && (
            <span className="ml-2 text-violet-400">
              · % DV — {rdaProfile.label}
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
      </div>

      {/* Scrollable table */}
      <div className="overflow-auto rounded-lg border border-slate-700 shadow-lg max-h-[calc(100vh-130px)]">
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
                      {rdaProfile
                        ? (rdaProfile.values[n.nutrient_name] != null ? '% DV' : n.unit)
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
                      const rdaTarget = rdaProfile
                        ? (rdaProfile.values[n.nutrient_name] ?? FOOD_METRIC_TARGETS[n.nutrient_name] ?? null)
                        : undefined
                      const ulValue = NUTRIENT_UPPER_LIMITS[n.nutrient_name]

                      return (
                        <DataCell
                          key={n.nutrient_id}
                          value={value}
                          unit={n.unit}
                          nutrientName={n.nutrient_name}
                          foodName={food.food_name}
                          rdaTarget={rdaTarget}
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
    </>
  )
}
