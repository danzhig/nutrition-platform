'use client'

import { useEffect, useMemo, useState } from 'react'
import type { AppData, FoodRow, NutrientMeta } from '@/types/nutrition'
import type { FoodLogEntry } from '@/types/calendar'
import type { RDAProfile } from '@/lib/rdaProfiles'
import { getPortionSize } from '@/lib/portionSizes'
import { FOOD_CATEGORY_LIST } from '@/lib/filterConstants'
import { computeComplementScore } from '@/lib/complementScore'
import { addEntry } from '@/lib/foodLogStorage'
import { logItemToMealItem } from '@/lib/foodLogAdapters'
import { loadSavedMeals, type SavedMeal } from '@/lib/savedMealStorage'
import { loadPresetMeals, type PresetMeal } from '@/lib/presetMealStorage'
import { loadMealPlans, type SavedMealPlan } from '@/lib/mealStorage'
import { loadDietList } from '@/lib/dietStorage'
import { computeDietProfile, type FoodNutrientMap } from '@/lib/dietProfile'
import { computeDietSuggestions, type SuggestedFood } from '@/lib/dietSuggestions'
import MobileGramInput from './MobileGramInput'

type Tab = 'food' | 'meal' | 'plan'

interface MobileAddSheetProps {
  open: boolean
  onClose: () => void
  selectedDate: string
  appData: AppData
  userId: string | null
  currentDayEntries: FoodLogEntry[]
  rdaProfile: RDAProfile | null
  onEntriesChanged: () => void
}

export default function MobileAddSheet({
  open,
  onClose,
  selectedDate,
  appData,
  userId,
  currentDayEntries,
  rdaProfile,
  onEntriesChanged,
}: MobileAddSheetProps) {
  const [visible, setVisible] = useState(false)
  const [tab, setTab] = useState<Tab>('food')
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      const raf = requestAnimationFrame(() => setVisible(true))
      return () => cancelAnimationFrame(raf)
    }
    setVisible(false)
  }, [open])

  useEffect(() => {
    if (!open) return
    window.history.pushState({ sheet: true }, '')
    function onPopState() {
      onClose()
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    if (open) setTab('food')
  }, [open])

  function requestClose() {
    if (window.history.state?.sheet) {
      window.history.back()
    } else {
      onClose()
    }
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 1500)
  }

  const foodsById = useMemo(() => {
    const map = new Map<number, FoodRow>()
    for (const f of appData.foods) map.set(f.food_id, f)
    return map
  }, [appData.foods])

  async function handleLogged(label: string) {
    showToast(`Logged ${label} to ${selectedDate}`)
    onEntriesChanged()
    requestClose()
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60" onClick={requestClose} />

      <div
        className={`fixed inset-x-0 bottom-0 z-40 flex flex-col rounded-t-2xl bg-slate-800 border-t border-slate-700 shadow-2xl transition-transform duration-300 ${
          visible ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ height: '80vh', transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
      >
        <div className="w-9 h-1 rounded-full bg-slate-600 mx-auto mt-2 mb-3 shrink-0" />

        <div className="flex shrink-0 px-3 gap-1 border-b border-slate-700 pb-2">
          {(['food', 'meal', 'plan'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize touch-manipulation ${
                tab === t ? 'bg-violet-600 text-white' : 'text-slate-400'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          {tab === 'food' && (
            <FoodTab
              appData={appData}
              foodsById={foodsById}
              userId={userId}
              rdaProfile={rdaProfile}
              currentDayEntries={currentDayEntries}
              selectedDate={selectedDate}
              onLogged={handleLogged}
            />
          )}
          {tab === 'meal' && (
            <MealTab
              open={open}
              nutrients={appData.nutrients}
              foodsById={foodsById}
              rdaProfile={rdaProfile}
              currentDayEntries={currentDayEntries}
              selectedDate={selectedDate}
              onLogged={handleLogged}
            />
          )}
          {tab === 'plan' && (
            <PlanTab open={open} selectedDate={selectedDate} onLogged={handleLogged} />
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed inset-x-4 z-50 bottom-24 rounded-lg bg-slate-700 border border-slate-600 px-4 py-2.5 text-center text-xs text-slate-100 shadow-xl">
          {toast}
        </div>
      )}
    </>
  )
}

// ─── Food tab ───────────────────────────────────────────────────────────────

function FoodTab({
  appData,
  foodsById,
  userId,
  rdaProfile,
  currentDayEntries,
  selectedDate,
  onLogged,
}: {
  appData: AppData
  foodsById: Map<number, FoodRow>
  userId: string | null
  rdaProfile: RDAProfile | null
  currentDayEntries: FoodLogEntry[]
  selectedDate: string
  onLogged: (label: string) => void
}) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [selectedFood, setSelectedFood] = useState<FoodRow | null>(null)
  const [grams, setGrams] = useState(100)
  const [submitting, setSubmitting] = useState(false)
  const [suggestions, setSuggestions] = useState<SuggestedFood[] | 'loading' | 'no-diet-data'>('loading')

  const currentMeals = useMemo(() => {
    const items = currentDayEntries.flatMap((e) => e.items).map(logItemToMealItem)
    if (items.length === 0) return []
    return [{ id: 'day-total', name: 'Day Total', items }]
  }, [currentDayEntries])

  const scoresByFoodId = useMemo(() => {
    if (!rdaProfile) return null
    const map = new Map<number, number>()
    for (const food of appData.foods) {
      const portion = getPortionSize(food.food_id)
      map.set(
        food.food_id,
        computeComplementScore([{ food_id: food.food_id, grams: portion.grams }], currentMeals, appData.nutrients, rdaProfile, foodsById)
      )
    }
    return map
  }, [rdaProfile, currentMeals, appData.foods, appData.nutrients, foodsById])

  useEffect(() => {
    if (!rdaProfile) {
      setSuggestions([])
      return
    }
    let cancelled = false
    setSuggestions('loading')
    loadDietList(userId ?? undefined).then((selectedFoods) => {
      if (cancelled) return
      if (selectedFoods.length === 0) {
        setSuggestions('no-diet-data')
        return
      }
      const allFoodNutrients: FoodNutrientMap = {}
      for (const f of appData.foods) allFoodNutrients[f.food_id] = f.nutrients
      const { results } = computeDietProfile(selectedFoods, allFoodNutrients, rdaProfile, appData.nutrients)
      setSuggestions(computeDietSuggestions(selectedFoods, results, allFoodNutrients, appData.foods))
    })
    return () => {
      cancelled = true
    }
  }, [rdaProfile, userId, appData])

  const results = useMemo(() => {
    let list = appData.foods
    if (category) list = list.filter((f) => f.category === category)
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter((f) => f.food_name.toLowerCase().includes(q))
    }
    if (scoresByFoodId) {
      list = [...list].sort((a, b) => (scoresByFoodId.get(b.food_id) ?? 0) - (scoresByFoodId.get(a.food_id) ?? 0))
    } else {
      list = [...list].sort((a, b) => a.food_name.localeCompare(b.food_name))
    }
    return list.slice(0, 30)
  }, [appData.foods, category, query, scoresByFoodId])

  function selectFood(food: FoodRow) {
    setSelectedFood(food)
    setGrams(getPortionSize(food.food_id).grams)
  }

  async function handleLogIt() {
    if (!selectedFood) return
    setSubmitting(true)
    try {
      await addEntry({
        log_date: selectedDate,
        entry_type: 'food',
        label: selectedFood.food_name,
        items: [{
          food_id: selectedFood.food_id,
          food_name: selectedFood.food_name,
          amount_g: grams,
          mode: 'grams',
        }],
        source_id: null,
        notes: null,
      })
      onLogged(`${selectedFood.food_name} (${grams}g)`)
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (selectedFood) {
    return (
      <div className="p-4 flex flex-col gap-4">
        <button type="button" onClick={() => setSelectedFood(null)} className="text-xs text-violet-400 self-start">
          ‹ back to search
        </button>
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-100">{selectedFood.food_name}</p>
          <MobileGramInput grams={grams} onChange={setGrams} />
        </div>
        <button
          type="button"
          onClick={handleLogIt}
          disabled={submitting}
          className="w-full py-3 rounded-xl bg-violet-600 disabled:opacity-60 text-white text-sm font-semibold active:opacity-80 touch-manipulation"
        >
          {submitting ? 'Logging…' : 'Log It'}
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <DietSuggestionsRow suggestions={suggestions} foodsById={foodsById} onQuickAdd={selectFood} />

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
          className="flex-1 min-w-0 text-base bg-slate-700 border border-slate-600 text-slate-100 placeholder-slate-500 rounded-lg px-3 py-3 outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>

      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setCategory('')}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium touch-manipulation ${
            category === '' ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-300'
          }`}
        >
          All
        </button>
        {FOOD_CATEGORY_LIST.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium touch-manipulation ${
              category === cat ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex flex-col divide-y divide-slate-800 rounded-lg overflow-hidden border border-slate-800">
        {results.map((food) => {
          const score = scoresByFoodId?.get(food.food_id)
          return (
            <button
              key={food.food_id}
              type="button"
              onClick={() => selectFood(food)}
              className="flex items-center justify-between px-3 py-3 bg-slate-900 text-left active:bg-slate-800 touch-manipulation"
            >
              <div className="min-w-0">
                <p className="text-sm text-slate-100 truncate">{food.food_name}</p>
                <p className="text-[10px] text-slate-500">{getPortionSize(food.food_id).label}</p>
              </div>
              {score !== undefined && <ScoreBadge score={score} />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 65 ? 'bg-emerald-900/50 text-emerald-300' : score >= 35 ? 'bg-amber-900/50 text-amber-300' : 'bg-slate-700 text-slate-400'
  return <span className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full ${color}`}>{score}</span>
}

function DietSuggestionsRow({
  suggestions,
  foodsById,
  onQuickAdd,
}: {
  suggestions: SuggestedFood[] | 'loading' | 'no-diet-data'
  foodsById: Map<number, FoodRow>
  onQuickAdd: (food: FoodRow) => void
}) {
  if (suggestions === 'loading') return null

  if (suggestions === 'no-diet-data') {
    return (
      <p className="text-xs text-slate-500 text-center py-3 bg-slate-800/50 rounded-lg">
        Set up your diet on desktop to see personalised suggestions.
      </p>
    )
  }

  if (suggestions.length === 0) return null

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
      {suggestions.map((s) => {
        const food = foodsById.get(s.foodId)
        return (
          <div
            key={s.foodId}
            className="shrink-0 flex flex-col gap-1 bg-slate-700/50 border border-slate-600 rounded-lg p-2.5"
            style={{ width: 140, height: 110 }}
          >
            <p className="text-[11px] font-semibold text-slate-100 leading-tight truncate">{s.foodName}</p>
            <div className="flex flex-col gap-0.5 flex-1 overflow-hidden">
              {s.topGapNutrients.slice(0, 2).map((name) => (
                <span key={name} className="text-[9px] text-violet-300 truncate">↑ {name}</span>
              ))}
            </div>
            {food && (
              <button
                type="button"
                onClick={() => onQuickAdd(food)}
                className="text-[10px] font-semibold text-violet-300 self-start active:opacity-70 touch-manipulation"
              >
                + Log to Today
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Meal tab ───────────────────────────────────────────────────────────────

function MealTab({
  open,
  nutrients,
  foodsById,
  rdaProfile,
  currentDayEntries,
  selectedDate,
  onLogged,
}: {
  open: boolean
  nutrients: NutrientMeta[]
  foodsById: Map<number, FoodRow>
  rdaProfile: RDAProfile | null
  currentDayEntries: FoodLogEntry[]
  selectedDate: string
  onLogged: (label: string) => void
}) {
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([])
  const [presetMeals, setPresetMeals] = useState<PresetMeal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    Promise.all([loadSavedMeals().catch(() => []), loadPresetMeals().catch(() => [])]).then(([saved, presets]) => {
      setSavedMeals(saved)
      setPresetMeals(presets)
      setLoading(false)
    })
  }, [open])

  const currentMeals = useMemo(() => {
    const items = currentDayEntries.flatMap((e) => e.items).map(logItemToMealItem)
    if (items.length === 0) return []
    return [{ id: 'day-total', name: 'Day Total', items }]
  }, [currentDayEntries])

  function score(items: { food_id: number; grams: number }[]) {
    if (!rdaProfile) return undefined
    return computeComplementScore(items, currentMeals, nutrients, rdaProfile, foodsById)
  }

  async function handleLog(meal: SavedMeal | PresetMeal) {
    try {
      await addEntry({
        log_date: selectedDate,
        entry_type: 'meal',
        label: meal.name,
        items: meal.items.map((item) => ({
          food_id: item.food_id,
          food_name: foodsById.get(item.food_id)?.food_name ?? `Food ${item.food_id}`,
          amount_g: item.grams,
          mode: 'grams' as const,
          meal_label: meal.name,
        })),
        source_id: meal.id,
        notes: null,
      })
      onLogged(meal.name)
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <p className="p-4 text-sm text-slate-500">Loading…</p>

  return (
    <div className="flex flex-col gap-4 p-4">
      {savedMeals.length > 0 && (
        <MealSection title="My Templates" meals={savedMeals} onSelect={handleLog} scoreFn={score} />
      )}
      <MealSection title="Presets" meals={presetMeals} onSelect={handleLog} scoreFn={score} />
    </div>
  )
}

function MealSection({
  title,
  meals,
  onSelect,
  scoreFn,
}: {
  title: string
  meals: (SavedMeal | PresetMeal)[]
  onSelect: (meal: SavedMeal | PresetMeal) => void
  scoreFn: (items: { food_id: number; grams: number }[]) => number | undefined
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">{title}</p>
      <div className="flex flex-col divide-y divide-slate-800 rounded-lg overflow-hidden border border-slate-800">
        {meals.map((meal) => {
          const s = scoreFn(meal.items.map((i) => ({ food_id: i.food_id, grams: i.grams })))
          return (
            <button
              key={meal.id}
              type="button"
              onClick={() => onSelect(meal)}
              className="flex items-center justify-between px-3 py-3 bg-slate-900 text-left active:bg-slate-800 touch-manipulation"
            >
              <div className="min-w-0">
                <p className="text-sm text-slate-100 truncate">{meal.name}</p>
                <p className="text-[10px] text-slate-500">{meal.items.length} items</p>
              </div>
              {s !== undefined && <ScoreBadge score={s} />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Plan tab ───────────────────────────────────────────────────────────────

function PlanTab({
  open,
  selectedDate,
  onLogged,
}: {
  open: boolean
  selectedDate: string
  onLogged: (label: string) => void
}) {
  const [plans, setPlans] = useState<SavedMealPlan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    loadMealPlans()
      .catch(() => [])
      .then((p) => {
        setPlans(p)
        setLoading(false)
      })
  }, [open])

  async function handleLog(plan: SavedMealPlan) {
    try {
      await addEntry({
        log_date: selectedDate,
        entry_type: 'plan',
        label: plan.name,
        items: plan.meals.flatMap((meal) =>
          meal.items.map((item) => ({
            food_id: item.food_id,
            food_name: item.food_name,
            amount_g: item.grams,
            mode: item.mode,
            meal_label: meal.name,
          }))
        ),
        source_id: plan.id,
        notes: null,
      })
      onLogged(plan.name)
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <p className="p-4 text-sm text-slate-500">Loading…</p>

  if (plans.length === 0) {
    return <p className="p-4 text-sm text-slate-500 text-center">No saved plans yet.</p>
  }

  return (
    <div className="flex flex-col divide-y divide-slate-800 rounded-lg overflow-hidden border border-slate-800 m-4">
      {plans.map((plan) => (
        <button
          key={plan.id}
          type="button"
          onClick={() => handleLog(plan)}
          className="flex items-center justify-between px-3 py-3 bg-slate-900 text-left active:bg-slate-800 touch-manipulation"
        >
          <p className="text-sm text-slate-100 truncate">{plan.name}</p>
          <p className="text-[10px] text-slate-500 shrink-0">{plan.meals.length} meals</p>
        </button>
      ))}
    </div>
  )
}
