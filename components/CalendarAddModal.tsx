'use client'

import { useState, useEffect, useMemo } from 'react'
import type { FoodRow, NutrientMeta } from '@/types/nutrition'
import type { PresetMeal } from '@/lib/presetMealStorage'
import type { SavedMeal } from '@/lib/savedMealStorage'
import type { SavedMealPlan } from '@/lib/mealStorage'
import { loadPresetMeals } from '@/lib/presetMealStorage'
import { loadSavedMeals } from '@/lib/savedMealStorage'
import { loadMealPlans } from '@/lib/mealStorage'
import { addEntry } from '@/lib/foodLogStorage'
import { FOOD_CATEGORY_LIST } from '@/lib/filterConstants'
import { getPortionSize } from '@/lib/portionSizes'
import { useAuth } from './AuthProvider'
import SizeButtons from './SizeButtons'

type Step      = 'type' | 'select'
type EntryType = 'meal' | 'plan' | 'food'
type FoodSubStep = 'search' | 'grams'

interface Props {
  targetDate: string
  foods: FoodRow[]
  nutrients: NutrientMeta[]
  foodsById: Map<number, FoodRow>
  onClose: () => void
  onAdded: () => void
}

const ALL_FOOD_CATS = ['All', ...FOOD_CATEGORY_LIST] as const

export default function CalendarAddModal({
  targetDate, foods, nutrients, foodsById, onClose, onAdded,
}: Props) {
  const { user } = useAuth()

  const [step, setStep]           = useState<Step>('type')
  const [entryType, setEntryType] = useState<EntryType | null>(null)

  // Remote data
  const [presetMeals, setPresetMeals] = useState<PresetMeal[]>([])
  const [savedMeals,  setSavedMeals]  = useState<SavedMeal[]>([])
  const [savedPlans,  setSavedPlans]  = useState<SavedMealPlan[]>([])
  const [dataLoading, setDataLoading] = useState(false)

  // Meal pane state
  const [mealCategory,  setMealCategory]  = useState('All')
  const [nutrientSort,  setNutrientSort]  = useState<number | null>(null)

  // Food picker state
  const [foodSearch,    setFoodSearch]    = useState('')
  const [foodCategory,  setFoodCategory]  = useState('All')
  const [foodSubStep,   setFoodSubStep]   = useState<FoodSubStep>('search')
  const [selectedFood,  setSelectedFood]  = useState<FoodRow | null>(null)
  const [gramsInput,    setGramsInput]    = useState('')

  // Submit
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  const displayDate = new Date(targetDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  })

  // Load remote data on mount
  useEffect(() => {
    setDataLoading(true)
    const loads: Promise<unknown>[] = [
      loadPresetMeals().then(setPresetMeals),
    ]
    if (user) {
      loads.push(loadSavedMeals().then(setSavedMeals))
      loads.push(loadMealPlans().then(setSavedPlans))
    }
    Promise.all(loads).catch(console.error).finally(() => setDataLoading(false))
  }, [user])

  // Derived: preset categories
  const presetCategories = useMemo(() => {
    const cats = Array.from(new Set(presetMeals.map(p => p.category))).sort()
    return ['All', ...cats]
  }, [presetMeals])

  // Nutrient sort dropdown groups (shared across meal and food pickers)
  const nutrientGroups = useMemo(() => {
    const groups: Record<string, { nutrient_id: number; nutrient_name: string }[]> = {}
    for (const n of nutrients) {
      if (!groups[n.nutrient_category]) groups[n.nutrient_category] = []
      groups[n.nutrient_category].push({ nutrient_id: n.nutrient_id, nutrient_name: n.nutrient_name })
    }
    return Object.entries(groups)
  }, [nutrients])

  const nutrientSortMeta = useMemo(
    () => nutrientSort !== null ? nutrients.find(n => n.nutrient_id === nutrientSort) ?? null : null,
    [nutrientSort, nutrients]
  )

  function nutrientBadge(items: { food_id: number; grams: number }[]): string | null {
    if (nutrientSort === null || !nutrientSortMeta) return null
    const nid = nutrientSort
    const val = items.reduce((acc, item) => {
      const food = foodsById.get(item.food_id)
      const v = food?.nutrients[nid]
      return acc + (v != null ? (v as number) * item.grams / 100 : 0)
    }, 0)
    const d = val < 1 ? val.toFixed(2) : val < 100 ? val.toFixed(1) : Math.round(val).toString()
    return `${d}${nutrientSortMeta.unit}`
  }

  // Filtered + sorted preset meals (no complement scores — recording, not deciding)
  const filteredPresets = useMemo(() => {
    let list = mealCategory === 'All' ? presetMeals : presetMeals.filter(p => p.category === mealCategory)
    if (nutrientSort !== null) {
      const nid = nutrientSort
      list = [...list].sort((a, b) => {
        const sum = (pm: PresetMeal) => pm.items.reduce((acc, item) => {
          const v = foodsById.get(item.food_id)?.nutrients[nid]
          return acc + (v != null ? (v as number) * item.grams / 100 : 0)
        }, 0)
        return sum(b) - sum(a)
      })
    }
    return list
  }, [presetMeals, mealCategory, nutrientSort, foodsById])

  const filteredSavedMeals = useMemo(() => {
    let list = [...savedMeals]
    if (nutrientSort !== null) {
      const nid = nutrientSort
      list.sort((a, b) => {
        const sum = (sm: SavedMeal) => sm.items.reduce((acc, item) => {
          const v = foodsById.get(item.food_id)?.nutrients[nid]
          return acc + (v != null ? (v as number) * item.grams / 100 : 0)
        }, 0)
        return sum(b) - sum(a)
      })
    }
    return list
  }, [savedMeals, nutrientSort, foodsById])

  // Filtered + sorted foods
  const filteredFoods = useMemo(() => {
    let list = foods
    if (foodCategory !== 'All') list = list.filter(f => f.category === foodCategory)
    if (foodSearch.trim()) {
      const q = foodSearch.trim().toLowerCase()
      list = list.filter(f => f.food_name.toLowerCase().includes(q))
    }
    if (nutrientSort !== null) {
      const nid = nutrientSort
      list = [...list].sort((a, b) => {
        const val = (f: FoodRow) => {
          const v = f.nutrients[nid]
          return v != null ? (v as number) * getPortionSize(f.food_id).grams / 100 : 0
        }
        return val(b) - val(a)
      })
    }
    return list
  }, [foods, foodCategory, foodSearch, nutrientSort])

  // ── Action handlers ─────────────────────────────────────────────────────────

  async function handleLogMeal(meal: PresetMeal | SavedMeal) {
    setSubmitting(true); setError(null)
    try {
      await addEntry({
        log_date:   targetDate,
        entry_type: 'meal',
        label:      meal.name,
        items: meal.items.map(item => ({
          food_id:    item.food_id,
          food_name:  foodsById.get(item.food_id)?.food_name ?? `Food ${item.food_id}`,
          amount_g:   item.grams,
          mode:       'grams' as const,
          meal_label: meal.name,
        })),
        source_id: meal.id,
        notes: null,
      })
      onAdded()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to log entry')
      setSubmitting(false)
    }
  }

  async function handleLogPlan(plan: SavedMealPlan) {
    setSubmitting(true); setError(null)
    try {
      await addEntry({
        log_date:   targetDate,
        entry_type: 'plan',
        label:      plan.name,
        items: plan.meals.flatMap(meal =>
          meal.items.map(item => ({
            food_id:    item.food_id,
            food_name:  item.food_name,
            amount_g:   item.grams,
            mode:       item.mode,
            meal_label: meal.name,
          }))
        ),
        source_id: plan.id,
        notes: null,
      })
      onAdded()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to log entry')
      setSubmitting(false)
    }
  }

  function handleSelectFood(food: FoodRow) {
    const portion = getPortionSize(food.food_id)
    setSelectedFood(food)
    setGramsInput(String(portion.grams))
    setFoodSubStep('grams')
  }

  async function handleLogFood() {
    if (!selectedFood) return
    const g = parseFloat(gramsInput)
    if (isNaN(g) || g <= 0) { setError('Enter a valid amount'); return }
    setSubmitting(true); setError(null)
    try {
      await addEntry({
        log_date:   targetDate,
        entry_type: 'food',
        label:      selectedFood.food_name,
        items: [{
          food_id:   selectedFood.food_id,
          food_name: selectedFood.food_name,
          amount_g:  g,
          mode:      'grams',
        }],
        source_id: null,
        notes: null,
      })
      onAdded()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to log entry')
      setSubmitting(false)
    }
  }

  async function handleLogFoodDirectly(food: FoodRow, grams: number) {
    setSubmitting(true); setError(null)
    try {
      await addEntry({
        log_date:   targetDate,
        entry_type: 'food',
        label:      food.food_name,
        items: [{
          food_id:   food.food_id,
          food_name: food.food_name,
          amount_g:  grams,
          mode:      'grams',
        }],
        source_id: null,
        notes: null,
      })
      onAdded()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to log entry')
      setSubmitting(false)
    }
  }

  function goSelect(type: EntryType) {
    setEntryType(type)
    setNutrientSort(null)
    setStep('select')
  }

  function goBack() {
    setStep('type')
    setFoodSubStep('search')
    setSelectedFood(null)
    setError(null)
  }

  // ── Nutrient sort dropdown (shared) ─────────────────────────────────────────

  const nutrientSortDropdown = (
    <select
      value={nutrientSort ?? ''}
      onChange={e => setNutrientSort(e.target.value === '' ? null : parseInt(e.target.value, 10))}
      className="bg-slate-700 border border-slate-600 rounded px-1.5 py-0.5 text-[10px] text-slate-300 focus:outline-none focus:border-violet-500 max-w-[180px]"
    >
      <option value="">Sort by nutrient…</option>
      {nutrientGroups.map(([cat, ns]) => (
        <optgroup key={cat} label={cat}>
          {ns.map(n => <option key={n.nutrient_id} value={n.nutrient_id}>{n.nutrient_name}</option>)}
        </optgroup>
      ))}
    </select>
  )

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh]">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[84vh] flex flex-col mx-4">

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700 flex-shrink-0">
          {step === 'select' && (
            <button
              onClick={goBack}
              className="text-slate-400 hover:text-slate-200 text-sm transition-colors flex-shrink-0"
            >
              ← Back
            </button>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-slate-100">
              {step === 'type'
                ? 'Log Entry'
                : entryType === 'meal' ? 'Add Meal'
                : entryType === 'plan' ? 'Add Plan'
                : foodSubStep === 'grams' && selectedFood ? selectedFood.food_name
                : 'Add Food'}
            </h2>
            <p className="text-[11px] text-slate-500">{displayDate}</p>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-slate-200 text-base leading-none flex-shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mx-4 mt-3 px-3 py-2 bg-red-900/30 border border-red-700/50 rounded-md text-xs text-red-300 flex-shrink-0">
            {error}
          </div>
        )}

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto min-h-0">

          {/* ── Step 1: Type chooser ── */}
          {step === 'type' && (
            <div className="p-5 space-y-2.5">
              {([
                { type: 'meal' as EntryType, label: 'Add Meal',  sub: 'Log a preset or saved meal template' },
                { type: 'plan' as EntryType, label: 'Add Plan',  sub: 'Log a full saved Day Planner plan' },
                { type: 'food' as EntryType, label: 'Add Food',  sub: 'Log a single food item by weight' },
              ] as const).map(({ type, label, sub }) => (
                <button
                  key={type}
                  onClick={() => goSelect(type)}
                  className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border border-slate-700 hover:border-violet-500/60 hover:bg-violet-900/10 text-left transition-colors group"
                >
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-slate-200 group-hover:text-violet-300 transition-colors">{label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{sub}</div>
                  </div>
                  <span className="text-slate-600 group-hover:text-violet-400 transition-colors text-lg">›</span>
                </button>
              ))}
            </div>
          )}

          {/* ── Step 2: Add Meal ── */}
          {step === 'select' && entryType === 'meal' && (
            <div>
              {/* Controls */}
              <div className="px-4 pt-3 pb-2 border-b border-slate-700 flex items-center gap-2">
                {nutrientSortDropdown}
              </div>

              {/* Category pills */}
              <div className="flex gap-1.5 flex-wrap px-4 py-2 border-b border-slate-700/60">
                {presetCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setMealCategory(cat)}
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
                      mealCategory === cat
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
                {savedMeals.length > 0 && (
                  <button
                    onClick={() => setMealCategory('My Templates')}
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
                      mealCategory === 'My Templates'
                        ? 'bg-violet-600 text-white'
                        : 'bg-slate-700/60 text-violet-400 hover:bg-slate-700 hover:text-violet-300 border border-violet-800/50'
                    }`}
                  >
                    ★ My Templates ({savedMeals.length})
                  </button>
                )}
              </div>

              {/* Meal list */}
              {dataLoading ? (
                <div className="flex items-center justify-center py-12 text-slate-600 text-sm">Loading…</div>
              ) : mealCategory === 'My Templates' ? (
                <div className="divide-y divide-slate-700/60">
                  {filteredSavedMeals.length === 0 ? (
                    <p className="text-center text-slate-600 py-10 text-sm">No saved templates.</p>
                  ) : filteredSavedMeals.map(sm => {
                    const badge = nutrientBadge(sm.items)
                    return (
                      <button
                        key={sm.id}
                        onClick={() => !submitting && handleLogMeal(sm)}
                        disabled={submitting}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-700/40 text-left transition-colors group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-200 group-hover:text-violet-300 transition-colors truncate">{sm.name}</span>
                            {badge && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-900/40 text-emerald-300 font-medium tabular-nums whitespace-nowrap">{badge}</span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{sm.items.length} food{sm.items.length !== 1 ? 's' : ''}</div>
                        </div>
                        <span className="text-violet-600 group-hover:text-violet-400 text-xs flex-shrink-0 ml-3 transition-colors">+ Log</span>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="divide-y divide-slate-700/60">
                  {filteredPresets.length === 0 ? (
                    <p className="text-center text-slate-600 py-10 text-sm">No meals in this category.</p>
                  ) : filteredPresets.map(pm => {
                    const badge = nutrientBadge(pm.items)
                    return (
                      <button
                        key={pm.id}
                        onClick={() => !submitting && handleLogMeal(pm)}
                        disabled={submitting}
                        className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-700/40 text-left transition-colors group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm text-slate-200 group-hover:text-emerald-300 transition-colors">{pm.name}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-400 whitespace-nowrap">{pm.category}</span>
                            {badge && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-900/40 text-emerald-300 font-medium tabular-nums whitespace-nowrap">{badge}</span>
                            )}
                          </div>
                          {pm.description && (
                            <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed line-clamp-1">{pm.description}</p>
                          )}
                          <p className="text-[10px] text-slate-600 mt-0.5">{pm.items.length} ingredient{pm.items.length !== 1 ? 's' : ''}</p>
                        </div>
                        <span className="text-emerald-600 group-hover:text-emerald-400 text-xs flex-shrink-0 mt-0.5 transition-colors">+ Log</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Step 2: Add Plan ── */}
          {step === 'select' && entryType === 'plan' && (
            <div>
              {!user ? (
                <div className="flex flex-col items-center justify-center py-14 gap-2 px-6 text-center">
                  <p className="text-slate-400 text-sm">Sign in to log saved plans.</p>
                </div>
              ) : dataLoading ? (
                <div className="flex items-center justify-center py-14 text-slate-600 text-sm">Loading…</div>
              ) : savedPlans.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 gap-2 px-6 text-center">
                  <p className="text-slate-400 text-sm">No saved plans yet.</p>
                  <p className="text-slate-600 text-xs">Build and save a plan in the Day Planner tab first.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-700/60">
                  {savedPlans.map(sp => {
                    const totalFoods = sp.meals.reduce((s, m) => s + m.items.length, 0)
                    return (
                      <button
                        key={sp.id}
                        onClick={() => !submitting && handleLogPlan(sp)}
                        disabled={submitting}
                        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-700/40 text-left transition-colors group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-200 group-hover:text-violet-300 transition-colors truncate">{sp.name}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {sp.meals.length} meal{sp.meals.length !== 1 ? 's' : ''} · {totalFoods} food{totalFoods !== 1 ? 's' : ''}
                          </div>
                        </div>
                        <span className="text-violet-600 group-hover:text-violet-400 text-xs flex-shrink-0 ml-3 transition-colors">+ Log</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Step 2: Add Food — food search ── */}
          {step === 'select' && entryType === 'food' && foodSubStep === 'search' && (
            <div>
              <div className="px-4 pt-3 pb-2">
                <input
                  type="text"
                  placeholder="Search foods…"
                  value={foodSearch}
                  onChange={e => setFoodSearch(e.target.value)}
                  autoFocus
                  className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="px-4 pb-2 flex flex-wrap gap-1">
                {ALL_FOOD_CATS.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFoodCategory(cat)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      foodCategory === cat
                        ? 'bg-violet-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="px-4 pb-2 flex items-center gap-2">
                <span className="text-[11px] text-slate-500">{filteredFoods.length} food{filteredFoods.length !== 1 ? 's' : ''}</span>
                <div className="ml-auto">{nutrientSortDropdown}</div>
              </div>

              <div className="px-4 pb-3">
                {filteredFoods.length === 0 ? (
                  <p className="text-center text-slate-500 py-8 text-sm">No foods found.</p>
                ) : (
                  <div className="space-y-0.5">
                    {filteredFoods.map(food => {
                      const portion = getPortionSize(food.food_id)
                      const nv = nutrientSort !== null ? food.nutrients[nutrientSort] : null
                      const nvBadge = nv != null && nutrientSortMeta
                        ? (() => {
                            const sv = (nv as number) * portion.grams / 100
                            const d = sv < 1 ? sv.toFixed(2) : sv < 100 ? sv.toFixed(1) : Math.round(sv).toString()
                            return `${d}${nutrientSortMeta.unit}`
                          })()
                        : null

                      if (portion.sizes) {
                        return (
                          <div
                            key={food.food_id}
                            className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-slate-700"
                          >
                            <div className="flex-1 min-w-0">
                              <span className="text-sm text-slate-100">{food.food_name}</span>
                              <span className="text-[11px] text-slate-500 ml-2">{food.category}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {nvBadge && (
                                <span className="text-[10px] text-violet-300 font-medium tabular-nums">{nvBadge}</span>
                              )}
                              <SizeButtons
                                sizes={portion.sizes}
                                onSelect={(_key, variant) => handleLogFoodDirectly(food, variant.grams)}
                              />
                            </div>
                          </div>
                        )
                      }

                      return (
                        <button
                          key={food.food_id}
                          onClick={() => handleSelectFood(food)}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-slate-700 text-left transition-colors group"
                        >
                          <div className="flex-1 min-w-0">
                            <span className="text-sm text-slate-100">{food.food_name}</span>
                            <span className="text-[11px] text-slate-500 ml-2">{food.category}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-[11px] text-slate-400">{portion.label} · {portion.grams}g</span>
                            {nvBadge && (
                              <span className="text-[10px] text-violet-300 font-medium tabular-nums">{nvBadge}</span>
                            )}
                            <span className="text-[11px] font-medium text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              Select →
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Step 2: Add Food — grams confirmation ── */}
          {step === 'select' && entryType === 'food' && foodSubStep === 'grams' && selectedFood && (
            <div className="p-6">
              <div className="mb-6">
                <p className="text-[11px] text-slate-500 mb-1">Selected food</p>
                <p className="text-slate-100 font-semibold text-base">{selectedFood.food_name}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{selectedFood.category}</p>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-medium text-slate-300 mb-2">Amount (grams)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={gramsInput}
                    onChange={e => setGramsInput(e.target.value)}
                    min="1"
                    step="1"
                    autoFocus
                    className="w-28 bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-violet-500 text-center"
                  />
                  <span className="text-sm text-slate-400">g</span>
                  <span className="text-[11px] text-slate-600">
                    default: {getPortionSize(selectedFood.food_id).label} = {getPortionSize(selectedFood.food_id).grams}g
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setFoodSubStep('search'); setSelectedFood(null) }}
                  className="px-4 py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 text-sm transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={handleLogFood}
                  disabled={submitting}
                  className="px-6 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Logging…' : 'Log Entry'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
