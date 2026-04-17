'use client'

import { useState } from 'react'
import type { NutrientCategory } from '@/types/nutrition'
import type { NutrientMeta } from '@/types/nutrition'
import {
  FOOD_CATEGORY_LIST,
  NUTRIENT_GROUP_LIST,
  ALL_NUTRIENT_CATEGORIES,
} from '@/lib/filterConstants'
import type { ProfileId, RDAValues } from '@/lib/rdaProfiles'
import { RDA_PROFILES, NUTRIENT_BEHAVIORS } from '@/lib/rdaProfiles'
import type { SavedProfile } from '@/lib/profileStorage'
import type { SavedFilterSet } from '@/lib/filterSetStorage'

interface Props {
  selectedFoods: string[]
  selectedNutrients: NutrientCategory[]
  search: string
  perServing: boolean
  rdaProfileId: ProfileId | null
  customRdaValues: RDAValues
  nutrients: NutrientMeta[]
  savedProfiles: SavedProfile[]
  savedProfileId: string | null
  savedFilterSets: SavedFilterSet[]
  isLoggedIn: boolean
  onFoodsChange: (cats: string[]) => void
  onNutrientsChange: (cats: NutrientCategory[]) => void
  onSearchChange: (s: string) => void
  onPerServingChange: (v: boolean) => void
  onRdaProfileChange: (id: ProfileId | null) => void
  onCustomRdaValuesChange: (values: RDAValues) => void
  onSavedProfileSelect: (id: string | null) => void
  onSaveProfile: (name: string) => Promise<void>
  onDeleteSavedProfile: (id: string) => Promise<void>
  onSaveFilterSet: (name: string) => Promise<void>
  onDeleteFilterSet: (id: string) => Promise<void>
  onApplyFilterSet: (fs: SavedFilterSet) => void
}

/** Short nutrient name for the custom editor rows. */
function shortName(name: string): string {
  return name
    .replace('Vitamin ', 'Vit ')
    .replace('Pantothenic Acid', 'Pantothenic Ac.')
    .replace('Antioxidant Capacity', 'Antioxidant')
    .replace('Glycemic Index', 'Glycemic Idx')
    .replace('Monounsaturated Fat', 'MUFA')
    .replace('Polyunsaturated Fat', 'PUFA')
    .replace('Omega-3 Fatty Acids', 'Omega-3')
    .replace('Omega-6 Fatty Acids', 'Omega-6')
    .replace('Phenylalanine', 'Phenylalanine')  // keep
    .replace('Pantothenic', 'Pantothenic')
}

const BEHAVIOR_BADGE: Record<string, string> = {
  limit:           '↓',  // lower is better
  'normal-with-ul': '⚠',  // has upper limit
}

export default function FilterPanel({
  selectedFoods,
  selectedNutrients,
  search,
  perServing,
  rdaProfileId,
  customRdaValues,
  nutrients,
  savedProfiles,
  savedProfileId,
  savedFilterSets,
  isLoggedIn,
  onFoodsChange,
  onNutrientsChange,
  onSearchChange,
  onPerServingChange,
  onRdaProfileChange,
  onCustomRdaValuesChange,
  onSavedProfileSelect,
  onSaveProfile,
  onDeleteSavedProfile,
  onSaveFilterSet,
  onDeleteFilterSet,
  onApplyFilterSet,
}: Props) {
  const [open, setOpen] = useState(false)
  const [customExpanded, setCustomExpanded] = useState(false)
  const [saveProfileName, setSaveProfileName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveViewName, setSaveViewName] = useState('')
  const [savingView, setSavingView] = useState(false)
  const [saveViewError, setSaveViewError] = useState<string | null>(null)
  const [saveViewExpanded, setSaveViewExpanded] = useState(false)

  const allFoods     = FOOD_CATEGORY_LIST.length
  const allNutrients = ALL_NUTRIENT_CATEGORIES.length

  const foodsFiltered     = selectedFoods.length < allFoods
  const nutrientsFiltered = selectedNutrients.length < allNutrients

  const activeCount = [
    search.trim() !== '',
    perServing,
    foodsFiltered,
    nutrientsFiltered,
    rdaProfileId !== null || savedProfileId !== null,
  ].filter(Boolean).length

  function toggleFood(cat: string) {
    if (selectedFoods.includes(cat)) {
      if (selectedFoods.length === 1) return
      onFoodsChange(selectedFoods.filter((c) => c !== cat))
    } else {
      onFoodsChange([...selectedFoods, cat])
    }
  }

  function toggleNutrient(cat: NutrientCategory) {
    if (selectedNutrients.includes(cat)) {
      if (selectedNutrients.length === 1) return
      onNutrientsChange(selectedNutrients.filter((c) => c !== cat))
    } else {
      onNutrientsChange([...selectedNutrients, cat])
    }
  }

  function resetAll() {
    onFoodsChange([...FOOD_CATEGORY_LIST])
    onNutrientsChange([...ALL_NUTRIENT_CATEGORIES])
    onSearchChange('')
    onPerServingChange(false)
    onRdaProfileChange(null)
    onCustomRdaValuesChange({})
    onSavedProfileSelect(null)
  }

  async function handleSaveView() {
    if (!saveViewName.trim()) return
    setSavingView(true)
    setSaveViewError(null)
    try {
      await onSaveFilterSet(saveViewName.trim())
      setSaveViewName('')
      setSaveViewExpanded(false)
    } catch (e: unknown) {
      setSaveViewError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSavingView(false)
    }
  }

  async function handleSaveProfile() {
    if (!saveProfileName.trim()) return
    setSaving(true)
    setSaveError(null)
    try {
      await onSaveProfile(saveProfileName.trim())
      setSaveProfileName('')
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  /** When the user selects a built-in profile as the custom base, seed custom values. */
  function seedCustomFromProfile(baseId: ProfileId) {
    const base = RDA_PROFILES.find((p) => p.id === baseId)
    if (base) onCustomRdaValuesChange({ ...base.values })
  }

  function handleProfileSelect(id: ProfileId | null) {
    onRdaProfileChange(id)
    onSavedProfileSelect(null)
    if (id === 'custom' && Object.keys(customRdaValues).length === 0) {
      seedCustomFromProfile('male-avg')
    }
  }

  const anyProfileActive = rdaProfileId !== null || savedProfileId !== null

  /** Resolve the effective values for the custom editor display. */
  const effectiveCustomValues: RDAValues = (() => {
    if (Object.keys(customRdaValues).length > 0) return customRdaValues
    // Show male-avg as placeholder when not yet seeded
    return RDA_PROFILES.find((p) => p.id === 'male-avg')?.values ?? {}
  })()

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Toggle tab */}
      <button
        onClick={() => setOpen((v) => !v)}
        title={open ? 'Close filters' : 'Open filters'}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center justify-center gap-1.5 py-5 px-1.5 bg-slate-700 hover:bg-slate-600 border border-l-0 border-slate-600 rounded-r-xl text-slate-300 hover:text-white transition-colors shadow-lg"
      >
        <span className="text-base leading-none">{open ? '✕' : '☰'}</span>
        <span className="text-[9px] font-semibold tracking-widest uppercase text-slate-400 [writing-mode:vertical-rl] rotate-180">
          Filters
        </span>
        {activeCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center shadow">
            {activeCount}
          </span>
        )}
      </button>

      {/* Slide-in panel */}
      <div
        className={`fixed top-0 left-0 h-full w-72 z-50 flex flex-col bg-slate-800 border-r border-slate-700 shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">Filters &amp; Settings</span>
            {activeCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                {activeCount} active
              </span>
            )}
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-slate-700"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">

          {/* ── Search ── */}
          <section>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Search food
            </label>
            <input
              type="search"
              placeholder="e.g. salmon, almond…"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-700 border border-slate-600 text-slate-100 placeholder-slate-400 rounded-lg outline-none focus:ring-2 focus:ring-slate-400"
            />
          </section>

          {/* ── Saved views ── */}
          {isLoggedIn && (
            <section>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Saved views
                </label>
                <button
                  onClick={() => setSaveViewExpanded((v) => !v)}
                  className="text-[10px] text-violet-400 hover:text-violet-300 transition-colors font-medium"
                >
                  {saveViewExpanded ? 'Cancel' : '+ Save current'}
                </button>
              </div>

              {/* Save current view form */}
              {saveViewExpanded && (
                <div className="mb-3 flex gap-1.5">
                  <input
                    type="text"
                    placeholder="View name…"
                    value={saveViewName}
                    onChange={(e) => setSaveViewName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveView() }}
                    autoFocus
                    className="flex-1 min-w-0 px-2 py-1.5 text-xs bg-slate-700 border border-slate-600 text-slate-100 placeholder-slate-500 rounded-lg focus:ring-1 focus:ring-violet-500 outline-none"
                  />
                  <button
                    onClick={handleSaveView}
                    disabled={savingView || !saveViewName.trim()}
                    className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors shrink-0"
                  >
                    {savingView ? '…' : 'Save'}
                  </button>
                </div>
              )}
              {saveViewError && (
                <p className="mb-2 text-[10px] text-red-400">{saveViewError}</p>
              )}

              {/* Saved views list */}
              {savedFilterSets.length === 0 ? (
                <p className="text-[10px] text-slate-600 italic">
                  No saved views yet. Set your filters and save a view to recall it quickly.
                </p>
              ) : (
                <div className="flex flex-col gap-1">
                  {savedFilterSets.map((fs) => (
                    <div
                      key={fs.id}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border bg-slate-700 border-slate-600 text-slate-300"
                    >
                      <button
                        onClick={() => onApplyFilterSet(fs)}
                        className="flex-1 text-left text-xs font-medium truncate hover:text-white transition-colors"
                        title={`Apply view: ${fs.name}`}
                      >
                        {fs.name}
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm(`Delete view "${fs.name}"?`)) {
                            await onDeleteFilterSet(fs.id)
                          }
                        }}
                        title="Delete view"
                        className="shrink-0 text-[11px] text-slate-400 hover:text-red-400 transition-colors px-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ── Value mode ── */}
          <section>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Value mode
            </label>
            <button
              onClick={() => onPerServingChange(!perServing)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                perServing
                  ? 'bg-emerald-700 border-emerald-600 text-white'
                  : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 hover:text-white'
              }`}
            >
              <span>{perServing ? 'Per serving' : 'Per 100g'}</span>
              <span className={`relative inline-block w-8 h-4 rounded-full transition-colors ${perServing ? 'bg-emerald-400' : 'bg-slate-500'}`}>
                <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all duration-200 ${perServing ? 'left-4' : 'left-0.5'}`} />
              </span>
            </button>
            <p className="mt-1.5 text-[10px] text-slate-500">
              {perServing ? 'Values scaled to a typical serving size per food.' : 'Values shown per 100g of raw food weight.'}
            </p>
          </section>

          {/* ── % Daily Value ── */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                % Daily Value
              </label>
              {anyProfileActive && (
                <button
                  onClick={() => { onRdaProfileChange(null); onSavedProfileSelect(null) }}
                  className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Off
                </button>
              )}
            </div>

            <p className="text-[10px] text-slate-500 mb-3 leading-relaxed">
              Recolours the table as % of daily requirements. Choose a reference profile or build your own.
            </p>

            {/* Profile buttons */}
            <div className="flex flex-col gap-1.5">
              {RDA_PROFILES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleProfileSelect(p.id)}
                  title={p.description}
                  className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors border ${
                    rdaProfileId === p.id
                      ? 'bg-violet-700 border-violet-600 text-white'
                      : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 hover:text-white'
                  }`}
                >
                  <span className="block font-semibold">{p.label}</span>
                  <span className="block text-[9px] opacity-70 mt-0.5">{p.description}</span>
                </button>
              ))}

              {/* Custom profile */}
              <button
                onClick={() => {
                  handleProfileSelect('custom')
                  setCustomExpanded(true)
                }}
                className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors border ${
                  rdaProfileId === 'custom'
                    ? 'bg-violet-700 border-violet-600 text-white'
                    : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 hover:text-white'
                }`}
              >
                <span className="block font-semibold">Custom</span>
                <span className="block text-[9px] opacity-70 mt-0.5">Set your own daily targets.</span>
              </button>
            </div>

            {/* ── Saved profiles ── */}
            {isLoggedIn && (
              <div className="mt-3">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  My saved profiles
                </p>
                {savedProfiles.length === 0 ? (
                  <p className="text-[10px] text-slate-600 italic">None saved yet.</p>
                ) : (
                  <div className="flex flex-col gap-1">
                    {savedProfiles.map((p) => (
                      <div
                        key={p.id}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-colors ${
                          savedProfileId === p.id
                            ? 'bg-violet-700 border-violet-600 text-white'
                            : 'bg-slate-700 border-slate-600 text-slate-300'
                        }`}
                      >
                        <button
                          onClick={() => onSavedProfileSelect(savedProfileId === p.id ? null : p.id)}
                          className="flex-1 text-left text-xs font-medium truncate"
                        >
                          {p.name}
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`Delete "${p.name}"?`)) {
                              await onDeleteSavedProfile(p.id)
                            }
                          }}
                          title="Delete profile"
                          className="shrink-0 text-[11px] text-slate-400 hover:text-red-400 transition-colors px-1"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!isLoggedIn && (
              <p className="mt-2 text-[10px] text-slate-600 italic">
                Sign in to save custom profiles.
              </p>
            )}

            {/* Custom profile editor — shown when custom is selected */}
            {rdaProfileId === 'custom' && (
              <div className="mt-3 rounded-lg border border-slate-600 bg-slate-900 overflow-hidden">
                {/* Editor header */}
                <button
                  onClick={() => setCustomExpanded((v) => !v)}
                  className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  <span>Edit custom targets</span>
                  <span className="text-slate-500">{customExpanded ? '▲' : '▼'}</span>
                </button>

                {customExpanded && (
                  <div className="px-3 pb-3">
                    {/* Seed from built-in */}
                    <div className="flex gap-1.5 mb-3 flex-wrap">
                      <p className="w-full text-[9px] text-slate-500 mb-1">Copy from:</p>
                      {RDA_PROFILES.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => seedCustomFromProfile(p.id)}
                          className="px-2 py-0.5 rounded text-[9px] bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white transition-colors"
                        >
                          {p.shortLabel}
                        </button>
                      ))}
                    </div>

                    {/* Nutrient inputs grouped by category */}
                    {NUTRIENT_GROUP_LIST.map((g) => {
                      const groupNutrients = nutrients.filter(
                        (n) => n.nutrient_category === g.value
                      )
                      // Only show nutrients that have an established daily target in at least one profile
                      const editable = groupNutrients.filter((n) => {
                        const maleVal = RDA_PROFILES.find((p) => p.id === 'male-avg')?.values[n.nutrient_name]
                        return maleVal != null
                      })
                      if (editable.length === 0) return null
                      return (
                        <div key={g.value} className="mb-2">
                          <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-1 mt-2">
                            {g.label}
                          </p>
                          {editable.map((n) => {
                            const behavior = NUTRIENT_BEHAVIORS[n.nutrient_name]
                            const badge = behavior ? BEHAVIOR_BADGE[behavior] : null
                            const currentVal = effectiveCustomValues[n.nutrient_name]
                            return (
                              <div key={n.nutrient_id} className="flex items-center gap-1 py-[3px]">
                                <span className="text-[10px] text-slate-300 flex-1 min-w-0 truncate leading-none">
                                  {shortName(n.nutrient_name)}
                                  {badge && (
                                    <span className="ml-0.5 text-[8px] text-amber-400">{badge}</span>
                                  )}
                                </span>
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
                                  value={currentVal ?? ''}
                                  placeholder="—"
                                  onChange={(e) => {
                                    const raw = e.target.value
                                    const val = raw === '' ? null : parseFloat(raw)
                                    onCustomRdaValuesChange({
                                      ...effectiveCustomValues,
                                      [n.nutrient_name]: isNaN(val as number) ? null : val,
                                    })
                                  }}
                                  className="w-16 text-[10px] text-right px-1.5 py-0.5 bg-slate-700 border border-slate-600 text-slate-100 rounded focus:ring-1 focus:ring-violet-500 outline-none appearance-none"
                                />
                                <span className="text-[9px] text-slate-500 w-8 shrink-0 leading-none">
                                  {n.unit}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      )
                    })}

                    <p className="mt-3 text-[9px] text-slate-600 leading-relaxed">
                      <span className="text-amber-400">⚠</span> has a safety upper limit ·{' '}
                      <span className="text-slate-400">↓</span> lower is better
                    </p>

                    {/* Save profile — only when logged in */}
                    {isLoggedIn && (
                      <div className="mt-4 border-t border-slate-700 pt-3">
                        <p className="text-[10px] font-semibold text-slate-400 mb-2">
                          Save as named profile
                        </p>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            placeholder="Profile name…"
                            value={saveProfileName}
                            onChange={(e) => setSaveProfileName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSaveProfile() }}
                            className="flex-1 min-w-0 px-2 py-1 text-xs bg-slate-700 border border-slate-600 text-slate-100 placeholder-slate-500 rounded focus:ring-1 focus:ring-violet-500 outline-none"
                          />
                          <button
                            onClick={handleSaveProfile}
                            disabled={saving || !saveProfileName.trim()}
                            className="px-2.5 py-1 text-xs font-semibold rounded bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors shrink-0"
                          >
                            {saving ? '…' : 'Save'}
                          </button>
                        </div>
                        {saveError && (
                          <p className="mt-1 text-[10px] text-red-400">{saveError}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Legend */}
            {anyProfileActive && (
              <div className="mt-3 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 space-y-1">
                <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Colour guide
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: 'hsl(0,75%,40%)' }} />
                  <span className="text-[9px] text-slate-400">0–30% — poor contribution</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: 'hsl(35,76%,46%)' }} />
                  <span className="text-[9px] text-slate-400">25–50% — modest</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: 'hsl(142,68%,33%)' }} />
                  <span className="text-[9px] text-slate-400">50%+ — good serving contribution</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: 'hsl(142,76%,30%)' }} />
                  <span className="text-[9px] text-slate-400">100%+ — exceptional</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: 'hsl(32,85%,42%)' }} />
                  <span className="text-[9px] text-slate-400">Approaching upper limit ⚠</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: 'hsl(0,85%,36%)' }} />
                  <span className="text-[9px] text-slate-400">Over upper limit — caution</span>
                </div>
                <p className="text-[9px] text-slate-600 pt-1 leading-relaxed">
                  Inverted (sat fat, sodium, etc.): green = well under limit, red = over limit.
                </p>
              </div>
            )}
          </section>

          {/* ── Food category ── */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Food category
              </label>
              <span className="text-[10px] text-slate-500">
                {selectedFoods.length}/{allFoods}
              </span>
            </div>
            <div className="flex gap-2 mb-2">
              <button
                onClick={() => onFoodsChange([...FOOD_CATEGORY_LIST])}
                disabled={selectedFoods.length === allFoods}
                className="flex-1 py-1 text-[10px] font-medium rounded bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Select all
              </button>
              <button
                onClick={() => onFoodsChange([FOOD_CATEGORY_LIST[0]])}
                disabled={selectedFoods.length === 1}
                className="flex-1 py-1 text-[10px] font-medium rounded bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Deselect all
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {FOOD_CATEGORY_LIST.map((cat) => {
                const active = selectedFoods.includes(cat)
                return (
                  <button
                    key={cat}
                    onClick={() => toggleFood(cat)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      active
                        ? 'bg-slate-100 text-slate-900'
                        : 'bg-slate-700 text-slate-500 hover:bg-slate-600 hover:text-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                )
              })}
            </div>
          </section>

          {/* ── Nutrient group ── */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Nutrient group
              </label>
              <span className="text-[10px] text-slate-500">
                {selectedNutrients.length}/{allNutrients}
              </span>
            </div>
            <div className="flex gap-2 mb-2">
              <button
                onClick={() => onNutrientsChange([...ALL_NUTRIENT_CATEGORIES])}
                disabled={selectedNutrients.length === allNutrients}
                className="flex-1 py-1 text-[10px] font-medium rounded bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Select all
              </button>
              <button
                onClick={() => onNutrientsChange([ALL_NUTRIENT_CATEGORIES[0]])}
                disabled={selectedNutrients.length === 1}
                className="flex-1 py-1 text-[10px] font-medium rounded bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Deselect all
              </button>
            </div>
            <div className="flex flex-col gap-1.5">
              {NUTRIENT_GROUP_LIST.map(({ value, label }) => {
                const active = selectedNutrients.includes(value)
                return (
                  <button
                    key={value}
                    onClick={() => toggleNutrient(value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium text-left transition-colors ${
                      active
                        ? 'bg-slate-100 text-slate-900'
                        : 'bg-slate-700 text-slate-500 hover:bg-slate-600 hover:text-slate-300'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </section>
        </div>

        {/* Reset footer */}
        {activeCount > 0 && (
          <div className="px-4 py-3 border-t border-slate-700 bg-slate-900 shrink-0">
            <button
              onClick={resetAll}
              className="w-full py-2 rounded-lg text-xs font-semibold text-slate-300 bg-slate-700 hover:bg-slate-600 hover:text-white transition-colors"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>
    </>
  )
}
