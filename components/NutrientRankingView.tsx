'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { AppData } from '@/types/nutrition'
import { PORTION_SIZES } from '@/lib/portionSizes'
import { FOOD_CATEGORY_LIST } from '@/lib/filterConstants'
import { CATEGORY_COLORS, CATEGORY_COLOR_DEFAULT as DEFAULT_COLOR } from '@/lib/categoryColors'

interface Props {
  data: AppData
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

function parseSavedCats(saved: string | null): Set<string> | null {
  if (!saved) return null
  try {
    const arr = JSON.parse(saved)
    if (Array.isArray(arr) && arr.every(x => typeof x === 'string')) return new Set(arr)
  } catch {}
  return null
}

export default function NutrientRankingView({ data }: Props) {
  const [selectedNutrientId, setSelectedNutrientId] = useState<number>(() => {
    if (typeof window === 'undefined') return data.nutrients[0]?.nutrient_id ?? 0
    const v = localStorage.getItem('np:ranking:nutrientId')
    if (v !== null) {
      const id = parseInt(v, 10)
      if (data.nutrients.some((n) => n.nutrient_id === id)) return id
    }
    return data.nutrients[0]?.nutrient_id ?? 0
  })
  const [topN, setTopN] = useState<TopN>(() => {
    if (typeof window === 'undefined') return 50
    return localStorage.getItem('np:ranking:topN') === '100' ? 100 : 50
  })
  const [rankDir, setRankDir] = useState<RankDir>(() => {
    if (typeof window === 'undefined') return 'top'
    return localStorage.getItem('np:ranking:rankDir') === 'bottom' ? 'bottom' : 'top'
  })
  const [selectedCats, setSelectedCats] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set(FOOD_CATEGORY_LIST)
    return parseSavedCats(localStorage.getItem('np:ranking:catFilter')) ?? new Set(FOOD_CATEGORY_LIST)
  })
  const [perServing, setPerServing] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('np:ranking:perServing') === 'true'
  })
  const [catOpen, setCatOpen] = useState(false)
  const catRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    if (!catOpen) return
    function handleClick(e: MouseEvent) {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [catOpen])

  // Persist selections across tab switches
  useEffect(() => { localStorage.setItem('np:ranking:nutrientId', String(selectedNutrientId)) }, [selectedNutrientId])
  useEffect(() => { localStorage.setItem('np:ranking:topN', String(topN)) }, [topN])
  useEffect(() => { localStorage.setItem('np:ranking:rankDir', rankDir) }, [rankDir])
  useEffect(() => { localStorage.setItem('np:ranking:catFilter', JSON.stringify([...selectedCats])) }, [selectedCats])
  useEffect(() => { localStorage.setItem('np:ranking:perServing', String(perServing)) }, [perServing])

  const selectedNutrient = useMemo(
    () => data.nutrients.find((n) => n.nutrient_id === selectedNutrientId),
    [data.nutrients, selectedNutrientId]
  )

  const allCatsSelected = selectedCats.size === FOOD_CATEGORY_LIST.length

  const chartData = useMemo(() => {
    const rows = data.foods
      .filter((f) => selectedCats.has(f.category))
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
      .sort((a, b) => b.value - a.value)

    const limit = topN
    if (rankDir === 'bottom') {
      return rows.slice(-limit).reverse()
    }
    return rows.slice(0, limit)
  }, [data.foods, selectedNutrientId, topN, rankDir, selectedCats, perServing, selectedNutrient])

  // Group nutrients by category for the dropdown
  const nutrientGroups = useMemo(() => {
    const groups: Record<string, typeof data.nutrients> = {}
    for (const n of data.nutrients) {
      if (!groups[n.nutrient_category]) groups[n.nutrient_category] = []
      groups[n.nutrient_category].push(n)
    }
    return groups
  }, [data.nutrients])

  function toggleCat(cat: string) {
    setSelectedCats(prev => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

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

        {/* Category checklist dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 whitespace-nowrap">Categories</label>
          <div className="relative" ref={catRef}>
            <button
              onClick={() => setCatOpen(v => !v)}
              className={`flex items-center gap-1.5 bg-slate-800 border rounded px-2 py-1.5 text-sm text-slate-200 focus:outline-none transition-colors ${
                catOpen ? 'border-violet-500' : 'border-slate-600 hover:border-slate-400'
              }`}
            >
              <span>
                {allCatsSelected
                  ? 'All categories'
                  : selectedCats.size === 0
                  ? 'No categories'
                  : `${selectedCats.size} of ${FOOD_CATEGORY_LIST.length}`}
              </span>
              <span className="text-slate-500 text-[10px]">{catOpen ? '▲' : '▼'}</span>
            </button>

            {catOpen && (
              <div className="absolute z-20 top-full mt-1 left-0 bg-slate-800 border border-slate-600 rounded-lg shadow-xl py-1.5 min-w-[200px] max-h-72 overflow-y-auto">
                <div className="flex gap-2 px-3 pb-1.5 mb-1 border-b border-slate-700">
                  <button
                    onClick={() => setSelectedCats(new Set(FOOD_CATEGORY_LIST))}
                    className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    Select all
                  </button>
                  <span className="text-slate-700">·</span>
                  <button
                    onClick={() => setSelectedCats(new Set())}
                    className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    Deselect all
                  </button>
                </div>
                {FOOD_CATEGORY_LIST.map(cat => (
                  <label
                    key={cat}
                    className="flex items-center gap-2.5 px-3 py-1 hover:bg-slate-700/50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCats.has(cat)}
                      onChange={() => toggleCat(cat)}
                      className="accent-violet-500 w-3 h-3 flex-shrink-0"
                    />
                    <span className="text-xs text-slate-300">{cat}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
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
        {!allCatsSelected && selectedCats.size > 0 ? ` across ${selectedCats.size} categories` : ''}
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
                {/* radius=[3,3,0,0] rounds the top corners of each vertical bar */}
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
