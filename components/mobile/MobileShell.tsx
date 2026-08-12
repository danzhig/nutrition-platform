'use client'

import { useEffect, useMemo, useState } from 'react'
import type { AppData, FoodRow } from '@/types/nutrition'
import type { ProfileId, RDAProfile } from '@/lib/rdaProfiles'
import { getProfile } from '@/lib/rdaProfiles'
import type { SavedProfile } from '@/lib/profileStorage'
import { loadSavedProfiles } from '@/lib/profileStorage'
import { useAuth } from '@/components/AuthProvider'
import MobileHeader from './MobileHeader'
import MobileAccountScreen from './MobileAccountScreen'
import MobileDVProfileSheet from './MobileDVProfileSheet'
import MobileNutritionScreen from './MobileNutritionScreen'
import MobileNutrientInfoSheet from './MobileNutrientInfoSheet'

const LS_RDA_SEL = 'np:m:rda-sel'

type Tab = 'calendar' | 'nutrition' | 'account'
type SheetId = 'dv' | 'nutrient' | null

const TABS: { id: Tab; label: string }[] = [
  { id: 'calendar', label: 'Calendar' },
  { id: 'nutrition', label: 'Nutrition' },
  { id: 'account', label: 'Account' },
]

function TabIcon({ id, active }: { id: Tab; active: boolean }) {
  const cls = active ? 'text-violet-400' : 'text-slate-400'
  if (id === 'calendar') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 ${cls}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4M16 3v4" />
      </svg>
    )
  }
  if (id === 'nutrition') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 ${cls}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
    )
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 ${cls}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
    </svg>
  )
}

export default function MobileShell({ data }: { data: AppData }) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('calendar')
  const [tabBarBottom, setTabBarBottom] = useState(0)
  const [openSheet, setOpenSheet] = useState<SheetId>(null)
  const [nutrientSheetName, setNutrientSheetName] = useState<string | null>(null)
  const [jumpToFood, setJumpToFood] = useState<FoodRow | null>(null)

  const [rdaSelection, setRdaSelection] = useState<string>('')
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([])

  useEffect(() => {
    const sel = localStorage.getItem(LS_RDA_SEL)
    if (sel !== null) setRdaSelection(sel)
  }, [])

  useEffect(() => {
    localStorage.setItem(LS_RDA_SEL, rdaSelection)
  }, [rdaSelection])

  useEffect(() => {
    if (!user) {
      setSavedProfiles([])
      setRdaSelection((sel) => (sel.startsWith('saved:') ? '' : sel))
      return
    }
    loadSavedProfiles().then(setSavedProfiles).catch(console.error)
  }, [user])

  const rdaProfile = useMemo<RDAProfile | null>(() => {
    if (!rdaSelection) return null
    if (rdaSelection.startsWith('saved:')) {
      const saved = savedProfiles.find((p) => p.id === rdaSelection.slice(6))
      if (!saved) return null
      const dw = typeof saved.values['dailyWeightG'] === 'number' ? (saved.values['dailyWeightG'] as number) : 1700
      return { id: 'custom', label: saved.name, shortLabel: saved.name, description: 'Saved custom profile', values: saved.values, dailyWeightG: dw }
    }
    return getProfile(rdaSelection as ProfileId, undefined)
  }, [rdaSelection, savedProfiles])

  // Body scroll lock — /m and / share one <body> (single root layout), so a
  // missing restore on unmount leaves the desktop app unscrollable after
  // client-side navigation away from /m.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [])

  // Visual Viewport API — keeps the tab bar pinned above the on-screen
  // keyboard on Android, where resizing the layout viewport is unreliable.
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return

    function update() {
      if (!vv) return
      const offset = window.innerHeight - vv.height - vv.offsetTop
      setTabBarBottom(Math.max(0, offset))
    }

    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [])

  return (
    <div className="flex flex-col h-dvh bg-slate-900 text-slate-100">
      <MobileHeader
        profileLabel={rdaProfile ? rdaProfile.shortLabel : 'No Profile'}
        onProfileClick={() => setOpenSheet('dv')}
      />

      <main className="flex-1 overflow-y-auto overscroll-contain">
        {activeTab === 'calendar' && (
          <div className="p-4 text-slate-400">Coming in Phase 5</div>
        )}
        {activeTab === 'nutrition' && (
          <MobileNutritionScreen
            foods={data.foods}
            allNutrients={data.nutrients}
            rdaProfile={rdaProfile}
            userId={user?.id ?? null}
            onSwitchToAccount={() => setActiveTab('account')}
            onOpenNutrientSheet={(name) => {
              setNutrientSheetName(name)
              setOpenSheet('nutrient')
            }}
            jumpToFood={jumpToFood}
            onJumpHandled={() => setJumpToFood(null)}
          />
        )}
        {activeTab === 'account' && (
          <MobileAccountScreen
            onLoginSuccess={() => setActiveTab('calendar')}
            rdaProfile={rdaProfile}
            onOpenDVSheet={() => setOpenSheet('dv')}
          />
        )}
      </main>

      <nav
        className="flex shrink-0 border-t border-slate-800 bg-slate-900"
        style={{
          height: 56,
          paddingBottom: `calc(env(safe-area-inset-bottom) + ${tabBarBottom}px)`,
        }}
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 touch-manipulation active:opacity-70 active:scale-[0.97] transition-opacity transition-transform duration-150"
            >
              <TabIcon id={tab.id} active={active} />
              <span className={`text-[11px] font-medium ${active ? 'text-violet-400' : 'text-slate-400'}`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </nav>

      <MobileDVProfileSheet
        open={openSheet === 'dv'}
        onClose={() => setOpenSheet(null)}
        rdaSelection={rdaSelection}
        onSelect={setRdaSelection}
        savedProfiles={savedProfiles}
        isLoggedIn={!!user}
      />

      <MobileNutrientInfoSheet
        open={openSheet === 'nutrient'}
        onClose={() => setOpenSheet(null)}
        nutrientName={nutrientSheetName}
        allNutrients={data.nutrients}
        foods={data.foods}
        onSelectFood={(food) => {
          setActiveTab('nutrition')
          setJumpToFood(food)
        }}
      />
    </div>
  )
}
