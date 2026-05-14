'use client'

import type { HeatmapData } from '@/types/nutrition'
import type { RDAProfile } from '@/lib/rdaProfiles'
import DataView from './DataView'
import MealPlanner from './MealPlanner'
import CalendarView from './CalendarView'
import DietView from './DietView'

type Tab = 'data' | 'meals' | 'calendar' | 'diet'

interface Props {
  data: HeatmapData
  rdaProfile: RDAProfile | null
  rdaSelection: string
  onRdaSelectionChange: (sel: string) => void
  onOpenDVProfile: () => void
  tab: Tab
  onTabChange: (tab: Tab) => void
}

export default function MainView({ data, rdaProfile, rdaSelection, onRdaSelectionChange, onOpenDVProfile, tab, onTabChange }: Props) {

  return (
    <div>
      {/* Top-level tab bar */}
      <div className="flex gap-0 mb-5 border-b border-slate-700">
        <TabButton
          label="Day Planner"
          active={tab === 'meals'}
          onClick={() => onTabChange('meals')}
          tourId="day-planner-tab"
        />
        <TabButton
          label="Data View"
          active={tab === 'data'}
          onClick={() => onTabChange('data')}
        />
        <TabButton
          label="Calendar"
          active={tab === 'calendar'}
          onClick={() => onTabChange('calendar')}
        />
        <TabButton
          label="Diet"
          active={tab === 'diet'}
          onClick={() => onTabChange('diet')}
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
  tourId,
}: {
  label: string
  active: boolean
  onClick: () => void
  tourId?: string
}) {
  return (
    <button
      onClick={onClick}
      data-tour={tourId}
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
