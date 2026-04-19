'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { NutrientMeta, FoodRow } from '@/types/nutrition'
import type { Meal } from '@/types/meals'

interface Props {
  nutrients: NutrientMeta[]
  meals: Meal[]
  foodsById: Map<number, FoodRow>
}

// Caloric conversion per gram
const KCAL_PER_G = { Carbohydrates: 4, Protein: 4, 'Total Fat': 9 } as const
type MacroName = keyof typeof KCAL_PER_G

// Base color and 6 shades (top 5 foods + Other) per macro
const MACRO_SHADES: Record<MacroName, string[]> = {
  'Carbohydrates': ['#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f', '#3b1a00'],
  'Protein':       ['#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95', '#270f5c'],
  'Total Fat':     ['#10b981', '#059669', '#047857', '#065f46', '#064e3b', '#01201a'],
}
const MACRO_BASE: Record<MacroName, string> = {
  'Carbohydrates': '#f59e0b',
  'Protein':       '#8b5cf6',
  'Total Fat':     '#10b981',
}
const MACROS: MacroName[] = ['Carbohydrates', 'Protein', 'Total Fat']

type InnerSlice = { name: MacroName; value: number; color: string }
type OuterSlice = { name: string; macroName: MacroName; value: number; color: string }

const RADIAN = Math.PI / 180

// Rendered as SVG <text> — positions the macro name just outside the outer ring.
// outerRadius received here is the inner ring's outerRadius (48% of half-dimension).
// The outer ring goes to 70%, so we scale by (70/48) and add a small gap.
function MacroLabel({ cx, cy, midAngle, outerRadius, name }: any) {
  const r = outerRadius * (70 / 48) + 16
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  const display = name === 'Carbohydrates' ? 'Carbs' : name === 'Total Fat' ? 'Fat' : 'Protein'
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
      {display}
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
      <p className="text-slate-100 font-semibold leading-tight">{d.name}</p>
      {'macroName' in d && (
        <p className="text-slate-500 text-[10px] mt-0.5">{d.macroName}</p>
      )}
      <p className="mt-1.5">
        <span className="font-semibold text-sm" style={{ color: isMacroSlice ? (d as InnerSlice).color : MACRO_BASE[(d as OuterSlice).macroName] }}>
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
    const proteinId  = nutrients.find((n) => n.nutrient_name === 'Protein')?.nutrient_id
    const carbsId    = nutrients.find((n) => n.nutrient_name === 'Carbohydrates')?.nutrient_id
    const fatId      = nutrients.find((n) => n.nutrient_name === 'Total Fat')?.nutrient_id
    if (!proteinId || !carbsId || !fatId) return null

    // Per-food gram totals across all active meals
    const contribs = new Map<number, { name: string; protein_g: number; carbs_g: number; fat_g: number }>()
    for (const meal of meals) {
      for (const item of meal.items) {
        const food = foodsById.get(item.food_id)
        if (!food) continue
        const mult = item.grams / 100
        const prev = contribs.get(item.food_id) ?? {
          name: item.food_name || food.food_name,
          protein_g: 0, carbs_g: 0, fat_g: 0,
        }
        prev.protein_g += ((food.nutrients[proteinId] as number) ?? 0) * mult
        prev.carbs_g   += ((food.nutrients[carbsId]   as number) ?? 0) * mult
        prev.fat_g     += ((food.nutrients[fatId]     as number) ?? 0) * mult
        contribs.set(item.food_id, prev)
      }
    }

    // Convert grams → kcal per food
    type FoodKcal = { name: string; Carbohydrates: number; Protein: number; 'Total Fat': number }
    const foodList: FoodKcal[] = Array.from(contribs.values()).map((f) => ({
      name: f.name,
      Carbohydrates: f.carbs_g   * KCAL_PER_G.Carbohydrates,
      Protein:       f.protein_g * KCAL_PER_G.Protein,
      'Total Fat':   f.fat_g     * KCAL_PER_G['Total Fat'],
    }))

    const totalCarbs   = foodList.reduce((s, f) => s + f.Carbohydrates, 0)
    const totalProtein = foodList.reduce((s, f) => s + f.Protein,       0)
    const totalFat     = foodList.reduce((s, f) => s + f['Total Fat'],   0)
    const totalKcal    = totalCarbs + totalProtein + totalFat
    if (totalKcal === 0) return null

    // Inner ring — 3 macro slices
    const innerData: InnerSlice[] = MACROS.map((m) => ({
      name: m,
      value: m === 'Carbohydrates' ? totalCarbs : m === 'Protein' ? totalProtein : totalFat,
      color: MACRO_BASE[m],
    }))

    // Outer ring — top 5 foods + Other per macro, ordered to match inner slices
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
      carbsPct:   (totalCarbs   / totalKcal) * 100,
      proteinPct: (totalProtein / totalKcal) * 100,
      fatPct:     (totalFat     / totalKcal) * 100,
      carbsKcal:   Math.round(totalCarbs),
      proteinKcal: Math.round(totalProtein),
      fatKcal:     Math.round(totalFat),
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
        Inner: carb / protein / fat share · Outer: top 5 foods per macro
      </p>

      {/* Legend row */}
      <div className="flex items-center gap-4 mb-3">
        {(
          [
            { label: 'Carbs',   color: MACRO_BASE.Carbohydrates, pct: data.carbsPct,   kcal: data.carbsKcal   },
            { label: 'Protein', color: MACRO_BASE.Protein,       pct: data.proteinPct, kcal: data.proteinKcal },
            { label: 'Fat',     color: MACRO_BASE['Total Fat'],  pct: data.fatPct,     kcal: data.fatKcal     },
          ] as const
        ).map(({ label, color, pct, kcal }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
            <span className="text-[10px] text-slate-400">
              {label}{' '}
              <span className="font-semibold" style={{ color }}>
                {Math.round(pct)}%
              </span>
              <span className="text-slate-600 ml-1">{kcal} kcal</span>
            </span>
          </div>
        ))}
      </div>

      {/* Chart — relative wrapper for center label overlay */}
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
            {/* Inner ring — macro split + outer labels */}
            <Pie
              data={data.innerData}
              dataKey="value"
              innerRadius="30%"
              outerRadius="48%"
              startAngle={90}
              endAngle={-270}
              strokeWidth={0}
              isAnimationActive={false}
              label={MacroLabel}
              labelLine={false}
            >
              {data.innerData.map((entry, i) => (
                <Cell key={i} fill={entry.color} fillOpacity={0.9} />
              ))}
            </Pie>

            {/* Outer ring — top foods per macro */}
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

            <Tooltip content={<DonutTooltip totalKcal={data.totalKcal} />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
