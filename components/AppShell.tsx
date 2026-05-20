'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useAuth } from './AuthProvider'
import type { AppData } from '@/types/nutrition'
import type { ProfileId, RDAProfile, RDAValues } from '@/lib/rdaProfiles'
import { getProfile } from '@/lib/rdaProfiles'
import type { SavedProfile } from '@/lib/profileStorage'
import { loadSavedProfiles } from '@/lib/profileStorage'
import { loadUserPreferences, saveUserPreferences, deleteUserPreferences } from '@/lib/userPreferencesStorage'
import AuthButton from '@/components/AuthButton'
import MainView from './MainView'
import DVProfilePanel from './DVProfilePanel'
import TourOverlay from './TourOverlay'
import { SALMON_MEAL_TOUR } from '@/lib/tourSteps'

type MainTab = 'data' | 'meals' | 'calendar' | 'diet'
const TAB_KEY = 'np:mainTab'

const LS_RDA_SEL = 'np:global-rda-selection'
const LS_CUSTOM_RDA = 'np:global-custom-rda'

interface Props {
  data: AppData
}

export default function AppShell({ data }: Props) {
  const { user } = useAuth()

  const [mainTab, setMainTab] = useState<MainTab>(() => {
    if (typeof window === 'undefined') return 'meals'
    const saved = localStorage.getItem(TAB_KEY)
    return (saved === 'data' || saved === 'meals' || saved === 'calendar' || saved === 'diet') ? saved : 'meals'
  })

  function handleMainTabChange(tab: MainTab) {
    setMainTab(tab)
    localStorage.setItem(TAB_KEY, tab)
  }

  const [tourActive, setTourActive] = useState(false)

  function startDemo() {
    // Switch to Day Planner tab and reset MealPlanner to sidebar (Day Builder) view
    handleMainTabChange('meals')
    localStorage.setItem('nutrition-view-mode', 'sidebar')
    window.dispatchEvent(new CustomEvent('np:tour:reset-view'))
    setTourActive(true)
  }

  const [rdaSelection, setRdaSelection] = useState<string>('male-avg')
  const [customRdaValues, setCustomRdaValues] = useState<RDAValues>({})
  // Becomes true after the initial localStorage read is done — guards save effects
  // from overwriting persisted values before they've been read.
  const lsReady = useRef(false)

  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([])
  const [showDVOverlay, setShowDVOverlay] = useState(false)
  const [defaultProfileKey, setDefaultProfileKey] = useState<string | null>(null)

  // Read persisted values after mount (avoids SSR hydration mismatch).
  useEffect(() => {
    const sel = localStorage.getItem(LS_RDA_SEL)
    if (sel !== null) {
      setRdaSelection(sel)
    } else {
      // Migrate from legacy draft-plan key on first load
      try {
        const draft = localStorage.getItem('np:draft-plan')
        if (draft) {
          const parsed = JSON.parse(draft)
          if (parsed.rda_selection) setRdaSelection(parsed.rda_selection)
        }
      } catch { /* ignore */ }
    }
    try {
      const custom = localStorage.getItem(LS_CUSTOM_RDA)
      if (custom) {
        setCustomRdaValues(JSON.parse(custom))
      } else {
        const legacy = localStorage.getItem('np:draft-custom-rda')
        if (legacy) setCustomRdaValues(JSON.parse(legacy))
      }
    } catch { /* ignore */ }
    lsReady.current = true
  }, [])

  useEffect(() => {
    if (!lsReady.current) return
    localStorage.setItem(LS_RDA_SEL, rdaSelection)
  }, [rdaSelection])

  useEffect(() => {
    if (!lsReady.current) return
    if (Object.keys(customRdaValues).length > 0) {
      localStorage.setItem(LS_CUSTOM_RDA, JSON.stringify(customRdaValues))
    }
  }, [customRdaValues])

  useEffect(() => {
    if (!user) {
      setSavedProfiles([])
      setDefaultProfileKey(null)
      setRdaSelection((sel) => (sel.startsWith('saved:') ? 'male-avg' : sel))
      return
    }
    Promise.all([loadSavedProfiles(), loadUserPreferences()])
      .then(([profiles, prefs]) => {
        setSavedProfiles(profiles)
        if (prefs !== null) {
          setDefaultProfileKey(prefs.default_profile)
          setRdaSelection(prefs.default_profile)
        }
      })
      .catch(console.error)
  }, [user])

  async function handleSetDefault(key: string | null) {
    if (key === null) {
      setDefaultProfileKey(null)
      deleteUserPreferences().catch(console.error)
    } else {
      setDefaultProfileKey(key)
      saveUserPreferences({ default_profile: key }).catch(console.error)
    }
  }

  const rdaProfile = useMemo<RDAProfile | null>(() => {
    if (!rdaSelection) return null
    if (rdaSelection === 'custom') return getProfile('custom', customRdaValues)
    if (rdaSelection.startsWith('saved:')) {
      const savedId = rdaSelection.slice(6)
      const saved = savedProfiles.find((p) => p.id === savedId)
      if (saved) {
        const label = saved.name
        const shortLabel = label.length > 13 ? label.slice(0, 12) + '…' : label
        const dw = typeof saved.values['dailyWeightG'] === 'number'
          ? (saved.values['dailyWeightG'] as number)
          : 1700
        return { id: 'custom', label, shortLabel, description: 'Saved custom profile', values: saved.values, dailyWeightG: dw }
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
              onClick={startDemo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs border border-emerald-700/60 bg-emerald-900/20 hover:bg-emerald-900/40 text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <span>▶</span>
              <span className="font-medium">Demo</span>
            </button>
            <button
              data-tour="dv-profile-btn"
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
          tab={mainTab}
          onTabChange={handleMainTabChange}
        />
      </section>

      {tourActive && (
        <TourOverlay
          steps={SALMON_MEAL_TOUR}
          onEnd={() => {
            window.dispatchEvent(new CustomEvent('np:tour:demo-cleanup'))
            setTourActive(false)
          }}
        />
      )}

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
          defaultProfileKey={defaultProfileKey}
          onSetDefault={handleSetDefault}
        />
      )}
    </main>
  )
}
