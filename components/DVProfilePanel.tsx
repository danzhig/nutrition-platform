'use client'

import { useState } from 'react'
import type { NutrientMeta } from '@/types/nutrition'
import type { ProfileId, RDAValues } from '@/lib/rdaProfiles'
import { RDA_PROFILES, NUTRIENT_BEHAVIORS } from '@/lib/rdaProfiles'
import { NUTRIENT_GROUP_LIST } from '@/lib/filterConstants'
import type { SavedProfile } from '@/lib/profileStorage'
import { saveNewProfile, updateSavedProfile, deleteSavedProfile } from '@/lib/profileStorage'

interface Props {
  nutrients: NutrientMeta[]
  /** '' | ProfileId | 'custom' | 'saved:<uuid>' */
  rdaSelection: string
  customRdaValues: RDAValues
  savedProfiles: SavedProfile[]
  isLoggedIn: boolean
  onRdaSelectionChange: (sel: string) => void
  onCustomValuesChange: (values: RDAValues) => void
  onSavedProfilesChange: (profiles: SavedProfile[]) => void
}

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
}

const BEHAVIOR_BADGE: Record<string, string> = {
  limit: '↓',
  'normal-with-ul': '⚠',
}

export default function DVProfilePanel({
  nutrients,
  rdaSelection,
  customRdaValues,
  savedProfiles,
  isLoggedIn,
  onRdaSelectionChange,
  onCustomValuesChange,
  onSavedProfilesChange,
}: Props) {
  const [customExpanded, setCustomExpanded] = useState(false)
  const [saveProfileName, setSaveProfileName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)

  // Seed custom editor from a built-in profile
  function seedFrom(baseId: ProfileId) {
    const base = RDA_PROFILES.find((p) => p.id === baseId)
    if (base) onCustomValuesChange({ ...base.values })
  }

  function handleSelectBuiltIn(id: ProfileId) {
    onRdaSelectionChange(id)
    setEditingProfileId(null)
  }

  function handleSelectCustom() {
    onRdaSelectionChange('custom')
    setCustomExpanded(true)
    if (Object.keys(customRdaValues).length === 0) seedFrom('male-avg')
    setEditingProfileId(null)
  }

  function handleSelectSaved(id: string) {
    onRdaSelectionChange(rdaSelection === `saved:${id}` ? '' : `saved:${id}`)
    setEditingProfileId(null)
  }

  function handleEditSaved(p: SavedProfile) {
    setEditingProfileId(p.id)
    setSaveProfileName(p.name)
    setUpdateError(null)
    onCustomValuesChange({ ...p.values })
    onRdaSelectionChange('custom')
    setCustomExpanded(true)
  }

  function cancelEdit() {
    setEditingProfileId(null)
    setSaveProfileName('')
    setUpdateError(null)
  }

  async function handleSaveNew() {
    if (!saveProfileName.trim()) return
    setSaving(true)
    setSaveError(null)
    try {
      const created = await saveNewProfile(saveProfileName.trim(), customRdaValues)
      onSavedProfilesChange([...savedProfiles, created])
      onRdaSelectionChange(`saved:${created.id}`)
      setSaveProfileName('')
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdate() {
    if (!editingProfileId || !saveProfileName.trim()) return
    setUpdating(true)
    setUpdateError(null)
    try {
      await updateSavedProfile(editingProfileId, saveProfileName.trim(), customRdaValues)
      onSavedProfilesChange(
        savedProfiles.map((p) =>
          p.id === editingProfileId
            ? { ...p, name: saveProfileName.trim(), values: customRdaValues }
            : p
        )
      )
      onRdaSelectionChange(`saved:${editingProfileId}`)
      setEditingProfileId(null)
      setSaveProfileName('')
    } catch (e: unknown) {
      setUpdateError(e instanceof Error ? e.message : 'Update failed')
    } finally {
      setUpdating(false)
    }
  }

  async function handleDelete(p: SavedProfile) {
    if (!confirm(`Delete "${p.name}"?`)) return
    try {
      await deleteSavedProfile(p.id)
      onSavedProfilesChange(savedProfiles.filter((sp) => sp.id !== p.id))
      if (rdaSelection === `saved:${p.id}`) onRdaSelectionChange('')
    } catch (e: unknown) {
      console.error(e)
    }
  }

  // Effective values shown in the editor
  const effectiveValues: RDAValues =
    Object.keys(customRdaValues).length > 0
      ? customRdaValues
      : RDA_PROFILES.find((p) => p.id === 'male-avg')?.values ?? {}

  const isCustom = rdaSelection === 'custom'

  return (
    <div className="w-64 flex-shrink-0 bg-slate-800 border border-slate-700 rounded-lg overflow-y-auto max-h-[calc(100vh-130px)] text-xs">
      {/* Header */}
      <div className="sticky top-0 bg-slate-800 border-b border-slate-700 z-10 px-3 py-2">
        <p className="text-slate-300 font-semibold text-xs">DV Profile</p>
        <p className="text-slate-500 text-[10px] mt-0.5">Select or build a daily value profile</p>
      </div>

      <div className="px-3 py-3 space-y-4">

        {/* ── Saved profiles — shown first when logged in ── */}
        {isLoggedIn && savedProfiles.length > 0 && (
          <div>
            <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              My saved profiles
            </p>
            <div className="space-y-1">
              {savedProfiles.map((p) => (
                <div
                  key={p.id}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md border transition-colors ${
                    rdaSelection === `saved:${p.id}`
                      ? 'bg-violet-700 border-violet-600 text-white'
                      : 'bg-slate-700 border-slate-600 text-slate-300'
                  }`}
                >
                  <button
                    onClick={() => handleSelectSaved(p.id)}
                    className="flex-1 text-left text-[11px] font-medium truncate"
                  >
                    {p.name}
                  </button>
                  <button
                    onClick={() => handleEditSaved(p)}
                    title="Edit profile"
                    className="shrink-0 text-[11px] text-slate-400 hover:text-violet-400 transition-colors px-1"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => handleDelete(p)}
                    title="Delete profile"
                    className="shrink-0 text-[11px] text-slate-400 hover:text-red-400 transition-colors px-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Built-in profiles ── */}
        <div className="space-y-1">
          <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Built-in profiles
          </p>
          <button
            onClick={() => onRdaSelectionChange('')}
            className={`w-full text-left px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
              rdaSelection === ''
                ? 'bg-violet-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            None
          </button>
          {RDA_PROFILES.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectBuiltIn(p.id)}
              title={p.description}
              className={`w-full text-left px-2.5 py-1.5 rounded-md transition-colors ${
                rdaSelection === p.id
                  ? 'bg-violet-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <span className="block text-[11px] font-medium">{p.label}</span>
              <span className="block text-[9px] opacity-60 mt-0.5 leading-tight">{p.description}</span>
            </button>
          ))}
        </div>

        {/* ── Saved profiles placeholder when none exist yet ── */}
        {isLoggedIn && savedProfiles.length === 0 && (
          <p className="text-[10px] text-slate-600 italic">No saved profiles yet.</p>
        )}

        {/* ── Custom profile ── */}
        <div>
          <button
            onClick={handleSelectCustom}
            className={`w-full text-left px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
              isCustom
                ? 'bg-violet-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Custom…
          </button>

          {isCustom && (
            <div className="mt-2 rounded-md border border-slate-600 bg-slate-900 overflow-hidden">
              {/* Toggle */}
              <button
                onClick={() => setCustomExpanded((v) => !v)}
                className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
              >
                <span>
                  {editingProfileId
                    ? `Editing: ${savedProfiles.find((p) => p.id === editingProfileId)?.name ?? '…'}`
                    : 'Edit custom targets'}
                </span>
                <span className="text-slate-500">{customExpanded ? '▲' : '▼'}</span>
              </button>

              {customExpanded && (
                <div className="px-3 pb-3">

                  {/* Copy from */}
                  <div className="mb-3">
                    <p className="text-[9px] text-slate-500 mb-1">Copy from:</p>
                    <div className="flex flex-wrap gap-1">
                      {RDA_PROFILES.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => seedFrom(p.id)}
                          className="px-1.5 py-0.5 rounded text-[9px] bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white transition-colors"
                        >
                          {p.shortLabel}
                        </button>
                      ))}
                      {savedProfiles.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => onCustomValuesChange({ ...p.values })}
                          title={`Copy from "${p.name}"`}
                          className="px-1.5 py-0.5 rounded text-[9px] bg-violet-900 text-violet-300 hover:bg-violet-800 hover:text-white transition-colors max-w-[72px] truncate"
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Nutrient inputs */}
                  {NUTRIENT_GROUP_LIST.map((g) => {
                    const editable = nutrients
                      .filter((n) => n.nutrient_category === g.value)
                      .filter((n) => {
                        const v = RDA_PROFILES.find((p) => p.id === 'male-avg')?.values[n.nutrient_name]
                        return v != null
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
                          const currentVal = effectiveValues[n.nutrient_name]
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
                                  onCustomValuesChange({
                                    ...effectiveValues,
                                    [n.nutrient_name]: isNaN(val as number) ? null : val,
                                  })
                                }}
                                className="w-14 text-[10px] text-right px-1.5 py-0.5 bg-slate-700 border border-slate-600 text-slate-100 rounded focus:ring-1 focus:ring-violet-500 outline-none appearance-none"
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

                  <p className="mt-2 text-[9px] text-slate-600 leading-relaxed">
                    <span className="text-amber-400">⚠</span> has a safety upper limit ·{' '}
                    <span className="text-slate-400">↓</span> lower is better
                  </p>

                  {/* Save / update */}
                  {isLoggedIn && (
                    <div className="mt-3 border-t border-slate-700 pt-3">
                      {editingProfileId ? (
                        <>
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="text-[10px] font-semibold text-slate-400">Update profile</p>
                            <button
                              onClick={cancelEdit}
                              className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              placeholder="Profile name…"
                              value={saveProfileName}
                              onChange={(e) => setSaveProfileName(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') handleUpdate() }}
                              className="flex-1 min-w-0 px-2 py-1 text-[10px] bg-slate-700 border border-slate-600 text-slate-100 placeholder-slate-500 rounded focus:ring-1 focus:ring-violet-500 outline-none"
                            />
                            <button
                              onClick={handleUpdate}
                              disabled={updating || !saveProfileName.trim()}
                              className="px-2 py-1 text-[10px] font-semibold rounded bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white transition-colors shrink-0"
                            >
                              {updating ? '…' : 'Update'}
                            </button>
                          </div>
                          {updateError && (
                            <p className="mt-1 text-[10px] text-red-400">{updateError}</p>
                          )}
                        </>
                      ) : (
                        <>
                          <p className="text-[10px] font-semibold text-slate-400 mb-1.5">
                            Save as named profile
                          </p>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              placeholder="Profile name…"
                              value={saveProfileName}
                              onChange={(e) => setSaveProfileName(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') handleSaveNew() }}
                              className="flex-1 min-w-0 px-2 py-1 text-[10px] bg-slate-700 border border-slate-600 text-slate-100 placeholder-slate-500 rounded focus:ring-1 focus:ring-violet-500 outline-none"
                            />
                            <button
                              onClick={handleSaveNew}
                              disabled={saving || !saveProfileName.trim()}
                              className="px-2 py-1 text-[10px] font-semibold rounded bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white transition-colors shrink-0"
                            >
                              {saving ? '…' : 'Save'}
                            </button>
                          </div>
                          {saveError && (
                            <p className="mt-1 text-[10px] text-red-400">{saveError}</p>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {!isLoggedIn && (
          <p className="text-[10px] text-slate-600 italic">Sign in to save custom profiles.</p>
        )}
      </div>
    </div>
  )
}
