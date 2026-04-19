'use client'

import { useMemo } from 'react'
import type { NutrientMeta } from '@/types/nutrition'
import type { RDAProfile } from '@/lib/rdaProfiles'
import { FOOD_METRIC_TARGETS } from '@/lib/rdaProfiles'
import { rdaCellColor } from '@/lib/rdaColorScale'

interface Props {
  nutrients: NutrientMeta[]
  rdaProfile: RDAProfile
  totals: Record<number, number>
}

const CATS = ['Macronutrient', 'Vitamin', 'Mineral', 'Fatty Acid', 'Amino Acid'] as const
type Cat = typeof CATS[number]

const CAT_COLOR: Record<Cat, string> = {
  'Macronutrient': '#94a3b8',
  'Vitamin':       '#a78bfa',
  'Mineral':       '#22d3ee',
  'Fatty Acid':    '#fbbf24',
  'Amino Acid':    '#4ade80',
}

const MAX_R = 100   // SVG units = 100% DV
const GRID  = [25, 50, 75, 100]
const EDGES: [number, number][] = [[0,1],[1,2],[2,3],[3,4],[4,0]]

function angleRad(i: number) {
  // Start at top (−90°), go clockwise
  return ((-90 + 72 * i) * Math.PI) / 180
}

function polar(i: number, r: number): [number, number] {
  const a = angleRad(i)
  return [r * Math.cos(a), r * Math.sin(a)]
}

function pentagon(r: number) {
  return Array.from({ length: 5 }, (_, i) => polar(i, r).join(',')).join(' ')
}

export default function MealCategoryRadar({ nutrients, rdaProfile, totals }: Props) {
  const catData = useMemo(() => {
    return CATS.map((cat, i) => {
      const group = nutrients.filter((n) => n.nutrient_category === cat)
      const capped: number[] = []

      for (const n of group) {
        const target = rdaProfile.values[n.nutrient_name] ?? FOOD_METRIC_TARGETS[n.nutrient_name] ?? null
        if (target == null) continue
        const raw = totals[n.nutrient_id] ?? 0
        capped.push(Math.min((raw / target) * 100, 100))
      }

      const avg = capped.length > 0 ? capped.reduce((a, b) => a + b, 0) / capped.length : 0
      const color = rdaCellColor(avg, 'normal', undefined)
      // Minimum r of 2 so points never collapse to exact centre
      const r = Math.max(2, (avg / 100) * MAX_R)
      const [x, y] = polar(i, r)
      const [lx, ly] = polar(i, MAX_R + 30)

      return { cat: cat as Cat, avg, color, x, y, lx, ly, i }
    })
  }, [nutrients, rdaProfile, totals])

  const dataPolygon = catData.map((d) => `${d.x},${d.y}`).join(' ')

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex flex-col">
      <p className="text-xs font-semibold text-slate-300 mb-1">Category Fulfilment</p>
      <p className="text-[10px] text-slate-500 mb-3">Average % DV per category — each nutrient capped at 100%</p>

      <svg viewBox="-165 -155 330 320" className="w-full flex-1" style={{ minHeight: 240 }}>
        <defs>
          {/* Per-edge linear gradients between adjacent vertex colours */}
          {EDGES.map(([i, j]) => {
            const a = catData[i], b = catData[j]
            return (
              <linearGradient
                key={`eg-${i}-${j}`}
                id={`eg-${i}-${j}`}
                gradientUnits="userSpaceOnUse"
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              >
                <stop offset="0%"   stopColor={a.color} stopOpacity="0.95" />
                <stop offset="100%" stopColor={b.color} stopOpacity="0.95" />
              </linearGradient>
            )
          })}
        </defs>

        {/* Grid pentagons */}
        {GRID.map((pct) => (
          <polygon
            key={pct}
            points={pentagon((pct / 100) * MAX_R)}
            fill="none"
            stroke={pct === 100 ? '#475569' : '#1e293b'}
            strokeWidth={pct === 100 ? 1.5 : 1}
          />
        ))}

        {/* Spokes */}
        {catData.map((d) => {
          const [ox, oy] = polar(d.i, MAX_R)
          return <line key={d.cat} x1={0} y1={0} x2={ox} y2={oy} stroke="#334155" strokeWidth={1} />
        })}

        {/* Grid % labels on the right-of-top spoke (i=0 goes straight up, put labels offset) */}
        {GRID.map((pct) => {
          const [x, y] = polar(0, (pct / 100) * MAX_R)
          return (
            <text key={pct} x={x + 5} y={y} fontSize={7} fill="#475569" dominantBaseline="middle">
              {pct}%
            </text>
          )
        })}

        {/* Data polygon — neutral translucent fill */}
        <polygon points={dataPolygon} fill="rgba(139,92,246,0.08)" stroke="none" />

        {/* Gradient edges */}
        {EDGES.map(([i, j]) => {
          const a = catData[i], b = catData[j]
          return (
            <line
              key={`el-${i}-${j}`}
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={`url(#eg-${i}-${j})`}
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          )
        })}

        {/* Vertex dots */}
        {catData.map((d) => (
          <circle
            key={d.cat}
            cx={d.x} cy={d.y} r={5}
            fill={d.color}
            stroke="#0f172a"
            strokeWidth={1.5}
          >
            <title>{d.cat}: {Math.round(d.avg)}% avg DV</title>
          </circle>
        ))}

        {/* Category labels + avg % */}
        {catData.map((d) => {
          const anchor = d.lx > 8 ? 'start' : d.lx < -8 ? 'end' : 'middle'
          return (
            <g key={d.cat}>
              <text
                x={d.lx} y={d.ly - 7}
                fontSize={9.5}
                fontWeight="600"
                fill={CAT_COLOR[d.cat]}
                textAnchor={anchor}
                dominantBaseline="middle"
              >
                {d.cat}
              </text>
              <text
                x={d.lx} y={d.ly + 6}
                fontSize={9}
                fill={d.color}
                textAnchor={anchor}
                dominantBaseline="middle"
              >
                {Math.round(d.avg)}% avg
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
