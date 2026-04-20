'use client'

import { useState, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { HeatmapData } from '@/types/nutrition'
import { PORTION_SIZES } from '@/lib/portionSizes'
import { FOOD_CATEGORY_LIST } from '@/lib/filterConstants'
import { CATEGORY_COLORS, CATEGORY_COLOR_DEFAULT as DEFAULT_COLOR } from '@/lib/categoryColors'

interface Props {
  data: HeatmapData
}

const TOP_N_OPTIONS = [50, 100] as const
type TopN = (typeof TOP_N_OPTIONS)[number]
type RankDir = 'top' | 'bottom'

interface TooltipPayload {
  value: number
  payload: {
    food_name: string
    category: string
    rawValue: number
    unit: string
    portionLabel: string
    portionGrams: number
  }
}

function CustomTooltip({
  active,
  payload,
  perServing,
}: {
  active?: boolean
  payload?: TooltipPayload[]
  perServing: boolean
}) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-slate-100 mb-1">{d.food_name}</p>
      <p className="text-slate-400">{d.category}</p>
      <p className="text-violet-300 mt-1">
        {d.rawValue != null ? d.rawValue.toFixed(2) : '—'} {d.unit}
        {perServing && (
          <span className="text-slate-400 ml-1">/ {d.portionLabel} ({d.portionGrams}g)</span>
        )}
        {!perServing && (
          <span className="text-slate-400 ml-1">/ 100g</span>
        )}
      </p>
    </div>
  )
}

export default function NutrientRankingView({ data }: Props) {
  const [selectedNutrientId, setSelectedNutrientId] = useState<number>(
    data.nutrients[0]?.nutrient_id ?? 0
  )
  const [topN, setTopN] = useState<TopN>(50)
  const [rankDir, setRankDir] = useState<RankDir>('top')
  const [categoryFilter, setCategoryFilter] = useState<string>('All')
  const [perServing, setPerServing] = useState(false)

  const selectedNutrient = useMemo(
    () => data.nutrients.find((n) => n.nutrient_id === selectedNutrientId),
    [data.nutrients, selectedNutrientId]
  )

  const chartData = useMemo(() => {
    const rows = data.foods
      .filter(
        (f) => categoryFilter === 'All' || f.category === categoryFilter
      )
      .map((f) => {
        const raw = f.nutrients[selectedNutrientId] ?? null
        const portion = PORTION_SIZES[f.food_id] ?? { grams: 100, label: '1 serving' }
        const value =
          raw == null
            ? null
            : perServing
            ? (raw * portion.grams) / 100
            : raw
        return {
          food_name: f.food_name,
          category: f.category,
          value: value ?? 0,
          rawValue: value,
          unit: selectedNutrient?.unit ?? '',
          portionLabel: portion.label,
          portionGrams: portion.grams,
          hasData: raw != null,
        }
      })
      .filter((d) => d.hasData)
      .sort((a, b) => b.value - a.value) // always sort descending first

    const limit = topN
    if (rankDir === 'bottom') {
      // Take the last `limit` entries (lowest values) and reverse so lowest is at top
      return rows.slice(-limit).reverse()
    }
    return rows.slice(0, limit)
  }, [data.foods, selectedNutrientId, topN, rankDir, categoryFilter, perServing, selectedNutrient])


  // Group nutrients by category for the dropdown
  const nutrientGroups = useMemo(() => {
    const groups: Record<string, typeof data.nutrients> = {}
    for (const n of data.nutrients) {
      if (!groups[n.nutrient_category]) groups[n.nutrient_category] = []
      groups[n.nutrient_category].push(n)
    }
    return groups
  }, [data.nutrients])

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {/* Nutrient picker */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 whitespace-nowrap">Nutrient</label>
          <select
            value={selectedNutrientId}
            onChange={(e) => setSelectedNutrientId(Number(e.target.value))}
            className="bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
          >
            {Object.entries(nutrientGroups).map(([cat, nutrients]) => (
              <optgroup key={cat} label={cat}>
                {nutrients.map((n) => (
                  <option key={n.nutrient_id} value={n.nutrient_id}>
                    {n.nutrient_name} ({n.unit})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Top / Bottom toggle */}
        <div className="flex items-center rounded border border-slate-600 overflow-hidden">
          <button
            onClick={() => setRankDir('top')}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              rankDir === 'top'
                ? 'bg-violet-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Top
          </button>
          <button
            onClick={() => setRankDir('bottom')}
            className={`px-3 py-1.5 text-xs font-medium transition-colors border-l border-slate-600 ${
              rankDir === 'bottom'
                ? 'bg-violet-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Bottom
          </button>
        </div>

        {/* N filter */}
        <div className="flex items-center gap-1">
          {TOP_N_OPTIONS.map((n) => (
            <button
              key={n}
              onClick={() => setTopN(n)}
              className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                topN === n
                  ? 'bg-violet-600 border-violet-500 text-white'
                  : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-400 hover:text-slate-200'
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 whitespace-nowrap">Category</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
          >
            <option value="All">All categories</option>
            {FOOD_CATEGORY_LIST.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Per-serving toggle */}
        <button
          onClick={() => setPerServing((v) => !v)}
          className={`px-3 py-1.5 text-xs rounded border transition-colors ${
            perServing
              ? 'bg-violet-600 border-violet-500 text-white'
              : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-400 hover:text-slate-200'
          }`}
        >
          {perServing ? 'Per serving' : 'Per 100g'}
        </button>
      </div>

      {/* Chart title */}
      <p className="text-sm text-slate-400 mb-3">
        <span className="text-slate-200 font-medium">{selectedNutrient?.nutrient_name}</span>
        {' — '}
        <span className={rankDir === 'bottom' ? 'text-amber-400' : 'text-violet-400'}>
          {rankDir === 'top' ? 'highest' : 'lowest'}
        </span>
        {' '}
        {chartData.length} food{chartData.length !== 1 ? 's' : ''}
        {categoryFilter !== 'All' ? ` in ${categoryFilter}` : ''}
        {' · '}
        {perServing ? 'per serving' : 'per 100g'}
      </p>

      {chartData.length === 0 ? (
        <div className="flex items-center justify-center py-24">
          <p className="text-slate-500 text-sm">No data for selected filters.</p>
        </div>
      ) : (
        <div style={{ width: '100%', height: 380 }}>
          <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 8, right: 16, left: 8, bottom: 120 }}
              >
                <XAxis
                  type="category"
                  dataKey="food_name"
                  tick={{ fill: '#cbd5e1', fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  interval={0}
                  angle={-55}
                  textAnchor="end"
                />
                <YAxis
                  type="number"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) =>
                    v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
                  }
                  width={52}
                />
                <Tooltip
                  content={<CustomTooltip perServing={perServing} />}
                  cursor={{ fill: 'rgba(148,163,184,0.07)' }}
                />
                {/* radius=[0,0,3,3] rounds the top corners of each vertical bar */}
                <Bar dataKey="value" radius={[3, 3, 0, 0]} maxBarSize={32}>
                  {chartData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={CATEGORY_COLORS[entry.category] ?? DEFAULT_COLOR}
                    />
                  ))}
                </Bar>
              </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Category legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4 pt-3 border-t border-slate-700/50">
        {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
          <div key={cat} className="flex items-center gap-1.5">
            <span
              className="inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-slate-400">{cat}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
