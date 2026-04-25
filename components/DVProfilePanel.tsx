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
  /** When true: renders only the custom editor (no profile list). Used when embedded below the tab bar. */
  editorOnly?: boolean
  /** When provided: renders as a floating overlay instead of inline. */
  onClose?: () => void
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
  editorOnly = false,
  onClose,
}: Props) {
  const [customExpanded, setCustomExpanded] = useState(false)
  const [saveProfileName, setSaveProfileName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)
  // Overlay-only state
  const [overlayView, setOverlayView] = useState<'picker' | 'editor'>('picker')
  const [deletingProfileId, setDeletingProfileId] = useState<string | null>(null)

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
      onClose?.()
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
      onClose?.()
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

  async function handleDeleteOverlay(p: SavedProfile) {
    try {
      await deleteSavedProfile(p.id)
      onSavedProfilesChange(savedProfiles.filter((sp) => sp.id !== p.id))
      if (rdaSelection === `saved:${p.id}`) onRdaSelectionChange('')
      setDeletingProfileId(null)
    } catch (e: unknown) {
      console.error(e)
      setDeletingProfileId(null)
    }
  }

  const effectiveValues: RDAValues =
    Object.keys(customRdaValues).length > 0
      ? customRdaValues
      : RDA_PROFILES.find((p) => p.id === 'male-avg')?.values ?? {}

  const isCustom = rdaSelection === 'custom'

  // ── Shared nutrient input grid ────────────────────────────────────────────
  function buildGroupCards() {
    const groups = NUTRIENT_GROUP_LIST.map((g) => {
      const editable = nutrients
        .filter((n) => n.nutrient_category === g.value)
        .filter((n) => RDA_PROFILES.find((p) => p.id === 'male-avg')?.values[n.nutrient_name] != null)
      return { g, editable }
    }).filter(({ editable }) => editable.length > 0)

    return groups.map(({ g, editable }) => (
      <div key={g.value} className="bg-slate-900/60 rounded-lg p-3">
        <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">{g.label}</p>
        {editable.map((n) => {
          const behavior = NUTRIENT_BEHAVIORS[n.nutrient_name]
          const badge = behavior ? BEHAVIOR_BADGE[behavior] : null
          const currentVal = effectiveValues[n.nutrient_name]
          return (
            <div key={n.nutrient_id} className="flex items-center gap-1 py-[3px]">
              <span className="text-[10px] text-slate-300 flex-1 min-w-0 truncate leading-none">
                {shortName(n.nutrient_name)}
                {badge && <span className="ml-0.5 text-[8px] text-amber-400">{badge}</span>}
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
              <span className="text-[9px] text-slate-500 w-8 shrink-0 leading-none">{n.unit}</span>
            </div>
          )
        })}
      </div>
    ))
  }

  // ── Shared editor body (editorOnly + sidebar modes) ───────────────────────
  function renderEditorBody(multiCol: boolean) {
    const groupCards = buildGroupCards()

    return (
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
        {multiCol ? (
          <div className="grid grid-cols-3 gap-3">{groupCards}</div>
        ) : (
          <div>{groupCards}</div>
        )}

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
                  <button onClick={cancelEdit} className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors">
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
                {updateError && <p className="mt-1 text-[10px] text-red-400">{updateError}</p>}
              </>
            ) : (
              <>
                <p className="text-[10px] font-semibold text-slate-400 mb-1.5">Save as named profile</p>
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
                {saveError && <p className="mt-1 text-[10px] text-red-400">{saveError}</p>}
              </>
            )}
          </div>
        )}
      </div>
    )
  }

  // ── Overlay mode ──────────────────────────────────────────────────────────
  if (onClose) {
    // PICKER VIEW
    if (overlayView === 'picker') {
      return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
          <div className="fixed inset-0 bg-black/60" onClick={onClose} />
          <div className="relative w-80 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
              <span className="text-sm font-semibold text-slate-100">DV Profile</span>
              <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-base leading-none">✕</button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto">
              {/* My Profiles */}
              {isLoggedIn && savedProfiles.length > 0 && (
                <div className="px-3 pt-3 pb-2">
                  <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-2">My Profiles</p>
                  <div className="space-y-1">
                    {savedProfiles.map((sp) =>
                      deletingProfileId === sp.id ? (
                        <div key={sp.id} className="flex items-center justify-between px-2.5 py-2 rounded-md bg-red-900/30 border border-red-700/60">
                          <span className="text-[11px] text-red-300 truncate mr-2">Delete &ldquo;{sp.name}&rdquo;?</span>
                          <div className="flex gap-1.5 flex-shrink-0">
                            <button
                              onClick={() => handleDeleteOverlay(sp)}
                              className="px-2 py-0.5 text-[10px] font-semibold bg-red-600 hover:bg-red-500 text-white rounded transition-colors"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setDeletingProfileId(null)}
                              className="px-2 py-0.5 text-[10px] bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
                            >
                              No
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          key={sp.id}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md border transition-colors ${
                            rdaSelection === `saved:${sp.id}`
                              ? 'bg-violet-700 border-violet-600 text-white'
                              : 'bg-slate-700 border-slate-600 text-slate-300'
                          }`}
                        >
                          <button
                            onClick={() => { onRdaSelectionChange(`saved:${sp.id}`); onClose() }}
                            className="flex-1 text-left text-[11px] font-medium truncate"
                          >
                            {sp.name}
                          </button>
                          <button
                            onClick={() => {
                              setEditingProfileId(sp.id)
                              setSaveProfileName(sp.name)
                              setUpdateError(null)
                              onCustomValuesChange({ ...sp.values })
                              setOverlayView('editor')
                            }}
                            title="Edit profile"
                            className="shrink-0 text-[11px] text-slate-400 hover:text-violet-400 transition-colors px-1"
                          >
                            ✎
                          </button>
                          <button
                            onClick={() => setDeletingProfileId(sp.id)}
                            title="Delete profile"
                            className="shrink-0 text-[11px] text-slate-400 hover:text-red-400 transition-colors px-1"
                          >
                            ✕
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Built-in profiles */}
              <div className="px-3 py-2">
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Built-in</p>
                <div className="space-y-1">
                  <button
                    onClick={() => { onRdaSelectionChange(''); onClose() }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                      rdaSelection === '' ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    None
                  </button>
                  {RDA_PROFILES.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => { onRdaSelectionChange(p.id); onClose() }}
                      title={p.description}
                      className={`w-full text-left px-2.5 py-1.5 rounded-md transition-colors ${
                        rdaSelection === p.id ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      <span className="block text-[11px] font-medium">{p.label}</span>
                      <span className="block text-[9px] opacity-60 mt-0.5 leading-tight">{p.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              {!isLoggedIn && (
                <p className="px-3 pb-2 text-[10px] text-slate-600 italic">Sign in to save custom profiles.</p>
              )}
            </div>

            {/* Custom profile button — fixed at bottom of picker */}
            <div className="border-t border-slate-700 px-3 py-2.5">
              <button
                onClick={() => {
                  setEditingProfileId(null)
                  setSaveProfileName('')
                  setSaveError(null)
                  if (Object.keys(customRdaValues).length === 0) seedFrom('male-avg')
                  setOverlayView('editor')
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-md text-[11px] font-medium border transition-colors ${
                  rdaSelection === 'custom'
                    ? 'bg-violet-600 border-violet-500 text-white'
                    : 'bg-slate-700/60 border-slate-600 border-dashed text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                + Custom Profile…
              </button>
            </div>
          </div>
        </div>
      )
    }

    // EDITOR VIEW
    const groupCards = buildGroupCards()
    return (
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-10">
        <div className="fixed inset-0 bg-black/60" onClick={onClose} />
        <div className="relative w-[500px] max-h-[85vh] flex flex-col bg-slate-800 border border-slate-600 rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700 flex-shrink-0">
            <button
              onClick={() => { setOverlayView('picker'); setSaveError(null); setUpdateError(null) }}
              className="text-slate-400 hover:text-white transition-colors text-xs shrink-0"
            >
              ← Back
            </button>
            <span className="flex-1 text-sm font-semibold text-slate-100">
              {editingProfileId
                ? `Edit: ${savedProfiles.find((p) => p.id === editingProfileId)?.name ?? '…'}`
                : 'Custom Profile'}
            </span>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-base leading-none shrink-0">✕</button>
          </div>

          {/* Profile name — at the top */}
          <div className="px-4 pt-3 pb-3 border-b border-slate-700 flex-shrink-0">
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Profile Name
            </label>
            <input
              type="text"
              placeholder="e.g. Pregnancy, Athlete, My Custom…"
              value={saveProfileName}
              onChange={(e) => setSaveProfileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && saveProfileName.trim()) {
                  editingProfileId ? handleUpdate() : handleSaveNew()
                }
              }}
              className="w-full px-3 py-1.5 text-sm bg-slate-700 border border-slate-600 text-slate-100 placeholder-slate-500 rounded-md focus:ring-1 focus:ring-violet-500 outline-none"
              autoFocus
            />
          </div>

          {/* Scrollable nutrient editor */}
          <div className="flex-1 overflow-y-auto min-h-0 px-4 py-3">
            {/* Copy from */}
            <div className="mb-3">
              <p className="text-[9px] text-slate-500 mb-1.5">Copy from:</p>
              <div className="flex flex-wrap gap-1.5">
                {RDA_PROFILES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => seedFrom(p.id)}
                    className="px-2 py-1 rounded text-[10px] bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white transition-colors"
                  >
                    {p.shortLabel}
                  </button>
                ))}
                {savedProfiles
                  .filter((p) => p.id !== editingProfileId)
                  .map((p) => (
                    <button
                      key={p.id}
                      onClick={() => onCustomValuesChange({ ...p.values })}
                      title={`Copy from "${p.name}"`}
                      className="px-2 py-1 rounded text-[10px] bg-violet-900 text-violet-300 hover:bg-violet-800 hover:text-white transition-colors max-w-[80px] truncate"
                    >
                      {p.name}
                    </button>
                  ))}
              </div>
            </div>

            {/* Nutrient inputs — 2-col grid */}
            <div className="grid grid-cols-2 gap-2">{groupCards}</div>

            <p className="mt-3 text-[9px] text-slate-600 leading-relaxed">
              <span className="text-amber-400">⚠</span> has a safety upper limit ·{' '}
              <span className="text-slate-400">↓</span> lower is better
            </p>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 border-t border-slate-700 px-4 py-3 flex items-center justify-between gap-2">
            <div className="text-[10px] text-red-400 min-w-0 truncate">
              {saveError || updateError || ''}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => { onRdaSelectionChange('custom'); onClose() }}
                className="px-3 py-1.5 text-[11px] font-medium rounded-md border border-slate-600 bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
              >
                Apply
              </button>
              {isLoggedIn && (
                <button
                  onClick={editingProfileId ? handleUpdate : handleSaveNew}
                  disabled={saving || updating || !saveProfileName.trim()}
                  className="px-3 py-1.5 text-[11px] font-semibold rounded-md bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white transition-colors"
                >
                  {saving || updating ? '…' : editingProfileId ? 'Update Profile' : 'Save Profile'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Editor-only mode: embedded below the tab bar, no profile list ──────────
  if (editorOnly) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden text-xs mb-4">
        <button
          onClick={() => setCustomExpanded((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-[11px] font-semibold text-slate-300 hover:bg-slate-700/50 transition-colors border-b border-slate-700"
        >
          <span>
            {editingProfileId
              ? `Editing: ${savedProfiles.find((p) => p.id === editingProfileId)?.name ?? '…'}`
              : 'Custom DV targets'}
          </span>
          <span className="text-slate-500 text-[10px]">{customExpanded ? '▲' : '▼'}</span>
        </button>
        {customExpanded && renderEditorBody(true)}
      </div>
    )
  }

  // ── Sidebar mode (original layout) ────────────────────────────────────────
  return (
    <div className="w-64 flex-shrink-0 bg-slate-800 border border-slate-700 rounded-lg overflow-y-auto max-h-[calc(100vh-130px)] text-xs">
      <div className="sticky top-0 bg-slate-800 border-b border-slate-700 z-10 px-3 py-2">
        <p className="text-slate-300 font-semibold text-xs">DV Profile</p>
        <p className="text-slate-500 text-[10px] mt-0.5">Select or build a daily value profile</p>
      </div>

      <div className="px-3 py-3 space-y-4">

        {/* Saved profiles first */}
        {isLoggedIn && savedProfiles.length > 0 && (
          <div>
            <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">My saved profiles</p>
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
                  <button onClick={() => handleSelectSaved(p.id)} className="flex-1 text-left text-[11px] font-medium truncate">
                    {p.name}
                  </button>
                  <button onClick={() => handleEditSaved(p)} title="Edit profile" className="shrink-0 text-[11px] text-slate-400 hover:text-violet-400 transition-colors px-1">✎</button>
                  <button onClick={() => handleDelete(p)} title="Delete profile" className="shrink-0 text-[11px] text-slate-400 hover:text-red-400 transition-colors px-1">✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Built-in profiles */}
        <div className="space-y-1">
          <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Built-in profiles</p>
          <button
            onClick={() => onRdaSelectionChange('')}
            className={`w-full text-left px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${rdaSelection === '' ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
          >
            None
          </button>
          {RDA_PROFILES.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectBuiltIn(p.id)}
              title={p.description}
              className={`w-full text-left px-2.5 py-1.5 rounded-md transition-colors ${rdaSelection === p.id ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
            >
              <span className="block text-[11px] font-medium">{p.label}</span>
              <span className="block text-[9px] opacity-60 mt-0.5 leading-tight">{p.description}</span>
            </button>
          ))}
        </div>

        {isLoggedIn && savedProfiles.length === 0 && (
          <p className="text-[10px] text-slate-600 italic">No saved profiles yet.</p>
        )}

        {/* Custom */}
        <div>
          <button
            onClick={handleSelectCustom}
            className={`w-full text-left px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${isCustom ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
          >
            Custom…
          </button>

          {isCustom && (
            <div className="mt-2 rounded-md border border-slate-600 bg-slate-900 overflow-hidden">
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
              {customExpanded && renderEditorBody(false)}
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
