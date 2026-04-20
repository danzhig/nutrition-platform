'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import type { HeatmapData, FoodRow } from '@/types/nutrition'
import type { ActiveMealPlan, Meal } from '@/types/meals'
import type { SavedMealPlan } from '@/lib/mealStorage'
import { loadMealPlans, createMealPlan, updateMealPlan, deleteMealPlan } from '@/lib/mealStorage'
import type { SavedMeal } from '@/lib/savedMealStorage'
import { loadSavedMeals, createSavedMeal, deleteSavedMeal } from '@/lib/savedMealStorage'
import type { PresetMeal } from '@/lib/presetMealStorage'
import { loadPresetMeals } from '@/lib/presetMealStorage'
import type { ProfileId, RDAProfile, RDAValues } from '@/lib/rdaProfiles'
import { RDA_PROFILES, getProfile } from '@/lib/rdaProfiles'
import { getPortionSize } from '@/lib/portionSizes'
import type { SavedProfile } from '@/lib/profileStorage'
import { loadSavedProfiles } from '@/lib/profileStorage'
import { computeComplementScore } from '@/lib/complementScore'
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

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 65 ? 'text-emerald-400 border-emerald-700/60 bg-emerald-900/30' :
    score >= 35 ? 'text-amber-400 border-amber-700/60 bg-amber-900/20' :
                  'text-slate-500 border-slate-600 bg-slate-800'
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] font-semibold tabular-nums flex-shrink-0 ${color}`}>
      {score}
    </span>
  )
}

export default function MealPlanner({ data }: Props) {
  const { user } = useAuth()
  const [plan, setPlan] = useState<ActiveMealPlan>(() => {
    if (typeof window === 'undefined') return newPlan()
    try {
      const draft = localStorage.getItem('np:draft-plan')
      if (draft) return JSON.parse(draft) as ActiveMealPlan
    } catch { /* corrupt draft — ignore */ }
    return newPlan()
  })
  const [savedPlans, setSavedPlans] = useState<SavedMealPlan[]>([])
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([])
  const [customRdaValues, setCustomRdaValues] = useState<RDAValues>(() => {
    if (typeof window === 'undefined') return {}
    try {
      const draft = localStorage.getItem('np:draft-custom-rda')
      if (draft) return JSON.parse(draft) as RDAValues
    } catch { /* corrupt draft — ignore */ }
    return {}
  })
  // Snapshot of plan at last save/load — used to detect unsaved changes
  const [savedSnapshot, setSavedSnapshot] = useState<string>(() => {
    if (typeof window === 'undefined') return JSON.stringify(newPlan())
    try {
      const snap = localStorage.getItem('np:draft-snapshot')
      if (snap) return snap
      // No snapshot yet: treat draft as clean baseline
      const draft = localStorage.getItem('np:draft-plan')
      return draft ?? JSON.stringify(newPlan())
    } catch { return JSON.stringify(newPlan()) }
  })
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([])
  const [presetMeals, setPresetMeals] = useState<PresetMeal[]>([])
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [showSavedMeals, setShowSavedMeals] = useState(false)
  const [showPresets, setShowPresets] = useState(false)
  const [presetCategory, setPresetCategory] = useState<string>('All')
  const [viewMode, setViewMode] = useState<'sidebar' | 'chart'>('sidebar')
  const [collapsedMeals, setCollapsedMeals] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set()
    try {
      const draft = localStorage.getItem('np:draft-plan')
      if (draft) {
        const parsed = JSON.parse(draft) as ActiveMealPlan
        return new Set(parsed.meals.map((m) => m.id))
      }
    } catch { /* ignore */ }
    return new Set()
  })
  const [showPlanDropdown, setShowPlanDropdown] = useState(false)
  const planDropdownRef = useRef<HTMLDivElement>(null)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const profileDropdownRef = useRef<HTMLDivElement>(null)
  // Guards plan restore so tab-switch auth refreshes don't overwrite in-progress edits
  const planRestoredRef = useRef(false)

  // Persist in-progress plan so tab switches don't lose unsaved work
  useEffect(() => {
    localStorage.setItem('np:draft-plan', JSON.stringify(plan))
  }, [plan])

  useEffect(() => {
    if (Object.keys(customRdaValues).length > 0) {
      localStorage.setItem('np:draft-custom-rda', JSON.stringify(customRdaValues))
    }
  }, [customRdaValues])

  // Restore view mode from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('nutrition-view-mode')
    if (saved === 'sidebar' || saved === 'chart') setViewMode(saved)
  }, [])

  // Close dropdowns on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (planDropdownRef.current && !planDropdownRef.current.contains(e.target as Node)) {
        setShowPlanDropdown(false)
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setShowProfileDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
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
      localStorage.removeItem('np:draft-plan')
      localStorage.removeItem('np:draft-custom-rda')
      localStorage.removeItem('np:draft-snapshot')
      localStorage.removeItem('nutrition-active-plan-id')
      planRestoredRef.current = false
      return
    }
    loadMealPlans().then((plans) => {
      setSavedPlans(plans)
      // Only restore from the server on the very first login load.
      // If a draft exists (from a prior session or tab-switch), honour that
      // instead — it may contain unsaved in-progress changes the user wants.
      if (!planRestoredRef.current) {
        planRestoredRef.current = true
        const hasDraft = !!localStorage.getItem('np:draft-plan')
        if (!hasDraft) {
          const lastId = localStorage.getItem('nutrition-active-plan-id')
          if (lastId) {
            const match = plans.find((p) => p.id === lastId)
            if (match) {
              setPlan({ id: match.id, name: match.name, meals: match.meals, rda_selection: match.rda_selection })
              setCollapsedMeals(new Set(match.meals.map((m) => m.id)))
            }
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

  // Complement scores — recompute whenever the current plan or profile changes
  const presetScores = useMemo<Map<string, number>>(() => {
    const map = new Map<string, number>()
    if (!rdaProfile) return map
    for (const pm of presetMeals) {
      map.set(pm.id, computeComplementScore(pm.items, plan.meals, data.nutrients, rdaProfile, foodsById))
    }
    return map
  }, [plan.meals, rdaProfile, presetMeals, data.nutrients, foodsById])

  const savedMealScores = useMemo<Map<string, number>>(() => {
    const map = new Map<string, number>()
    if (!rdaProfile) return map
    for (const sm of savedMeals) {
      map.set(sm.id, computeComplementScore(sm.items, plan.meals, data.nutrients, rdaProfile, foodsById))
    }
    return map
  }, [plan.meals, rdaProfile, savedMeals, data.nutrients, foodsById])

  const hasUnsavedChanges = useMemo(
    () => JSON.stringify(plan) !== savedSnapshot,
    [plan, savedSnapshot]
  )

  const updateSnapshot = useCallback((p: ActiveMealPlan) => {
    const s = JSON.stringify(p)
    setSavedSnapshot(s)
    localStorage.setItem('np:draft-snapshot', s)
  }, [])

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
    setPlan((p) => ({ ...p, meals: [meal, ...p.meals] }))
    setCollapsedMeals(new Set(plan.meals.map((m) => m.id)))
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
    setPlan((p) => ({ ...p, meals: [meal, ...p.meals] }))
    setCollapsedMeals(new Set(plan.meals.map((m) => m.id)))
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
        updateSnapshot(plan)
      } else {
        const saved = await createMealPlan(plan.name, plan.meals, plan.rda_selection)
        setSavedPlans((prev) => [saved, ...prev])
        const savedPlan = { ...plan, id: saved.id }
        setPlan(savedPlan)
        localStorage.setItem('nutrition-active-plan-id', saved.id)
        updateSnapshot(savedPlan)
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
    const loaded = { id: sp.id, name: sp.name, meals: sp.meals, rda_selection: sp.rda_selection }
    setPlan(loaded)
    setCollapsedMeals(new Set(sp.meals.map((m) => m.id)))
    localStorage.setItem('nutrition-active-plan-id', sp.id)
    updateSnapshot(loaded)
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

  // ── View toggle tab bar + DV profile picker ──────────────────────────────

  const viewTabBar = (
    <div className="flex items-center border-b border-slate-700 mb-4 gap-1">
      {/* View tabs */}
      <button
        onClick={() => switchView('sidebar')}
        className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
          viewMode === 'sidebar'
            ? 'border-violet-500 text-violet-300'
            : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
        }`}
      >
        ▤ Day Builder
      </button>
      <button
        onClick={() => switchView('chart')}
        className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
          viewMode === 'chart'
            ? 'border-violet-500 text-violet-300'
            : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
        }`}
      >
        ▦ Charts
      </button>

      {/* Separator */}
      <div className="w-px h-4 bg-slate-600 mx-2 self-center flex-shrink-0" />

      {/* Plan picker */}
      <div className="flex items-center gap-2 pb-px">
        <div className="relative" ref={planDropdownRef}>
          <button
            onClick={() => setShowPlanDropdown((v) => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs bg-slate-700/60 hover:bg-slate-700 border border-slate-600 text-slate-300 transition-colors max-w-[220px]"
          >
            <span className="text-slate-500 text-[10px] flex-shrink-0">Plan</span>
            <span className="font-semibold text-slate-100 truncate">{plan.name}</span>
            <span className="text-slate-500 text-[9px] flex-shrink-0">▾</span>
          </button>

          {showPlanDropdown && (
            <div className="absolute left-0 top-full mt-1 w-72 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-50 overflow-hidden text-xs">
              {/* Name editor */}
              <div className="px-3 pt-3 pb-2 border-b border-slate-700">
                <input
                  type="text"
                  value={plan.name}
                  onChange={(e) => setPlan((p) => ({ ...p, name: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-100 focus:outline-none focus:border-violet-500"
                  placeholder="Plan name…"
                />
                {saveError && <p className="text-[10px] text-red-400 mt-1">{saveError}</p>}
              </div>

              {/* Saved plans list */}
              {savedPlans.length > 0 && (
                <div className="max-h-52 overflow-y-auto">
                  <div className="px-3 pt-2 pb-1 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Saved Plans</div>
                  {savedPlans.map((sp) => (
                    <div key={sp.id} className="flex items-center justify-between hover:bg-slate-700/50 transition-colors">
                      <button
                        onClick={() => { handleLoadPlan(sp); setShowPlanDropdown(false) }}
                        className={`flex-1 text-left px-3 py-2 min-w-0 ${plan.id === sp.id ? 'text-violet-300' : 'text-slate-200'}`}
                      >
                        <span className="block font-medium truncate">{sp.name}</span>
                        <span className="block text-[9px] text-slate-500 mt-0.5">
                          {sp.meals.length} meal{sp.meals.length !== 1 ? 's' : ''} · {sp.meals.reduce((s, m) => s + m.items.length, 0)} foods
                        </span>
                      </button>
                      <button
                        onClick={() => handleDeleteSavedPlan(sp.id)}
                        className="px-3 py-2 text-slate-500 hover:text-red-400 flex-shrink-0 transition-colors"
                        title="Delete plan"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Save / Update button — purple when unsaved changes, grey when clean */}
        <button
          onClick={hasUnsavedChanges && !saving ? handleSave : undefined}
          disabled={saving}
          className={`px-3 py-1.5 text-[11px] font-semibold rounded-md border transition-colors ${
            hasUnsavedChanges
              ? 'bg-violet-600 hover:bg-violet-500 border-violet-500 text-white cursor-pointer'
              : 'bg-slate-800 border-slate-700 text-slate-600 cursor-default'
          }`}
        >
          {saving ? 'Saving…' : plan.id ? 'Update Plan' : 'Save Plan'}
        </button>

        {/* New Plan button */}
        <button
          onClick={() => {
            const p = newPlan()
            setPlan(p)
            updateSnapshot(p)
            localStorage.removeItem('nutrition-active-plan-id')
            localStorage.removeItem('np:draft-plan')
            localStorage.removeItem('np:draft-custom-rda')
            localStorage.removeItem('np:draft-snapshot')
          }}
          className="px-3 py-1.5 text-[11px] font-medium rounded-md border border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-colors"
        >
          New Plan
        </button>
      </div>

      {/* DV profile picker */}
      <div className="relative pb-px" ref={profileDropdownRef}>
        <button
          onClick={() => setShowProfileDropdown((v) => !v)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs bg-slate-700/60 hover:bg-slate-700 border border-slate-600 text-slate-300 transition-colors"
        >
          <span className="text-slate-500 text-[10px]">DV Profile</span>
          <span className={rdaProfile ? 'text-violet-300 font-semibold' : 'text-slate-400'}>
            {rdaProfile ? rdaProfile.shortLabel : 'None'}
          </span>
          <span className="text-slate-500 text-[9px]">▾</span>
        </button>

        {showProfileDropdown && (
          <div className="absolute right-0 top-full mt-1 w-56 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-50 overflow-hidden text-xs">
            {/* Saved profiles first */}
            {savedProfiles.length > 0 && (
              <>
                <div className="px-3 pt-2 pb-1 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">My Profiles</div>
                {savedProfiles.map((sp) => (
                  <button
                    key={sp.id}
                    onClick={() => { setPlan((p) => ({ ...p, rda_selection: `saved:${sp.id}` })); setShowProfileDropdown(false) }}
                    className={`w-full text-left px-3 py-1.5 text-[11px] font-medium transition-colors ${
                      plan.rda_selection === `saved:${sp.id}` ? 'bg-violet-700/60 text-violet-200' : 'text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    {sp.name}
                  </button>
                ))}
                <div className="border-t border-slate-700 my-1" />
              </>
            )}

            {/* Built-in profiles */}
            <div className="px-3 pt-2 pb-1 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Built-in</div>
            <button
              onClick={() => { setPlan((p) => ({ ...p, rda_selection: '' })); setShowProfileDropdown(false) }}
              className={`w-full text-left px-3 py-1.5 text-[11px] font-medium transition-colors ${
                plan.rda_selection === '' ? 'bg-violet-700/60 text-violet-200' : 'text-slate-200 hover:bg-slate-700'
              }`}
            >
              None
            </button>
            {RDA_PROFILES.map((p) => (
              <button
                key={p.id}
                onClick={() => { setPlan((prev) => ({ ...prev, rda_selection: p.id })); setShowProfileDropdown(false) }}
                className={`w-full text-left px-3 py-1.5 text-[11px] transition-colors ${
                  plan.rda_selection === p.id ? 'bg-violet-700/60 text-violet-200' : 'text-slate-200 hover:bg-slate-700'
                }`}
              >
                <span className="block font-medium">{p.label}</span>
                <span className="block text-[9px] text-slate-500 mt-0.5 leading-tight">{p.description}</span>
              </button>
            ))}

            {/* Custom */}
            <div className="border-t border-slate-700 my-1" />
            <button
              onClick={() => {
                if (Object.keys(customRdaValues).length === 0) {
                  const base = RDA_PROFILES.find((p) => p.id === 'male-avg')
                  if (base) setCustomRdaValues({ ...base.values })
                }
                setPlan((p) => ({ ...p, rda_selection: 'custom' }))
                setShowProfileDropdown(false)
              }}
              className={`w-full text-left px-3 py-1.5 text-[11px] font-medium transition-colors mb-1 ${
                plan.rda_selection === 'custom' ? 'bg-violet-700/60 text-violet-200' : 'text-slate-200 hover:bg-slate-700'
              }`}
            >
              Custom…
            </button>
          </div>
        )}
      </div>
    </div>
  )

  // ── Custom editor panel (shown below tab bar in both views when active) ───

  const customEditorPanel = plan.rda_selection === 'custom' ? (
    <DVProfilePanel
      editorOnly
      nutrients={data.nutrients}
      rdaSelection={plan.rda_selection}
      customRdaValues={customRdaValues}
      savedProfiles={savedProfiles}
      isLoggedIn={!!user}
      onRdaSelectionChange={(sel) => setPlan((p) => ({ ...p, rda_selection: sel }))}
      onCustomValuesChange={setCustomRdaValues}
      onSavedProfilesChange={setSavedProfiles}
    />
  ) : null

  // ── Chart mode ────────────────────────────────────────────────────────────

  if (viewMode === 'chart') {
    return (
      <div>
        {viewTabBar}
        {customEditorPanel}
        <MealNutritionChart
          nutrients={data.nutrients}
          meals={plan.meals}
          foodsById={foodsById}
          rdaProfile={rdaProfile}
        />
      </div>
    )
  }

  // ── Sidebar mode ──────────────────────────────────────────────────────────

  return (
    <div>
      {viewTabBar}
      {customEditorPanel}
    <div className="flex gap-4 items-start">
      {/* Left: plan builder */}
      <div className="flex-1 min-w-0 space-y-3">

        {/* ── Add meal buttons ── */}
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
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="truncate">{sm.name}</span>
                      {savedMealScores.has(sm.id) && (
                        <ScoreBadge score={savedMealScores.get(sm.id)!} />
                      )}
                    </span>
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
                      {presetScores.has(pm.id) && (
                        <ScoreBadge score={presetScores.get(pm.id)!} />
                      )}
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

      {/* Right: nutrition sidebar */}
      <MealNutritionSidebar
        nutrients={data.nutrients}
        meals={plan.meals}
        foodsById={foodsById}
        rdaProfile={rdaProfile}
      />
    </div>
    </div>
  )
}
