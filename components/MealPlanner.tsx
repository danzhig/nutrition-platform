'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import type { HeatmapData, FoodRow } from '@/types/nutrition'
import type { ActiveMealPlan, Meal } from '@/types/meals'
import type { SavedMealPlan } from '@/lib/mealStorage'
import { loadMealPlans, createMealPlan, updateMealPlan, deleteMealPlan } from '@/lib/mealStorage'
import type { SavedMeal } from '@/lib/savedMealStorage'
import { loadSavedMeals, createSavedMeal, deleteSavedMeal } from '@/lib/savedMealStorage'
import type { PresetMeal } from '@/lib/presetMealStorage'
import { loadPresetMeals } from '@/lib/presetMealStorage'
import type { ProfileId, RDAProfile, RDAValues } from '@/lib/rdaProfiles'
import { getProfile } from '@/lib/rdaProfiles'
import { getPortionSize } from '@/lib/portionSizes'
import type { SavedProfile } from '@/lib/profileStorage'
import { loadSavedProfiles } from '@/lib/profileStorage'
import { useAuth } from './AuthProvider'
import MealCard from './MealCard'
import MealNutritionSidebar from './MealNutritionSidebar'
import MealNutritionChart from './MealNutritionChart'
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
  const [presetMeals, setPresetMeals] = useState<PresetMeal[]>([])
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [showPlanList, setShowPlanList] = useState(false)
  const [showSavedMeals, setShowSavedMeals] = useState(false)
  const [showPresets, setShowPresets] = useState(false)
  const [presetCategory, setPresetCategory] = useState<string>('All')
  const [viewMode, setViewMode] = useState<'sidebar' | 'chart'>('sidebar')
  const [collapsedMeals, setCollapsedMeals] = useState<Set<string>>(new Set())
  // Guards plan restore so tab-switch auth refreshes don't overwrite in-progress edits
  const planRestoredRef = useRef(false)

  // Restore view mode from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('nutrition-view-mode')
    if (saved === 'sidebar' || saved === 'chart') setViewMode(saved)
  }, [])

  // Build food lookup map for sidebar
  const foodsById = useMemo(() => {
    const map = new Map<number, FoodRow>()
    for (const f of data.foods) map.set(f.food_id, f)
    return map
  }, [data.foods])

  // Preset meals are public — load once on mount
  useEffect(() => {
    loadPresetMeals().then(setPresetMeals).catch(console.error)
  }, [])

  // Load user data on login, clear on logout
  useEffect(() => {
    if (!user) {
      setSavedPlans([])
      setSavedProfiles([])
      setPlan(newPlan())
      localStorage.removeItem('nutrition-active-plan-id')
      planRestoredRef.current = false
      return
    }
    loadMealPlans().then((plans) => {
      setSavedPlans(plans)
      // Only restore the active plan on the first load after login.
      // Tab-switch auth refreshes re-fire this effect but must not overwrite
      // in-progress edits the user hasn't saved yet.
      if (!planRestoredRef.current) {
        planRestoredRef.current = true
        const lastId = localStorage.getItem('nutrition-active-plan-id')
        if (lastId) {
          const match = plans.find((p) => p.id === lastId)
          if (match) {
            setPlan({ id: match.id, name: match.name, meals: match.meals, rda_selection: match.rda_selection })
            setCollapsedMeals(new Set(match.meals.map((m) => m.id)))
          }
        }
      }
    }).catch(console.error)
    loadSavedProfiles().then(setSavedProfiles).catch(console.error)
    loadSavedMeals().then(setSavedMeals).catch(console.error)
  }, [user])

  // Resolve the active RDA profile
  const rdaProfile = useMemo<RDAProfile | null>(() => {
    const sel = plan.rda_selection
    if (!sel) return null
    if (sel === 'custom') return getProfile('custom', customRdaValues)
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

  // Preset categories derived from loaded data
  const presetCategories = useMemo(() => {
    const cats = Array.from(new Set(presetMeals.map((p) => p.category))).sort()
    return ['All', ...cats]
  }, [presetMeals])

  const filteredPresets = useMemo(() =>
    presetCategory === 'All'
      ? presetMeals
      : presetMeals.filter((p) => p.category === presetCategory),
    [presetMeals, presetCategory]
  )

  function switchView(mode: 'sidebar' | 'chart') {
    setViewMode(mode)
    localStorage.setItem('nutrition-view-mode', mode)
  }

  // ── Plan mutation helpers ──────────────────────────────────────────────────

  function addMeal() {
    const usedNames = new Set(plan.meals.map((m) => m.name))
    const nextName =
      DEFAULT_MEAL_NAMES.find((n) => !usedNames.has(n)) ??
      `Meal ${plan.meals.length + 1}`
    const meal: Meal = { id: crypto.randomUUID(), name: nextName, items: [] }
    // Prepend so new meal appears at the top
    setPlan((p) => ({ ...p, meals: [meal, ...p.meals] }))
    // Collapse all existing meals; new meal stays expanded (its id is not added)
    setCollapsedMeals(new Set(plan.meals.map((m) => m.id)))
  }

  function updateMealInPlan(updated: Meal) {
    setPlan((p) => ({ ...p, meals: p.meals.map((m) => (m.id === updated.id ? updated : m)) }))
  }

  function deleteMealFromPlan(mealId: string) {
    setPlan((p) => ({ ...p, meals: p.meals.filter((m) => m.id !== mealId) }))
    setCollapsedMeals((prev) => { const next = new Set(prev); next.delete(mealId); return next })
  }

  function toggleMealCollapsed(mealId: string) {
    setCollapsedMeals((prev) => {
      const next = new Set(prev)
      if (next.has(mealId)) next.delete(mealId)
      else next.add(mealId)
      return next
    })
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
    setCollapsedMeals(new Set([...plan.meals.map((m) => m.id), meal.id]))
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

  // ── Preset meals ──────────────────────────────────────────────────────────

  function handleLoadPreset(pm: PresetMeal) {
    const meal: Meal = {
      id: crypto.randomUUID(),
      name: pm.name,
      items: pm.items.map((item) => {
        const food = foodsById.get(item.food_id)
        const portion = getPortionSize(item.food_id)
        return {
          id: crypto.randomUUID(),
          food_id: item.food_id,
          food_name: food?.food_name ?? `Unknown food (${item.food_id})`,
          grams: item.grams,
          mode: 'grams' as const,
          servings: Math.round((item.grams / portion.grams) * 100) / 100,
          portion_grams: portion.grams,
          portion_label: portion.label,
        }
      }),
    }
    setPlan((p) => ({ ...p, meals: [...p.meals, meal] }))
    setCollapsedMeals(new Set([...plan.meals.map((m) => m.id), meal.id]))
    setShowPresets(false)
  }

  // ── Save / load plans ─────────────────────────────────────────────────────

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
        localStorage.setItem('nutrition-active-plan-id', saved.id)
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
      if (plan.id === id) {
        setPlan(newPlan())
        localStorage.removeItem('nutrition-active-plan-id')
      }
    } catch (e: unknown) {
      console.error(e)
    }
  }

  function handleLoadPlan(sp: SavedMealPlan) {
    setPlan({ id: sp.id, name: sp.name, meals: sp.meals, rda_selection: sp.rda_selection })
    setCollapsedMeals(new Set(sp.meals.map((m) => m.id)))
    localStorage.setItem('nutrition-active-plan-id', sp.id)
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

  // ── Chart mode ────────────────────────────────────────────────────────────

  if (viewMode === 'chart') {
    return (
      <MealNutritionChart
        nutrients={data.nutrients}
        meals={plan.meals}
        foodsById={foodsById}
        rdaProfile={rdaProfile}
        onSwitchToSidebar={() => switchView('sidebar')}
      />
    )
  }

  // ── Sidebar mode ──────────────────────────────────────────────────────────

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
              onClick={() => { setPlan(newPlan()); setShowPlanList(false); localStorage.removeItem('nutrition-active-plan-id') }}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded-md transition-colors"
            >
              New
            </button>
            {savedPlans.length > 0 && (
              <button
                onClick={() => setShowPlanList((v) => !v)}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded-md transition-colors"
              >
                {showPlanList ? 'Hide plans' : `Load (${savedPlans.length})`}
              </button>
            )}
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 rounded-md border border-slate-600 overflow-hidden self-start">
            <button className="px-2.5 py-1 text-[10px] font-medium bg-violet-600 text-white cursor-default">
              ▤ Sidebar
            </button>
            <button
              onClick={() => switchView('chart')}
              className="px-2.5 py-1 text-[10px] font-medium bg-slate-700 text-slate-400 hover:bg-slate-600 transition-colors"
            >
              ▦ Chart
            </button>
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

        {/* ── Add meal buttons — sits just below the control bar ── */}
        <div className="flex gap-2">
          <button
            onClick={addMeal}
            className="flex-1 text-sm text-violet-400 hover:text-violet-300 border border-dashed border-slate-600 hover:border-violet-500 rounded-lg py-2.5 transition-colors"
          >
            + Add Meal
          </button>
          {savedMeals.length > 0 && (
            <button
              onClick={() => { setShowSavedMeals((v) => !v); setShowPresets(false) }}
              className={`px-4 text-sm border border-dashed rounded-lg py-2.5 transition-colors whitespace-nowrap ${
                showSavedMeals
                  ? 'text-violet-300 border-violet-500'
                  : 'text-slate-400 hover:text-violet-300 border-slate-600 hover:border-violet-500'
              }`}
            >
              {showSavedMeals ? 'Hide saved' : `+ My templates (${savedMeals.length})`}
            </button>
          )}
          {presetMeals.length > 0 && (
            <button
              onClick={() => { setShowPresets((v) => !v); setShowSavedMeals(false) }}
              className={`px-4 text-sm border border-dashed rounded-lg py-2.5 transition-colors whitespace-nowrap ${
                showPresets
                  ? 'text-emerald-300 border-emerald-500'
                  : 'text-slate-400 hover:text-emerald-300 border-slate-600 hover:border-emerald-500'
              }`}
            >
              {showPresets ? 'Hide presets' : `⊞ Presets (${presetMeals.length})`}
            </button>
          )}
        </div>

        {/* Saved meal template picker */}
        {showSavedMeals && savedMeals.length > 0 && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            <div className="px-3 py-2 bg-slate-900/40 border-b border-slate-700">
              <span className="text-xs font-semibold text-slate-400">My saved meal templates</span>
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

        {/* Preset meal browser */}
        {showPresets && presetMeals.length > 0 && (
          <div className="bg-slate-800 border border-emerald-900/50 rounded-lg overflow-hidden">
            <div className="px-3 py-2 bg-slate-900/40 border-b border-slate-700 flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-400">Preset Meals</span>
              <span className="text-[10px] text-slate-500">Click a meal to add it to your plan</span>
            </div>

            {/* Category filter pills */}
            <div className="flex gap-1.5 flex-wrap px-3 py-2 border-b border-slate-700/60">
              {presetCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setPresetCategory(cat)}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
                    presetCategory === cat
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Meal list */}
            <div className="divide-y divide-slate-700/60 max-h-72 overflow-y-auto">
              {filteredPresets.map((pm) => (
                <button
                  key={pm.id}
                  onClick={() => handleLoadPreset(pm)}
                  className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-slate-700/40 text-left transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-200 group-hover:text-emerald-300 transition-colors truncate">
                        {pm.name}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-400 whitespace-nowrap flex-shrink-0">
                        {pm.category}
                      </span>
                    </div>
                    {pm.description && (
                      <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                        {pm.description}
                      </p>
                    )}
                    <p className="text-[10px] text-slate-600 mt-0.5">
                      {pm.items.length} ingredient{pm.items.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <span className="text-emerald-600 group-hover:text-emerald-400 text-xs flex-shrink-0 mt-0.5 transition-colors">
                    + Add
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Meal cards */}
        {plan.meals.length === 0 ? (
          <div className="bg-slate-800 border border-dashed border-slate-600 rounded-lg flex items-center justify-center py-16">
            <p className="text-slate-500 text-sm">No meals yet — add one above or pick a preset.</p>
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
                isCollapsed={collapsedMeals.has(meal.id)}
                onToggleCollapse={() => toggleMealCollapsed(meal.id)}
              />
            ))}
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
