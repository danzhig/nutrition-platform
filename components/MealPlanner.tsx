'use client'

import { useState, useEffect, useMemo } from 'react'
import type { HeatmapData, FoodRow } from '@/types/nutrition'
import type { ActiveMealPlan, Meal } from '@/types/meals'
import type { SavedMealPlan } from '@/lib/mealStorage'
import { loadMealPlans, createMealPlan, updateMealPlan, deleteMealPlan } from '@/lib/mealStorage'
import type { SavedMeal } from '@/lib/savedMealStorage'
import { loadSavedMeals, createSavedMeal, deleteSavedMeal } from '@/lib/savedMealStorage'
import type { ProfileId, RDAProfile, RDAValues } from '@/lib/rdaProfiles'
import { getProfile } from '@/lib/rdaProfiles'
import type { SavedProfile } from '@/lib/profileStorage'
import { loadSavedProfiles } from '@/lib/profileStorage'
import { useAuth } from './AuthProvider'
import MealCard from './MealCard'
import MealNutritionSidebar from './MealNutritionSidebar'
import DVProfilePanel from './DVProfilePanel'

interface Props {
  data: HeatmapData
}

const DEFAULT_MEAL_NAMES = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Pre-workout', 'Post-workout']

function newPlan(): ActiveMealPlan {
  return { id: null, name: 'My Meal Plan', meals: [], rda_selection: 'male-avg' }
}

export default function MealPlanner({ data }: Props) {
  const { user } = useAuth()
  const [plan, setPlan] = useState<ActiveMealPlan>(newPlan())
  const [savedPlans, setSavedPlans] = useState<SavedMealPlan[]>([])
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([])
  const [customRdaValues, setCustomRdaValues] = useState<RDAValues>({})
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([])
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [showPlanList, setShowPlanList] = useState(false)
  const [showSavedMeals, setShowSavedMeals] = useState(false)

  // Build food lookup map for sidebar
  const foodsById = useMemo(() => {
    const map = new Map<number, FoodRow>()
    for (const f of data.foods) map.set(f.food_id, f)
    return map
  }, [data.foods])

  // Load saved data when user logs in, clear on logout
  useEffect(() => {
    if (!user) {
      setSavedPlans([])
      setSavedProfiles([])
      setPlan(newPlan())
      return
    }
    loadMealPlans().then(setSavedPlans).catch(console.error)
    loadSavedProfiles().then(setSavedProfiles).catch(console.error)
    loadSavedMeals().then(setSavedMeals).catch(console.error)
  }, [user])

  // Resolve the active RDA profile from rda_selection string
  const rdaProfile = useMemo<RDAProfile | null>(() => {
    const sel = plan.rda_selection
    if (!sel) return null
    if (sel === 'custom') {
      return getProfile('custom', customRdaValues)
    }
    if (sel.startsWith('saved:')) {
      const savedId = sel.slice(6)
      const saved = savedProfiles.find((p) => p.id === savedId)
      if (saved) {
        const label = saved.name
        const shortLabel = label.length > 13 ? label.slice(0, 12) + '…' : label
        return { id: 'custom', label, shortLabel, description: 'Saved custom profile', values: saved.values }
      }
      return null
    }
    return getProfile(sel as ProfileId, undefined)
  }, [plan.rda_selection, savedProfiles, customRdaValues])

  // ── Plan mutation helpers ──────────────────────────────────────────────────

  function addMeal() {
    const usedNames = new Set(plan.meals.map((m) => m.name))
    const nextName =
      DEFAULT_MEAL_NAMES.find((n) => !usedNames.has(n)) ??
      `Meal ${plan.meals.length + 1}`
    const meal: Meal = { id: crypto.randomUUID(), name: nextName, items: [] }
    setPlan((p) => ({ ...p, meals: [...p.meals, meal] }))
  }

  function updateMealInPlan(updated: Meal) {
    setPlan((p) => ({ ...p, meals: p.meals.map((m) => (m.id === updated.id ? updated : m)) }))
  }

  function deleteMealFromPlan(mealId: string) {
    setPlan((p) => ({ ...p, meals: p.meals.filter((m) => m.id !== mealId) }))
  }

  // ── Saved meal templates ──────────────────────────────────────────────────

  async function handleSaveAsTemplate(meal: Meal) {
    const saved = await createSavedMeal(meal.name, meal.items)
    setSavedMeals((prev) => [saved, ...prev])
  }

  function handleLoadSavedMeal(sm: SavedMeal) {
    const meal: Meal = {
      id: crypto.randomUUID(),
      name: sm.name,
      items: sm.items.map((item) => ({ ...item, id: crypto.randomUUID() })),
    }
    setPlan((p) => ({ ...p, meals: [...p.meals, meal] }))
    setShowSavedMeals(false)
  }

  async function handleDeleteSavedMeal(id: string) {
    try {
      await deleteSavedMeal(id)
      setSavedMeals((prev) => prev.filter((sm) => sm.id !== id))
    } catch (e: unknown) {
      console.error(e)
    }
  }

  // ── Save / load ───────────────────────────────────────────────────────────

  async function handleSave() {
    if (!user) return
    setSaving(true)
    setSaveError(null)
    try {
      if (plan.id) {
        await updateMealPlan(plan.id, plan.name, plan.meals, plan.rda_selection)
        setSavedPlans((prev) =>
          prev.map((sp) =>
            sp.id === plan.id
              ? { ...sp, name: plan.name, meals: plan.meals, rda_selection: plan.rda_selection }
              : sp
          )
        )
      } else {
        const saved = await createMealPlan(plan.name, plan.meals, plan.rda_selection)
        setSavedPlans((prev) => [saved, ...prev])
        setPlan((p) => ({ ...p, id: saved.id }))
      }
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteSavedPlan(id: string) {
    try {
      await deleteMealPlan(id)
      setSavedPlans((prev) => prev.filter((sp) => sp.id !== id))
      if (plan.id === id) setPlan(newPlan())
    } catch (e: unknown) {
      console.error(e)
    }
  }

  function handleLoadPlan(sp: SavedMealPlan) {
    setPlan({ id: sp.id, name: sp.name, meals: sp.meals, rda_selection: sp.rda_selection })
    setShowPlanList(false)
  }

  // ── Not logged in ─────────────────────────────────────────────────────────

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <p className="text-slate-400 text-sm">Sign in to build and save meal plans.</p>
        <p className="text-slate-600 text-xs">Use the Sign in button in the top-right corner.</p>
      </div>
    )
  }

  // ── Main UI ───────────────────────────────────────────────────────────────

  return (
    <div className="flex gap-4 items-start">
      {/* Left: plan builder */}
      <div className="flex-1 min-w-0 space-y-3">

        {/* Plan control bar */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 space-y-3">

          {/* Name + action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="text"
              value={plan.name}
              onChange={(e) => setPlan((p) => ({ ...p, name: e.target.value }))}
              className="flex-1 min-w-[180px] bg-slate-700 border border-slate-600 rounded-md px-3 py-1.5 text-sm font-semibold text-slate-100 focus:outline-none focus:border-violet-500"
            />
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium rounded-md transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : plan.id ? 'Update' : 'Save'}
            </button>
            <button
              onClick={() => { setPlan(newPlan()); setShowPlanList(false) }}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded-md transition-colors"
            >
              New
            </button>
            {savedPlans.length > 0 && (
              <button
                onClick={() => setShowPlanList((v) => !v)}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded-md transition-colors"
              >
                {showPlanList ? 'Hide' : `Load (${savedPlans.length})`}
              </button>
            )}
          </div>

          {saveError && <p className="text-xs text-red-400">{saveError}</p>}

          {/* Saved plan list */}
          {showPlanList && (
            <div className="border border-slate-600 rounded-md divide-y divide-slate-700 max-h-44 overflow-y-auto">
              {savedPlans.map((sp) => (
                <div key={sp.id} className="flex items-center justify-between px-3 py-2 hover:bg-slate-700/50">
                  <button
                    onClick={() => handleLoadPlan(sp)}
                    className="text-xs text-slate-200 hover:text-violet-300 text-left flex-1 min-w-0"
                  >
                    <span className="truncate block">{sp.name}</span>
                    <span className="text-slate-500 text-[10px]">
                      {sp.meals.length} meal{sp.meals.length !== 1 ? 's' : ''} ·{' '}
                      {sp.meals.reduce((s, m) => s + m.items.length, 0)} foods
                    </span>
                  </button>
                  <button
                    onClick={() => handleDeleteSavedPlan(sp.id)}
                    className="text-slate-500 hover:text-red-400 text-xs ml-3 flex-shrink-0"
                    title="Delete plan"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Active DV profile indicator */}
          {rdaProfile && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-500">DV profile:</span>
              <span className="text-[10px] font-medium text-violet-300">{rdaProfile.shortLabel}</span>
              <button
                onClick={() => setPlan((p) => ({ ...p, rda_selection: '' }))}
                className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
                title="Clear profile"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Meal cards */}
        {plan.meals.length === 0 ? (
          <div className="bg-slate-800 border border-dashed border-slate-600 rounded-lg flex items-center justify-center py-16">
            <p className="text-slate-500 text-sm">No meals yet — add one below.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {plan.meals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                foods={data.foods}
                onChange={updateMealInPlan}
                onDelete={() => deleteMealFromPlan(meal.id)}
                onSaveAsTemplate={handleSaveAsTemplate}
              />
            ))}
          </div>
        )}

        {/* Add meal */}
        <div className="flex gap-2">
          <button
            onClick={addMeal}
            className="flex-1 text-sm text-violet-400 hover:text-violet-300 border border-dashed border-slate-600 hover:border-violet-500 rounded-lg py-3 transition-colors"
          >
            + Add Meal
          </button>
          {savedMeals.length > 0 && (
            <button
              onClick={() => setShowSavedMeals((v) => !v)}
              className="px-4 text-sm text-slate-400 hover:text-violet-300 border border-dashed border-slate-600 hover:border-violet-500 rounded-lg py-3 transition-colors whitespace-nowrap"
            >
              {showSavedMeals ? 'Hide' : `+ From saved (${savedMeals.length})`}
            </button>
          )}
        </div>

        {/* Saved meal template picker */}
        {showSavedMeals && savedMeals.length > 0 && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            <div className="px-3 py-2 bg-slate-900/40 border-b border-slate-700">
              <span className="text-xs font-semibold text-slate-400">Saved meal templates</span>
            </div>
            <div className="divide-y divide-slate-700/60 max-h-52 overflow-y-auto">
              {savedMeals.map((sm) => (
                <div key={sm.id} className="flex items-center justify-between px-3 py-2 hover:bg-slate-700/40">
                  <button
                    onClick={() => handleLoadSavedMeal(sm)}
                    className="text-xs text-slate-200 hover:text-violet-300 text-left flex-1 min-w-0"
                  >
                    <span className="truncate block">{sm.name}</span>
                    <span className="text-slate-500 text-[10px]">
                      {sm.items.length} food{sm.items.length !== 1 ? 's' : ''}
                    </span>
                  </button>
                  <button
                    onClick={() => handleDeleteSavedMeal(sm.id)}
                    className="text-slate-500 hover:text-red-400 text-xs ml-3 flex-shrink-0"
                    title="Delete template"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Middle: DV profile panel */}
      <DVProfilePanel
        nutrients={data.nutrients}
        rdaSelection={plan.rda_selection}
        customRdaValues={customRdaValues}
        savedProfiles={savedProfiles}
        isLoggedIn={!!user}
        onRdaSelectionChange={(sel) => setPlan((p) => ({ ...p, rda_selection: sel }))}
        onCustomValuesChange={setCustomRdaValues}
        onSavedProfilesChange={setSavedProfiles}
      />

      {/* Right: nutrition sidebar */}
      <MealNutritionSidebar
        nutrients={data.nutrients}
        meals={plan.meals}
        foodsById={foodsById}
        rdaProfile={rdaProfile}
      />
    </div>
  )
}
