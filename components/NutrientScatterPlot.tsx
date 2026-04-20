'use client'

import { useState, useMemo } from 'react'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import type { HeatmapData } from '@/types/nutrition'
import { PORTION_SIZES } from '@/lib/portionSizes'
import { FOOD_CATEGORY_LIST } from '@/lib/filterConstants'
import { CATEGORY_COLORS, CATEGORY_COLOR_DEFAULT } from '@/lib/categoryColors'

interface Props {
  data: HeatmapData
}

interface DotData {
  food_name: string
  category: string
  x: number
  y: number
  z: number
  xUnit: string
  yUnit: string
  zUnit: string
  xLabel: string
  yLabel: string
  zLabel: string | null
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: DotData }[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-xs shadow-lg max-w-[220px]">
      <p className="font-semibold text-slate-100 mb-0.5">{d.food_name}</p>
      <p className="text-slate-500 mb-2">{d.category}</p>
      <p className="text-violet-300">
        {d.xLabel}:{' '}
        <span className="font-medium text-slate-200">{d.x.toFixed(2)} {d.xUnit}</span>
      </p>
      <p className="text-emerald-300">
        {d.yLabel}:{' '}
        <span className="font-medium text-slate-200">{d.y.toFixed(2)} {d.yUnit}</span>
      </p>
      {d.zLabel && (
        <p className="text-amber-300">
          {d.zLabel}:{' '}
          <span className="font-medium text-slate-200">{d.z.toFixed(2)} {d.zUnit}</span>
        </p>
      )}
    </div>
  )
}

export default function NutrientScatterPlot({ data }: Props) {
  const defaultX = useMemo(
    () => data.nutrients.find((n) => n.nutrient_name === 'Protein')?.nutrient_id ?? data.nutrients[0]?.nutrient_id ?? 0,
    [data.nutrients]
  )
  const defaultY = useMemo(
    () => data.nutrients.find((n) => n.nutrient_name === 'Iron')?.nutrient_id ?? data.nutrients[1]?.nutrient_id ?? 0,
    [data.nutrients]
  )

  const [xId, setXId] = useState<number>(defaultX)
  const [yId, setYId] = useState<number>(defaultY)
  const [zId, setZId] = useState<number | null>(null)
  const [highlightCat, setHighlightCat] = useState<string>('All')
  const [perServing, setPerServing] = useState(false)
  const [maxX, setMaxX] = useState<string>('')
  const [maxY, setMaxY] = useState<string>('')

  const xNutrient = useMemo(() => data.nutrients.find((n) => n.nutrient_id === xId), [data.nutrients, xId])
  const yNutrient = useMemo(() => data.nutrients.find((n) => n.nutrient_id === yId), [data.nutrients, yId])
  const zNutrient = useMemo(() => (zId ? data.nutrients.find((n) => n.nutrient_id === zId) : null), [data.nutrients, zId])

  const nutrientGroups = useMemo(() => {
    const groups: Record<string, typeof data.nutrients> = {}
    for (const n of data.nutrients) {
      if (!groups[n.nutrient_category]) groups[n.nutrient_category] = []
      groups[n.nutrient_category].push(n)
    }
    return groups
  }, [data.nutrients])

  const allDots = useMemo<DotData[]>(() => {
    return data.foods
      .map((f) => {
        const portion = PORTION_SIZES[f.food_id] ?? { grams: 100, label: '1 serving' }
        const mult = perServing ? portion.grams / 100 : 1
        const rawX = f.nutrients[xId]
        const rawY = f.nutrients[yId]
        if (rawX == null || rawY == null) return null
        const rawZ = zId != null ? f.nutrients[zId] : null
        return {
          food_name: f.food_name,
          category: f.category,
          x: rawX * mult,
          y: rawY * mult,
          z: rawZ != null ? rawZ * mult : 1,
          xUnit: xNutrient?.unit ?? '',
          yUnit: yNutrient?.unit ?? '',
          zUnit: zNutrient?.unit ?? '',
          xLabel: xNutrient?.nutrient_name ?? '',
          yLabel: yNutrient?.nutrient_name ?? '',
          zLabel: zNutrient?.nutrient_name ?? null,
        } satisfies DotData
      })
      .filter(Boolean) as DotData[]
  }, [data.foods, xId, yId, zId, perServing, xNutrient, yNutrient, zNutrient])

  const dotsByCategory = useMemo(() => {
    const byCat: Record<string, DotData[]> = {}
    for (const d of allDots) {
      if (!byCat[d.category]) byCat[d.category] = []
      byCat[d.category].push(d)
    }
    return byCat
  }, [allDots])

  const hasHighlight = highlightCat !== 'All'

  const tickFmt = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v))

  function handleXChange(id: number) { setXId(id); setMaxX('') }
  function handleYChange(id: number) { setYId(id); setMaxY('') }

  const NutrientSelect = ({ label, value, onChange }: { label: string; value: number; onChange: (id: number) => void }) => (
    <div className="flex items-center gap-2">
      <label className="text-xs text-slate-400 whitespace-nowrap">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
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
  )

  return (
    <div className="w-full mt-10 pt-8 border-t border-slate-700/60">
      <h3 className="text-sm font-semibold text-slate-200 mb-1">Nutrient Scatter Plot</h3>
      <p className="text-xs text-slate-500 mb-4">
        Compare any two nutrients across all foods. Add a third as bubble size to surface multi-dimensional winners.
      </p>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <NutrientSelect label="X axis" value={xId} onChange={handleXChange} />
        <NutrientSelect label="Y axis" value={yId} onChange={handleYChange} />

        {/* Bubble size */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 whitespace-nowrap">Bubble size</label>
          <select
            value={zId ?? ''}
            onChange={(e) => setZId(e.target.value ? Number(e.target.value) : null)}
            className="bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
          >
            <option value="">Equal size</option>
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

        {/* Category highlight */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 whitespace-nowrap">Highlight</label>
          <select
            value={highlightCat}
            onChange={(e) => setHighlightCat(e.target.value)}
            className="bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
          >
            <option value="All">All categories</option>
            {FOOD_CATEGORY_LIST.map((c) => (
              <option key={c} value={c}>{c}</option>
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

        {/* Max axis caps */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 whitespace-nowrap">Max X</label>
          <input
            type="number"
            min={0}
            placeholder="auto"
            value={maxX}
            onChange={(e) => setMaxX(e.target.value)}
            className="w-20 bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 whitespace-nowrap">Max Y</label>
          <input
            type="number"
            min={0}
            placeholder="auto"
            value={maxY}
            onChange={(e) => setMaxY(e.target.value)}
            className="w-20 bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500"
          />
        </div>
      </div>

      {/* Subtitle */}
      <p className="text-sm text-slate-400 mb-3">
        <span className="text-violet-400 font-medium">{xNutrient?.nutrient_name}</span>
        {' (X) vs '}
        <span className="text-emerald-400 font-medium">{yNutrient?.nutrient_name}</span>
        {' (Y)'}
        {zNutrient && (
          <> · size: <span className="text-amber-400 font-medium">{zNutrient.nutrient_name}</span></>
        )}
        {' · '}
        {allDots.length} foods
        {' · '}
        {perServing ? 'per serving' : 'per 100g'}
      </p>

      {/* Chart */}
      <div style={{ width: '100%', height: 500 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 24, bottom: 48, left: 16 }}>
            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="x"
              name={xNutrient?.nutrient_name}
              domain={[0, maxX ? Number(maxX) : 'auto']}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              tickFormatter={tickFmt}
              label={{
                value: `${xNutrient?.nutrient_name ?? ''} (${xNutrient?.unit ?? ''})`,
                position: 'insideBottom',
                offset: -28,
                fill: '#64748b',
                fontSize: 11,
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name={yNutrient?.nutrient_name}
              domain={[0, maxY ? Number(maxY) : 'auto']}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={56}
              tickFormatter={tickFmt}
              label={{
                value: `${yNutrient?.nutrient_name ?? ''} (${yNutrient?.unit ?? ''})`,
                angle: -90,
                position: 'insideLeft',
                offset: 12,
                fill: '#64748b',
                fontSize: 11,
              }}
            />
            <ZAxis
              type="number"
              dataKey="z"
              range={zId ? [30, 500] : [55, 55]}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#475569' }} isAnimationActive={false} />
            {FOOD_CATEGORY_LIST.map((cat) => {
              const catDots = dotsByCategory[cat]
              if (!catDots?.length) return null
              const color = CATEGORY_COLORS[cat] ?? CATEGORY_COLOR_DEFAULT
              const dimmed = hasHighlight && highlightCat !== cat
              return (
                <Scatter
                  key={cat}
                  name={cat}
                  data={catDots}
                  fill={color}
                  fillOpacity={dimmed ? 0.12 : 0.82}
                  stroke={dimmed ? 'none' : color}
                  strokeWidth={dimmed ? 0 : 0.5}
                  strokeOpacity={0.4}
                  isAnimationActive={false}
                />
              )
            })}
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Category legend — clickable to highlight */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4 pt-3 border-t border-slate-700/50">
        {Object.entries(CATEGORY_COLORS).map(([cat, color]) => {
          const dimmed = hasHighlight && highlightCat !== cat
          return (
            <button
              key={cat}
              onClick={() => setHighlightCat((h) => (h === cat ? 'All' : cat))}
              className="flex items-center gap-1.5 transition-opacity hover:opacity-90"
            >
              <span
                className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 transition-opacity"
                style={{ backgroundColor: color, opacity: dimmed ? 0.25 : 1 }}
              />
              <span className={`text-xs transition-colors ${dimmed ? 'text-slate-600' : 'text-slate-400'}`}>
                {cat}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
