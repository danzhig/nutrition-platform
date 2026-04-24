'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { NutrientMeta, FoodRow } from '@/types/nutrition'
import type { Meal } from '@/types/meals'
import { getJuiceFactor } from '@/lib/juiceFactors'

interface Props {
  nutrients: NutrientMeta[]
  meals: Meal[]
  foodsById: Map<number, FoodRow>
}

// Caloric conversion per gram (4 kcal/g for all carb fractions matches USDA labeling
// convention, keeping the macro sum consistent with the stored Calories column).
const KCAL_PER_G = {
  'Net Carbohydrates': 4,
  'Dietary Fibre':     4,
  'Protein':           4,
  'Total Fat':         9,
} as const
type MacroName = keyof typeof KCAL_PER_G

const MACRO_BASE: Record<MacroName, string> = {
  'Net Carbohydrates': '#f59e0b',  // amber
  'Dietary Fibre':     '#84cc16',  // lime
  'Protein':           '#8b5cf6',  // violet
  'Total Fat':         '#10b981',  // emerald
}

// 6 shades per macro (top 5 foods + Other)
const MACRO_SHADES: Record<MacroName, string[]> = {
  'Net Carbohydrates': ['#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f', '#3b1a00'],
  'Dietary Fibre':     ['#84cc16', '#65a30d', '#4d7c0f', '#3f6212', '#365314', '#1a2e05'],
  'Protein':           ['#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95', '#270f5c'],
  'Total Fat':         ['#10b981', '#059669', '#047857', '#065f46', '#064e3b', '#01201a'],
}

const MACROS: MacroName[] = ['Net Carbohydrates', 'Dietary Fibre', 'Protein', 'Total Fat']

const DISPLAY_LABEL: Record<MacroName, string> = {
  'Net Carbohydrates': 'Net Carbs',
  'Dietary Fibre':     'Fibre',
  'Protein':           'Protein',
  'Total Fat':         'Fat',
}

type InnerSlice = { name: MacroName; value: number; color: string }
type OuterSlice = { name: string; macroName: MacroName; value: number; color: string }

const RADIAN = Math.PI / 180

function MacroLabel({ cx, cy, midAngle, outerRadius, name, value, totalKcal }: any) {
  if (!value || value / totalKcal < 0.04) return null  // hide label on tiny slices
  const r = outerRadius * (70 / 48) + 16
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  const color = MACRO_BASE[name as MacroName] ?? '#94a3b8'
  return (
    <text
      x={x} y={y}
      fill={color}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight={700}
    >
      {DISPLAY_LABEL[name as MacroName] ?? name}
    </text>
  )
}

function DonutTooltip({ active, payload, totalKcal }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload as InnerSlice | OuterSlice
  const pct = totalKcal > 0 ? (d.value / totalKcal) * 100 : 0
  const isMacroSlice = !('macroName' in d)
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-xs shadow-xl max-w-[200px]">
      <p className="text-slate-100 font-semibold leading-tight">
        {isMacroSlice ? DISPLAY_LABEL[d.name as MacroName] ?? d.name : d.name}
      </p>
      {'macroName' in d && (
        <p className="text-slate-500 text-[10px] mt-0.5">
          {DISPLAY_LABEL[(d as OuterSlice).macroName]}
        </p>
      )}
      <p className="mt-1.5">
        <span
          className="font-semibold text-sm"
          style={{ color: isMacroSlice ? (d as InnerSlice).color : MACRO_BASE[(d as OuterSlice).macroName] }}
        >
          {pct < 1 ? '<1' : Math.round(pct)}%
        </span>
        <span className="text-slate-400 ml-1">of calories</span>
      </p>
      <p className="text-slate-400">{Math.round(d.value)} kcal</p>
    </div>
  )
}

export default function MacroDonutChart({ nutrients, meals, foodsById }: Props) {
  const data = useMemo(() => {
    const netCarbsId = nutrients.find((n) => n.nutrient_name === 'Net Carbohydrates')?.nutrient_id
    const fibreId    = nutrients.find((n) => n.nutrient_name === 'Dietary Fibre')?.nutrient_id
    const proteinId  = nutrients.find((n) => n.nutrient_name === 'Protein')?.nutrient_id
    const fatId      = nutrients.find((n) => n.nutrient_name === 'Total Fat')?.nutrient_id

    if (!netCarbsId || !fibreId || !proteinId || !fatId) return null

    // Accumulate per-food gram totals across all meals
    const contribs = new Map<number, {
      name: string
      netCarbs_g: number
      fibre_g:    number
      protein_g:  number
      fat_g:      number
    }>()

    for (const meal of meals) {
      const isJuice = meal.isJuice ?? false
      const carbFactor   = isJuice ? getJuiceFactor('Net Carbohydrates', 'Macronutrient') : 1
      const fibreFactor  = isJuice ? getJuiceFactor('Dietary Fibre',     'Macronutrient') : 1
      const protFactor   = isJuice ? getJuiceFactor('Protein',           'Macronutrient') : 1
      const fatFactor    = isJuice ? getJuiceFactor('Total Fat',         'Macronutrient') : 1
      for (const item of meal.items) {
        const food = foodsById.get(item.food_id)
        if (!food) continue
        const mult = item.grams / 100
        const prev = contribs.get(item.food_id) ?? {
          name: item.food_name || food.food_name,
          netCarbs_g: 0, fibre_g: 0, protein_g: 0, fat_g: 0,
        }
        prev.netCarbs_g += ((food.nutrients[netCarbsId] as number) ?? 0) * mult * carbFactor
        prev.fibre_g    += ((food.nutrients[fibreId]    as number) ?? 0) * mult * fibreFactor
        prev.protein_g  += ((food.nutrients[proteinId]  as number) ?? 0) * mult * protFactor
        prev.fat_g      += ((food.nutrients[fatId]      as number) ?? 0) * mult * fatFactor
        contribs.set(item.food_id, prev)
      }
    }

    // Convert grams → kcal per food
    type FoodKcal = Record<MacroName, number> & { name: string }
    const foodList: FoodKcal[] = Array.from(contribs.values()).map((f) => ({
      name: f.name,
      'Net Carbohydrates': f.netCarbs_g * KCAL_PER_G['Net Carbohydrates'],
      'Dietary Fibre':     f.fibre_g    * KCAL_PER_G['Dietary Fibre'],
      'Protein':           f.protein_g  * KCAL_PER_G['Protein'],
      'Total Fat':         f.fat_g      * KCAL_PER_G['Total Fat'],
    }))

    const totals = MACROS.reduce((acc, m) => {
      acc[m] = foodList.reduce((s, f) => s + f[m], 0)
      return acc
    }, {} as Record<MacroName, number>)

    const totalKcal = MACROS.reduce((s, m) => s + totals[m], 0)
    if (totalKcal === 0) return null

    // Inner ring — 4 macro slices
    const innerData: InnerSlice[] = MACROS.map((m) => ({
      name:  m,
      value: totals[m],
      color: MACRO_BASE[m],
    }))

    // Outer ring — top 5 foods + Other per macro, ordered to match inner
    const outerData: OuterSlice[] = []
    for (const macro of MACROS) {
      const sorted = [...foodList].sort((a, b) => b[macro] - a[macro])
      const top5 = sorted.slice(0, 5).filter((f) => f[macro] > 0)
      const otherVal = sorted.slice(5).reduce((s, f) => s + f[macro], 0)
      top5.forEach((f, i) => {
        outerData.push({ name: f.name, macroName: macro, value: f[macro], color: MACRO_SHADES[macro][i] })
      })
      if (otherVal > 0) {
        outerData.push({ name: 'Other', macroName: macro, value: otherVal, color: MACRO_SHADES[macro][5] })
      }
    }

    return {
      innerData, outerData, totalKcal,
      pct:  Object.fromEntries(MACROS.map((m) => [m, (totals[m] / totalKcal) * 100])) as Record<MacroName, number>,
      kcal: Object.fromEntries(MACROS.map((m) => [m, Math.round(totals[m])])) as Record<MacroName, number>,
    }
  }, [nutrients, meals, foodsById])

  const empty = (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex flex-col h-full">
      <p className="text-xs font-semibold text-slate-300 mb-1">Macro Split</p>
      <p className="text-[10px] text-slate-500 mb-3">Caloric breakdown by macro and food source</p>
      <div className="flex-1 flex items-center justify-center">
        <p className="text-slate-600 text-xs">No data</p>
      </div>
    </div>
  )

  if (!data) return empty

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex flex-col h-full">
      <p className="text-xs font-semibold text-slate-300 mb-1">Macro Split</p>
      <p className="text-[10px] text-slate-500 mb-2">
        Inner: macro calorie share · Outer: top 5 foods per macro
      </p>

      {/* Legend — 2×2 grid to fit 4 macros */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-3">
        {MACROS.map((m) => (
          <div key={m} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: MACRO_BASE[m] }} />
            <span className="text-[10px] text-slate-400">
              {DISPLAY_LABEL[m]}{' '}
              <span className="font-semibold" style={{ color: MACRO_BASE[m] }}>
                {Math.round(data.pct[m])}%
              </span>
              <span className="text-slate-600 ml-1">{data.kcal[m]} kcal</span>
            </span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="flex-1 relative min-h-0">
        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="text-center">
            <p className="text-base font-bold text-slate-100 leading-tight">
              {Math.round(data.totalKcal)}
            </p>
            <p className="text-[9px] text-slate-500 leading-tight">kcal total</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 28, right: 40, bottom: 28, left: 40 }}>
            <Pie
              data={data.innerData}
              dataKey="value"
              innerRadius="30%"
              outerRadius="48%"
              startAngle={90}
              endAngle={-270}
              strokeWidth={0}
              isAnimationActive={false}
              label={(props) => <MacroLabel {...props} totalKcal={data.totalKcal} />}
              labelLine={false}
            >
              {data.innerData.map((entry, i) => (
                <Cell key={i} fill={entry.color} fillOpacity={0.9} />
              ))}
            </Pie>

            <Pie
              data={data.outerData}
              dataKey="value"
              innerRadius="52%"
              outerRadius="70%"
              startAngle={90}
              endAngle={-270}
              strokeWidth={1.5}
              stroke="#0f172a"
              isAnimationActive={false}
            >
              {data.outerData.map((entry, i) => (
                <Cell key={i} fill={entry.color} fillOpacity={0.9} />
              ))}
            </Pie>

            <Tooltip content={<DonutTooltip totalKcal={data.totalKcal} />} isAnimationActive={false} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <p className="text-[9px] text-slate-600 mt-1 leading-relaxed">
        Net Carbs &amp; Fibre both at 4 kcal/g (USDA label convention).
        Fibre shown separately for low-carb planning.
      </p>
    </div>
  )
}
