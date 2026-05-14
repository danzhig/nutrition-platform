'use client'

import { useState } from 'react'
import type { HeatmapData } from '@/types/nutrition'
import type { RDAProfile } from '@/lib/rdaProfiles'
import DataView from './DataView'
import MealPlanner from './MealPlanner'
import CalendarView from './CalendarView'
import DietView from './DietView'

interface Props {
  data: HeatmapData
  rdaProfile: RDAProfile | null
  rdaSelection: string
  onRdaSelectionChange: (sel: string) => void
  onOpenDVProfile: () => void
}

type Tab = 'data' | 'meals' | 'calendar' | 'diet'

const TAB_KEY = 'np:mainTab'

export default function MainView({ data, rdaProfile, rdaSelection, onRdaSelectionChange, onOpenDVProfile }: Props) {
  const [tab, setTab] = useState<Tab>(() => {
    if (typeof window === 'undefined') return 'meals'
    const saved = localStorage.getItem(TAB_KEY)
    return saved === 'data' || saved === 'meals' || saved === 'calendar' || saved === 'diet' ? saved : 'meals'
  })

  function handleTabChange(next: Tab) {
    setTab(next)
    localStorage.setItem(TAB_KEY, next)
  }

  return (
    <div>
      {/* Top-level tab bar */}
      <div className="flex gap-0 mb-5 border-b border-slate-700">
        <TabButton
          label="Day Planner"
          active={tab === 'meals'}
          onClick={() => handleTabChange('meals')}
        />
        <TabButton
          label="Data View"
          active={tab === 'data'}
          onClick={() => handleTabChange('data')}
        />
        <TabButton
          label="Calendar"
          active={tab === 'calendar'}
          onClick={() => handleTabChange('calendar')}
        />
        <TabButton
          label="Diet"
          active={tab === 'diet'}
          onClick={() => handleTabChange('diet')}
        />
      </div>

      {tab === 'meals' && (
        <MealPlanner
          data={data}
          rdaProfile={rdaProfile}
          rdaSelection={rdaSelection}
          onRdaSelectionChange={onRdaSelectionChange}
          onOpenDVProfile={onOpenDVProfile}
        />
      )}
      {tab === 'data' && <DataView data={data} rdaProfile={rdaProfile} />}
      {tab === 'calendar' && <CalendarView data={data} rdaProfile={rdaProfile} />}
      {tab === 'diet' && <DietView data={data} rdaProfile={rdaProfile} />}
    </div>
  )
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
        active
          ? 'border-violet-500 text-violet-300'
          : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
      }`}
    >
      {label}
    </button>
  )
}
