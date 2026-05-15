'use client'

import { useState } from 'react'
import type { AppData } from '@/types/nutrition'
import type { RDAProfile } from '@/lib/rdaProfiles'
import DataTable from './DataTable'
import NutrientRankingView from './NutrientRankingView'
import NutrientScatterPlot from './NutrientScatterPlot'
import FoodComparisonView from './FoodComparisonView'
import MealComparisonView from './MealComparisonView'

interface Props {
  data: AppData
  rdaProfile: RDAProfile | null
}

type DataTab = 'table' | 'charts' | 'comparison' | 'meal_comparison'

const DATA_TAB_KEY = 'np:dataTab'

export default function DataView({ data, rdaProfile }: Props) {
  const [tab, setTab] = useState<DataTab>(() => {
    if (typeof window === 'undefined') return 'table'
    const saved = localStorage.getItem(DATA_TAB_KEY)
    return saved === 'table' || saved === 'charts' || saved === 'comparison' || saved === 'meal_comparison' ? saved : 'table'
  })

  function handleTabChange(next: DataTab) {
    setTab(next)
    localStorage.setItem(DATA_TAB_KEY, next)
  }

  return (
    <div>
      {/* Second-level tab bar */}
      <div className="flex items-center border-b border-slate-700 mb-4">
        <button
          onClick={() => handleTabChange('table')}
          className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
            tab === 'table'
              ? 'border-violet-500 text-violet-300'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
          }`}
        >
          Data Table
        </button>
        <button
          onClick={() => handleTabChange('charts')}
          className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
            tab === 'charts'
              ? 'border-violet-500 text-violet-300'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
          }`}
        >
          Charts
        </button>
        <button
          onClick={() => handleTabChange('comparison')}
          className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
            tab === 'comparison'
              ? 'border-violet-500 text-violet-300'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
          }`}
        >
          Food Comparison
        </button>
        <button
          onClick={() => handleTabChange('meal_comparison')}
          className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
            tab === 'meal_comparison'
              ? 'border-violet-500 text-violet-300'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
          }`}
        >
          Meal Comparison
        </button>
      </div>

      {tab === 'table' && <DataTable data={data} rdaProfile={rdaProfile} />}
      {tab === 'charts' && (
        <div className="px-1">
          <NutrientRankingView data={data} />
          <NutrientScatterPlot data={data} />
        </div>
      )}
      {tab === 'comparison' && (
        <div className="px-1">
          <FoodComparisonView data={data} rdaProfile={rdaProfile} />
        </div>
      )}
      {tab === 'meal_comparison' && (
        <div className="px-1">
          <MealComparisonView data={data} rdaProfile={rdaProfile} />
        </div>
      )}
    </div>
  )
}
