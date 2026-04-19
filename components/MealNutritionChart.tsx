'use client'

import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, Cell, ResponsiveContainer, ReferenceArea,
} from 'recharts'
import type { NutrientMeta, FoodRow } from '@/types/nutrition'
import type { RDAProfile } from '@/lib/rdaProfiles'
import { NUTRIENT_BEHAVIORS, FOOD_METRIC_TARGETS } from '@/lib/rdaProfiles'
import { rdaCellColor } from '@/lib/rdaColorScale'
import type { Meal } from '@/types/meals'

interface Props {
  nutrients: NutrientMeta[]
  meals: Meal[]
  foodsById: Map<number, FoodRow>
  rdaProfile: RDAProfile | null
}

const CATEGORY_ORDER = ['Macronutrient', 'Vitamin', 'Mineral', 'Fatty Acid', 'Amino Acid', 'Food Metric']

const CATEGORY_BG: Record<string, string> = {
  'Macronutrient': 'rgba(148,163,184,0.06)',
  'Vitamin':       'rgba(167,139,250,0.06)',
  'Mineral':       'rgba(34,211,238,0.06)',
  'Fatty Acid':    'rgba(251,191,36,0.06)',
  'Amino Acid':    'rgba(74,222,128,0.06)',
  'Food Metric':   'rgba(100,116,139,0.06)',
}

const CATEGORY_LABEL_COLOR: Record<string, string> = {
  'Macronutrient': '#94a3b8',
  'Vitamin':       '#a78bfa',
  'Mineral':       '#22d3ee',
  'Fatty Acid':    '#fbbf24',
  'Amino Acid':    '#4ade80',
  'Food Metric':   '#64748b',
}

function abbr(name: string): string {
  return name
    .replace('Vitamin ', 'Vit ')
    .replace('Pantothenic Acid', 'Panto.')
    .replace('Polyunsaturated Fat', 'PUFA')
    .replace('Monounsaturated Fat', 'MUFA')
    .replace('Antioxidant Capacity', 'Antioxidant')
    .replace('Omega-3 Fatty Acids', 'Omega-3')
    .replace('Omega-6 Fatty Acids', 'Omega-6')
    .replace('Dietary Fibre', 'Fibre')
    .replace('Glycemic Index', 'GI')
    .replace('Total Sugars', 'Sugars')
    .replace('Total Fat', 'Fat')
    .replace('Saturated Fat', 'Sat. Fat')
    .replace('Cholesterol', 'Chol.')
    .replace('Carbohydrates', 'Carbs')
}

interface ChartBar {
  key: string        // unique x-axis key
  label: string      // abbreviated name for x-axis tick
  fullName: string
  pct: number        // %DV (may exceed 100)
  rawVal: number
  unit: string
  category: string
  color: string
  isFirstInCategory: boolean
  isLastInCategory: boolean
}

// Custom tooltip content
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d: ChartBar = payload[0].payload
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-100 font-semibold mb-1">{d.fullName}</p>
      <p className="text-slate-400">{d.category}</p>
      <p className="mt-1">
        <span style={{ color: d.color }} className="font-semibold text-sm">
          {d.pct < 1 ? '<1' : Math.round(d.pct)}%
        </span>
        <span className="text-slate-400 ml-1">daily value</span>
      </p>
      <p className="text-slate-400 mt-0.5">
        {d.rawVal < 1 ? d.rawVal.toFixed(2) : d.rawVal < 100 ? d.rawVal.toFixed(1) : Math.round(d.rawVal)} {d.unit}
      </p>
    </div>
  )
}

// Custom x-axis tick — angled for readability
function CustomXTick({ x, y, payload }: any) {
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0} y={0} dy={8}
        textAnchor="end"
        transform="rotate(-45)"
        fontSize={10}
        fill="#94a3b8"
      >
        {payload.value}
      </text>
    </g>
  )
}

export default function MealNutritionChart({ nutrients, meals, foodsById, rdaProfile }: Props) {
  const [capAt100, setCapAt100] = useState(false)
  const [viewId, setViewId] = useState<'all' | string>('all')

  const activeMeals = useMemo(
    () => (viewId === 'all' ? meals : meals.filter((m) => m.id === viewId)),
    [meals, viewId]
  )

  const giNutrientId = useMemo(
    () => nutrients.find((n) => n.nutrient_name === 'Glycemic Index')?.nutrient_id ?? null,
    [nutrients]
  )
  const carbsNutrientId = useMemo(
    () => nutrients.find((n) => n.nutrient_name === 'Carbohydrates')?.nutrient_id ?? null,
    [nutrients]
  )

  // Sum totals (excluding GI)
  const totals = useMemo<Record<number, number>>(() => {
    const t: Record<number, number> = {}
    for (const meal of activeMeals) {
      for (const item of meal.items) {
        const food = foodsById.get(item.food_id)
        if (!food) continue
        const multiplier = item.grams / 100
        for (const [nIdStr, value] of Object.entries(food.nutrients)) {
          if (value === null || value === undefined) continue
          const nId = Number(nIdStr)
          if (nId === giNutrientId) continue
          t[nId] = (t[nId] ?? 0) + (value as number) * multiplier
        }
      }
    }
    return t
  }, [activeMeals, foodsById, giNutrientId])

  // Weighted GI
  const weightedGI = useMemo<number | null>(() => {
    if (giNutrientId === null || carbsNutrientId === null) return null
    let sumGIxCarbs = 0, sumCarbs = 0
    for (const meal of activeMeals) {
      for (const item of meal.items) {
        const food = foodsById.get(item.food_id)
        if (!food) continue
        const multiplier = item.grams / 100
        const gi = food.nutrients[giNutrientId]
        const carbs = food.nutrients[carbsNutrientId]
        if (gi == null || carbs == null) continue
        const carbAmount = (carbs as number) * multiplier
        if (carbAmount > 0) { sumGIxCarbs += (gi as number) * carbAmount; sumCarbs += carbAmount }
      }
    }
    return sumCarbs > 0 ? Math.round(sumGIxCarbs / sumCarbs) : null
  }, [activeMeals, foodsById, giNutrientId, carbsNutrientId])

  // Build chart data — only nutrients with a %DV target, grouped by category, sorted by pct desc
  const chartData = useMemo<ChartBar[]>(() => {
    if (!rdaProfile) return []

    const bars: ChartBar[] = []

    for (const cat of CATEGORY_ORDER) {
      const group = nutrients.filter((n) => n.nutrient_category === cat)
      if (!group.length) continue

      const withPct = group.map((n) => {
        const isGI = n.nutrient_id === giNutrientId
        const rawVal = isGI
          ? (weightedGI ?? 0)
          : (totals[n.nutrient_id] ?? 0)
        const rdaTarget = rdaProfile.values[n.nutrient_name] ?? FOOD_METRIC_TARGETS[n.nutrient_name] ?? null
        const pct = rdaTarget != null ? (rawVal / rdaTarget) * 100 : null
        return { n, rawVal, pct }
      }).filter((x) => x.pct !== null) as { n: NutrientMeta; rawVal: number; pct: number }[]

      if (!withPct.length) continue

      withPct.sort((a, b) => b.pct - a.pct)

      withPct.forEach(({ n, rawVal, pct }, i) => {
        const behavior = NUTRIENT_BEHAVIORS[n.nutrient_name] ?? 'normal'
        const color = rdaCellColor(pct, behavior, undefined)
        bars.push({
          key: `${n.nutrient_id}`,
          label: abbr(n.nutrient_name),
          fullName: n.nutrient_name,
          pct,
          rawVal,
          unit: n.unit,
          category: cat,
          color,
          isFirstInCategory: i === 0,
          isLastInCategory: i === withPct.length - 1,
        })
      })
    }

    return bars
  }, [nutrients, rdaProfile, totals, weightedGI, giNutrientId])

  // Category boundary spans for ReferenceArea shading
  const categorySpans = useMemo(() => {
    const spans: { cat: string; first: string; last: string }[] = []
    let current: typeof spans[0] | null = null
    for (const bar of chartData) {
      if (bar.isFirstInCategory) {
        if (current) spans.push(current)
        current = { cat: bar.category, first: bar.key, last: bar.key }
      } else if (current) {
        current.last = bar.key
      }
    }
    if (current) spans.push(current)
    return spans
  }, [chartData])

  const hasAnyItems = meals.some((m) => m.items.length > 0)
  const mealsWithItems = meals.filter((m) => m.items.length > 0)
  const yMax = capAt100 ? 100 : undefined

  if (!hasAnyItems) {
    return (
      <div className="w-full bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center py-20">
        <p className="text-slate-500 text-sm">Add foods to your meals to see the nutrition chart.</p>
      </div>
    )
  }

  if (!rdaProfile) {
    return (
      <div className="w-full bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center py-20">
        <p className="text-slate-500 text-sm">Select a daily value profile to see the % DV chart.</p>
      </div>
    )
  }

  return (
    <div className="w-full bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-3">
      {/* Chart toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-300">
            % Daily Value — {rdaProfile.shortLabel}
          </span>
          {/* Category legend */}
          <div className="flex items-center gap-3 flex-wrap">
            {CATEGORY_ORDER.map((cat) =>
              chartData.some((b) => b.category === cat) ? (
                <span key={cat} className="flex items-center gap-1 text-[10px]" style={{ color: CATEGORY_LABEL_COLOR[cat] }}>
                  <span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: CATEGORY_LABEL_COLOR[cat] }} />
                  {cat}
                </span>
              ) : null
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Meal selector */}
          {mealsWithItems.length > 1 && (
            <div className="flex gap-1 flex-wrap">
              <button
                onClick={() => setViewId('all')}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  viewId === 'all' ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
              >
                Full Plan
              </button>
              {mealsWithItems.map((meal) => (
                <button
                  key={meal.id}
                  onClick={() => setViewId(meal.id)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors max-w-[80px] truncate ${
                    viewId === meal.id ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                  title={meal.name}
                >
                  {meal.name}
                </button>
              ))}
            </div>
          )}

          {/* Cap toggle */}
          <button
            onClick={() => setCapAt100((v) => !v)}
            className={`px-3 py-1 text-[10px] font-medium rounded transition-colors border ${
              capAt100
                ? 'bg-violet-700 border-violet-500 text-white'
                : 'bg-slate-700 border-slate-600 text-slate-400 hover:bg-slate-600'
            }`}
            title={capAt100 ? 'Showing Y-axis capped at 100%' : 'Y-axis uncapped — showing true values above 100%'}
          >
            Cap Y at 100%
          </button>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={420}>
        <BarChart
          data={chartData}
          margin={{ top: 16, right: 16, left: 0, bottom: 80 }}
          barCategoryGap="20%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />

          {/* Category background shading */}
          {categorySpans.map(({ cat, first, last }) => (
            <ReferenceArea
              key={cat}
              x1={first}
              x2={last}
              fill={CATEGORY_BG[cat]}
              fillOpacity={1}
              stroke="none"
              label={{
                value: cat,
                position: 'insideTopLeft',
                fontSize: 9,
                fill: CATEGORY_LABEL_COLOR[cat],
                fontWeight: 600,
                dy: -12,
              }}
            />
          ))}

          <XAxis
            dataKey="key"
            tickFormatter={(key) => chartData.find((b) => b.key === key)?.label ?? key}
            tick={<CustomXTick />}
            interval={0}
            axisLine={{ stroke: '#475569' }}
            tickLine={false}
          />
          <YAxis
            domain={[0, yMax ?? 'auto']}
            tickFormatter={(v) => `${v}%`}
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            width={42}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <ReferenceLine y={100} stroke="#6d28d9" strokeDasharray="4 3" strokeWidth={1.5} label={{ value: '100% DV', fontSize: 9, fill: '#7c3aed', position: 'insideTopRight' }} />

          <Bar dataKey="pct" radius={[3, 3, 0, 0]} maxBarSize={28}>
            {chartData.map((bar) => (
              <Cell key={bar.key} fill={bar.color} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
