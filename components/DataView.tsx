'use client'

import { useState } from 'react'
import type { HeatmapData } from '@/types/nutrition'
import HeatmapTable from './HeatmapTable'
import NutrientRankingView from './NutrientRankingView'
import NutrientScatterPlot from './NutrientScatterPlot'

interface Props {
  data: HeatmapData
}

type DataTab = 'heatmap' | 'charts'

const DATA_TAB_KEY = 'np:dataTab'

export default function DataView({ data }: Props) {
  const [tab, setTab] = useState<DataTab>(() => {
    if (typeof window === 'undefined') return 'heatmap'
    const saved = localStorage.getItem(DATA_TAB_KEY)
    return saved === 'heatmap' || saved === 'charts' ? saved : 'heatmap'
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
          onClick={() => handleTabChange('heatmap')}
          className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
            tab === 'heatmap'
              ? 'border-violet-500 text-violet-300'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
          }`}
        >
          Nutrient Heatmap
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
      </div>

      {tab === 'heatmap' && <HeatmapTable data={data} />}
      {tab === 'charts' && (
        <div className="px-1">
          <NutrientRankingView data={data} />
          <NutrientScatterPlot data={data} />
        </div>
      )}
    </div>
  )
}
