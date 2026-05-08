'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAuth } from './AuthProvider'
import type { HeatmapData } from '@/types/nutrition'
import type { ProfileId, RDAProfile, RDAValues } from '@/lib/rdaProfiles'
import { getProfile } from '@/lib/rdaProfiles'
import type { SavedProfile } from '@/lib/profileStorage'
import { loadSavedProfiles } from '@/lib/profileStorage'
import AuthButton from '@/components/AuthButton'
import MainView from './MainView'
import DVProfilePanel from './DVProfilePanel'

const LS_RDA_SEL = 'np:global-rda-selection'
const LS_CUSTOM_RDA = 'np:global-custom-rda'

interface Props {
  data: HeatmapData
}

export default function AppShell({ data }: Props) {
  const { user } = useAuth()

  const [rdaSelection, setRdaSelection] = useState<string>(() => {
    if (typeof window === 'undefined') return 'male-avg'
    const global = localStorage.getItem(LS_RDA_SEL)
    if (global) return global
    // Migrate from legacy draft-plan key on first load
    try {
      const draft = localStorage.getItem('np:draft-plan')
      if (draft) {
        const parsed = JSON.parse(draft)
        if (parsed.rda_selection) return parsed.rda_selection
      }
    } catch { /* ignore */ }
    return 'male-avg'
  })

  const [customRdaValues, setCustomRdaValues] = useState<RDAValues>(() => {
    if (typeof window === 'undefined') return {}
    try {
      const global = localStorage.getItem(LS_CUSTOM_RDA)
      if (global) return JSON.parse(global)
      const legacy = localStorage.getItem('np:draft-custom-rda')
      if (legacy) return JSON.parse(legacy)
    } catch { /* ignore */ }
    return {}
  })

  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([])
  const [showDVOverlay, setShowDVOverlay] = useState(false)

  useEffect(() => {
    localStorage.setItem(LS_RDA_SEL, rdaSelection)
  }, [rdaSelection])

  useEffect(() => {
    if (Object.keys(customRdaValues).length > 0) {
      localStorage.setItem(LS_CUSTOM_RDA, JSON.stringify(customRdaValues))
    }
  }, [customRdaValues])

  useEffect(() => {
    if (!user) {
      setSavedProfiles([])
      setRdaSelection((sel) => (sel.startsWith('saved:') ? 'male-avg' : sel))
      return
    }
    loadSavedProfiles().then(setSavedProfiles).catch(console.error)
  }, [user])

  const rdaProfile = useMemo<RDAProfile | null>(() => {
    if (!rdaSelection) return null
    if (rdaSelection === 'custom') return getProfile('custom', customRdaValues)
    if (rdaSelection.startsWith('saved:')) {
      const savedId = rdaSelection.slice(6)
      const saved = savedProfiles.find((p) => p.id === savedId)
      if (saved) {
        const label = saved.name
        const shortLabel = label.length > 13 ? label.slice(0, 12) + '…' : label
        return { id: 'custom', label, shortLabel, description: 'Saved custom profile', values: saved.values }
      }
      return null
    }
    return getProfile(rdaSelection as ProfileId, undefined)
  }, [rdaSelection, savedProfiles, customRdaValues])

  return (
    <main className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Nutrition Platform</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {data.foods.length} foods · {data.nutrients.length} nutrients
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowDVOverlay(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs border transition-colors ${
                rdaProfile
                  ? 'bg-slate-700/60 hover:bg-slate-700 border-slate-600 text-slate-300'
                  : 'bg-violet-600/10 hover:bg-violet-600/20 border-violet-500/50 hover:border-violet-400/70 text-violet-300'
              }`}
            >
              <span className={`text-[10px] ${rdaProfile ? 'text-slate-500' : 'text-violet-400/80'}`}>
                DV Profile
              </span>
              <span className={rdaProfile ? 'text-violet-300 font-semibold' : 'text-violet-300/60'}>
                {rdaProfile ? rdaProfile.shortLabel : 'None'}
              </span>
              <span className="text-slate-500 text-[9px]">▾</span>
            </button>
            <AuthButton />
          </div>
        </div>
      </header>

      {/* Main content */}
      <section className="px-4 py-5 max-w-screen-2xl mx-auto">
        <MainView
          data={data}
          rdaProfile={rdaProfile}
          rdaSelection={rdaSelection}
          onRdaSelectionChange={setRdaSelection}
          onOpenDVProfile={() => setShowDVOverlay(true)}
        />
      </section>

      {showDVOverlay && (
        <DVProfilePanel
          onClose={() => setShowDVOverlay(false)}
          nutrients={data.nutrients}
          rdaSelection={rdaSelection}
          customRdaValues={customRdaValues}
          savedProfiles={savedProfiles}
          isLoggedIn={!!user}
          onRdaSelectionChange={setRdaSelection}
          onCustomValuesChange={setCustomRdaValues}
          onSavedProfilesChange={setSavedProfiles}
        />
      )}
    </main>
  )
}
