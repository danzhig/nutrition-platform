'use client'

import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, Cell, ResponsiveContainer,
} from 'recharts'
import type { HeatmapData, NutrientMeta, FoodRow } from '@/types/nutrition'
import {
  RDA_PROFILES,
  NUTRIENT_BEHAVIORS,
  FOOD_METRIC_TARGETS,
  NUTRIENT_UPPER_LIMITS,
} from '@/lib/rdaProfiles'
import type { RDAProfile } from '@/lib/rdaProfiles'
import { rdaCellColor } from '@/lib/rdaColorScale'
import { useAuth } from './AuthProvider'
import { loadSavedProfiles } from '@/lib/profileStorage'
import type { SavedProfile } from '@/lib/profileStorage'
import { loadPresetMeals } from '@/lib/presetMealStorage'
import type { PresetMeal } from '@/lib/presetMealStorage'
import { loadSavedMeals } from '@/lib/savedMealStorage'
import type { SavedMeal } from '@/lib/savedMealStorage'
import { buildJuiceFactorMap } from '@/lib/juiceFactors'

interface Props {
  data: HeatmapData
}

const CATEGORY_ORDER = [
  'Macronutrient', 'Vitamin', 'Mineral', 'Fatty Acid', 'Amino Acid', 'Food Metric',
]

interface MealOption {
  id: string
  name: string
  category: string
  items: { food_id: number; grams: number }[]
  isJuice: boolean
}

function abbr(name: string): string {
  return name
    .replace('Vitamin ', 'Vit. ')
    .replace('Pantothenic Acid', 'Pantothenic')
    .replace('Polyunsaturated Fat', 'PUFA')
    .replace('Monounsaturated Fat', 'MUFA')
    .replace('Antioxidant Capacity', 'Antioxidant')
    .replace('Omega-3 Fatty Acids', 'Omega-3')
    .replace('Omega-6 Fatty Acids', 'Omega-6')
    .replace('Total Sugars', 'Sugars')
    .replace('Total Fat', 'Fat')
    .replace('Saturated Fat', 'Sat. Fat')
    .replace('Dietary Fibre', 'Fibre')
    .replace('Glycemic Index', 'GI')
    .replace('Net Carbohydrates', 'Net Carbs')
    .replace('Cholesterol', 'Chol.')
}

function fmtVal(val: number): string {
  const abs = Math.abs(val)
  if (abs === 0) return '0'
  if (abs < 0.1) return val.toFixed(3)
  if (abs < 1) return val.toFixed(2)
  if (abs < 100) return val.toFixed(1)
  return Math.round(val).toString()
}

function computeMealValues(
  meal: MealOption,
  foodsById: Map<number, FoodRow>,
  juiceFactorById: Map<number, number>
): Record<number, number | null> {
  const result: Record<number, number | null> = {}
  for (const item of meal.items) {
    const food = foodsById.get(item.food_id)
    if (!food) continue
    const mult = item.grams / 100
    for (const [idStr, rawVal] of Object.entries(food.nutrients)) {
      const nid = Number(idStr)
      if (rawVal != null) {
        const jFactor = meal.isJuice ? (juiceFactorById.get(nid) ?? 0.85) : 1
        result[nid] = (result[nid] ?? 0) + rawVal * mult * jFactor
      }
    }
  }
  return result
}

function computeSingleFoodValues(
  foodId: number,
  grams: number,
  isJuice: boolean,
  foodsById: Map<number, FoodRow>,
  juiceFactorById: Map<number, number>
): Record<number, number | null> {
  const result: Record<number, number | null> = {}
  const food = foodsById.get(foodId)
  if (!food) return result
  const mult = grams / 100
  for (const [idStr, rawVal] of Object.entries(food.nutrients)) {
    const nid = Number(idStr)
    const jFactor = isJuice ? (juiceFactorById.get(nid) ?? 0.85) : 1
    result[nid] = rawVal != null ? (rawVal as number) * mult * jFactor : null
  }
  return result
}

// ─── Meal Selector ─────────────────────────────────────────────────────────────

const MY_MEALS_CAT = 'My Meals'

function MealSelector({
  meals,
  value,
  onChange,
  label,
}: {
  meals: MealOption[]
  value: string | null
  onChange: (id: string | null) => void
  label: string
}) {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selected = meals.find((m) => m.id === value) ?? null

  const categories = useMemo(() => {
    const seen = new Set<string>()
    const cats: string[] = []
    for (const m of meals) {
      if (!seen.has(m.category)) { seen.add(m.category); cats.push(m.category) }
    }
    return ['All', ...cats.sort()]
  }, [meals])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q) return meals.filter((m) => m.name.toLowerCase().includes(q))
    if (activeCategory === 'All') return meals
    return meals.filter((m) => m.category === activeCategory)
  }, [meals, query, activeCategory])

  function handleSelect(id: string | null) {
    onChange(id)
    setQuery('')
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative flex-1 min-w-0">
      <p className="text-[10px] text-slate-500 mb-1 font-medium uppercase tracking-wider">{label}</p>
      <button
        type="button"
        className="w-full bg-slate-700 border border-slate-600 hover:border-slate-500 rounded px-2.5 py-1.5 text-sm text-left flex items-center justify-between transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <span className={`truncate ${selected ? 'text-slate-100' : 'text-slate-500'}`}>
          {selected ? selected.name : 'Select a meal…'}
        </span>
        <span className="text-slate-500 ml-1 flex-shrink-0 text-[10px]">▾</span>
      </button>
      {selected && (
        <p className="text-[10px] text-slate-500 mt-0.5 truncate">{selected.category}</p>
      )}

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl overflow-hidden" style={{ minWidth: 280 }}>
          <div className="p-2 border-b border-slate-700">
            <input
              autoFocus
              type="text"
              className="w-full bg-slate-700 border border-slate-600 rounded px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-violet-500"
              placeholder="Search all meals…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {!query.trim() && (
            <div className="px-2 py-1.5 border-b border-slate-700 flex flex-wrap gap-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                    activeCategory === cat
                      ? 'bg-violet-700 text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          <div className="overflow-y-auto" style={{ maxHeight: 240 }}>
            {value !== null && (
              <button
                className="w-full text-left px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-700 border-b border-slate-700"
                onClick={() => handleSelect(null)}
              >
                — Clear selection
              </button>
            )}
            {filtered.map((m) => (
              <button
                key={m.id}
                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-700/70 flex items-center justify-between ${
                  m.id === value ? 'text-violet-300' : 'text-slate-200'
                }`}
                onClick={() => handleSelect(m.id)}
              >
                <span className="truncate">{m.name}</span>
                {(query.trim() || activeCategory === 'All') && (
                  <span className="text-slate-500 text-[10px] flex-shrink-0 ml-2">{m.category}</span>
                )}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-3 py-4 text-xs text-slate-500 text-center">No meals match</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Nutrient panel ────────────────────────────────────────────────────────────

function NutrientComparePanel({
  title,
  subtitle,
  nutrients,
  values,
  rdaProfile,
  variant,
  hasMeal,
  scrollRef,
  onScroll,
  hideScrollbar = false,
  mealItems,
  foodsById,
  selectedFoodId,
  onSelectFood,
}: {
  title: string
  subtitle?: string
  nutrients: NutrientMeta[]
  values: Record<number, number | null>
  rdaProfile: RDAProfile | null
  variant: 'meal' | 'diff'
  hasMeal: boolean
  scrollRef?: React.RefObject<HTMLDivElement | null>
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void
  hideScrollbar?: boolean
  mealItems?: { food_id: number; grams: number }[]
  foodsById?: Map<number, FoodRow>
  selectedFoodId?: number | null
  onSelectFood?: (id: number | null) => void
}) {
  const grouped = useMemo(() => {
    const g: Record<string, NutrientMeta[]> = {}
    for (const n of nutrients) {
      if (!g[n.nutrient_category]) g[n.nutrient_category] = []
      g[n.nutrient_category].push(n)
    }
    return g
  }, [nutrients])

  const titleColor = variant === 'diff' ? 'text-cyan-300' : 'text-slate-200'

  const hasFoodPills = variant === 'meal' && !!mealItems?.length && !!foodsById && !!onSelectFood

  return (
    <div className="flex-1 min-w-0 bg-slate-800 border border-slate-700 rounded-lg overflow-hidden flex flex-col">
      <div className="bg-slate-800 border-b border-slate-700 px-3 py-2 flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className={`text-xs font-semibold truncate ${titleColor}`} title={title}>
              {title}
            </p>
            {subtitle && (
              <p className="text-[10px] text-slate-500 truncate mt-0.5" title={subtitle}>
                {subtitle}
              </p>
            )}
          </div>
          {variant === 'diff' && (
            <div className="flex items-center gap-3 flex-shrink-0 pt-0.5">
              <span className="flex items-center gap-1 text-[10px] text-green-400">
                <span className="w-2 h-2 rounded-sm inline-block bg-green-400 opacity-80" />
                A has more
              </span>
              <span className="flex items-center gap-1 text-[10px] text-red-400">
                <span className="w-2 h-2 rounded-sm inline-block bg-red-400 opacity-80" />
                B has more
              </span>
            </div>
          )}
        </div>

        {hasFoodPills && (
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => onSelectFood!(null)}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                selectedFoodId == null
                  ? 'bg-violet-600 text-white'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              All
            </button>
            {mealItems!.map((item) => {
              const food = foodsById!.get(item.food_id)
              if (!food) return null
              const name = food.food_name
              const label = name.length > 14 ? name.slice(0, 13) + '…' : name
              return (
                <button
                  key={item.food_id}
                  onClick={() => onSelectFood!(item.food_id)}
                  title={`${name} · ${item.grams}g`}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                    selectedFoodId === item.food_id
                      ? 'bg-violet-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {!hasMeal ? (
        <div className="flex items-center justify-center py-12 px-4">
          <p className="text-slate-600 text-xs text-center">
            {variant === 'diff' ? 'Select both meals to see the difference' : 'No meal selected'}
          </p>
        </div>
      ) : (
        <div
          ref={scrollRef}
          onScroll={onScroll}
          className={`px-2 py-2 space-y-3 ${hideScrollbar ? 'no-scrollbar overflow-y-scroll' : 'overflow-y-scroll'}`}
          style={{ maxHeight: 620 }}
        >
          {CATEGORY_ORDER.map((cat) => {
            const group = grouped[cat]
            if (!group?.length) return null
            return (
              <div key={cat}>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 px-1">
                  {cat}
                </p>
                <div className="space-y-0.5">
                  {group.map((n) => {
                    const rawVal = values[n.nutrient_id] ?? null
                    const rdaTarget =
                      rdaProfile != null
                        ? (rdaProfile.values[n.nutrient_name] ??
                            FOOD_METRIC_TARGETS[n.nutrient_name] ??
                            null)
                        : null

                    if (variant === 'meal') {
                      const effectiveVal = rawVal ?? 0
                      const pct = rdaTarget != null ? (effectiveVal / rdaTarget) * 100 : null
                      const behavior = NUTRIENT_BEHAVIORS[n.nutrient_name] ?? 'normal'
                      const ulValue = NUTRIENT_UPPER_LIMITS[n.nutrient_name]
                      const ulPct =
                        rdaTarget != null && ulValue != null
                          ? (ulValue / rdaTarget) * 100
                          : undefined
                      const barWidth = pct !== null ? Math.min(Math.max(pct, 0), 100) : 0
                      const barColor =
                        pct !== null
                          ? rdaCellColor(pct, behavior, ulPct)
                          : effectiveVal > 0
                            ? '#475569'
                            : '#334155'
                      const hasCap = behavior === 'limit' || behavior === 'normal-with-ul'

                      return (
                        <div key={n.nutrient_id} className="flex items-center gap-1.5 px-1">
                          <div
                            className="flex items-center gap-0.5 flex-shrink-0"
                            style={{ width: 90 }}
                          >
                            {hasCap && (
                              <span className="text-amber-400 text-[9px] flex-shrink-0">⚠</span>
                            )}
                            <span
                              className="truncate text-slate-300 text-[10px]"
                              title={n.nutrient_name}
                            >
                              {abbr(n.nutrient_name)}
                            </span>
                          </div>
                          <div className="flex-1 h-3.5 bg-slate-700 rounded-sm overflow-hidden relative">
                            {rawVal !== null && pct !== null && (
                              <div
                                className="h-full rounded-sm transition-all duration-200"
                                style={{ width: `${barWidth}%`, backgroundColor: barColor }}
                              />
                            )}
                            {rawVal !== null && pct === null && effectiveVal > 0 && (
                              <div
                                className="h-full rounded-sm"
                                style={{ width: '100%', backgroundColor: barColor }}
                              />
                            )}
                            {pct !== null && rawVal !== null && (
                              <span className="absolute inset-0 flex items-center justify-end pr-1 text-[9px] text-white font-medium leading-none">
                                {pct < 1 ? '<1' : Math.round(pct)}%
                              </span>
                            )}
                            {pct === null && rawVal !== null && effectiveVal > 0 && (
                              <span className="absolute inset-0 flex items-center justify-end pr-1 text-[9px] text-slate-300 leading-none">
                                {fmtVal(effectiveVal)} {n.unit}
                              </span>
                            )}
                            {rawVal === null && (
                              <span className="absolute inset-0 flex items-center justify-end pr-1 text-[9px] text-slate-600 leading-none">
                                N/A
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    } else {
                      const diffVal = rawVal
                      const diffPct =
                        rdaTarget != null && diffVal !== null
                          ? (diffVal / rdaTarget) * 100
                          : null
                      const isPositive = (diffVal ?? 0) >= 0
                      const clampedAbs =
                        diffPct !== null ? Math.min(Math.abs(diffPct), 100) : 0
                      const barHalfWidth = (clampedAbs / 100) * 50
                      const barColor = isPositive ? '#4ade80' : '#f87171'

                      const displayLabel =
                        diffPct !== null
                          ? `${isPositive ? '+' : ''}${Math.round(diffPct)}%`
                          : diffVal !== null
                            ? `${isPositive ? '+' : ''}${fmtVal(diffVal)} ${n.unit}`
                            : 'N/A'

                      const labelColor =
                        diffVal === null
                          ? '#475569'
                          : isPositive
                            ? '#4ade80'
                            : '#f87171'

                      return (
                        <div key={n.nutrient_id} className="flex items-center gap-1.5 px-1">
                          <div className="flex-shrink-0" style={{ width: 90 }}>
                            <span
                              className="truncate text-slate-300 text-[10px] block"
                              title={n.nutrient_name}
                            >
                              {abbr(n.nutrient_name)}
                            </span>
                          </div>
                          <div className="flex-1 h-3.5 bg-slate-700 rounded-sm relative">
                            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-slate-500" />
                            {diffVal !== null && barHalfWidth > 0 && (
                              <div
                                className="absolute top-0 bottom-0 rounded-sm"
                                style={{
                                  width: `${barHalfWidth}%`,
                                  [isPositive ? 'left' : 'right']: '50%',
                                  backgroundColor: barColor,
                                  opacity: 0.8,
                                }}
                              />
                            )}
                            <span
                              className="absolute inset-0 flex items-center justify-end pr-1 text-[9px] font-medium leading-none"
                              style={{ color: labelColor }}
                            >
                              {displayLabel}
                            </span>
                          </div>
                        </div>
                      )
                    }
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Chart tooltip ─────────────────────────────────────────────────────────────

interface DiffBar {
  label: string
  fullName: string
  diffPct: number
  unit: string
  rawDiff: number
}

function DiffChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: DiffBar }[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-100 font-semibold mb-1">{d.fullName}</p>
      <p>
        <span
          className="font-semibold text-sm"
          style={{ color: d.diffPct >= 0 ? '#4ade80' : '#f87171' }}
        >
          {d.diffPct >= 0 ? '+' : ''}
          {Math.round(d.diffPct)}%
        </span>
        <span className="text-slate-400 ml-1">DV difference</span>
      </p>
      <p className="text-slate-400 mt-0.5">
        {d.rawDiff >= 0 ? '+' : ''}
        {fmtVal(d.rawDiff)} {d.unit}
      </p>
    </div>
  )
}

function CustomXTick({ x, y, payload }: { x?: number; y?: number; payload?: { value: string } }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dx={-4}
        textAnchor="end"
        transform="rotate(-90)"
        fontSize={10}
        fill="#94a3b8"
      >
        {payload?.value}
      </text>
    </g>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function MealComparisonView({ data }: Props) {
  const { user } = useAuth()
  const [mealAId, setMealAId] = useState<string | null>(null)
  const [mealBId, setMealBId] = useState<string | null>(null)
  const [selectedFoodA, setSelectedFoodA] = useState<number | null>(null)
  const [selectedFoodB, setSelectedFoodB] = useState<number | null>(null)
  const [profileId, setProfileId] = useState<string>('none')
  const [profileOpen, setProfileOpen] = useState(false)
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([])
  const [presetMeals, setPresetMeals] = useState<PresetMeal[]>([])
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([])
  const [loadingMeals, setLoadingMeals] = useState(true)

  const profileRef = useRef<HTMLDivElement>(null)
  const scrollRefA = useRef<HTMLDivElement>(null)
  const scrollRefB = useRef<HTMLDivElement>(null)
  const scrollRefDiff = useRef<HTMLDivElement>(null)

  const syncScroll = useCallback((source: React.RefObject<HTMLDivElement | null>) => {
    return (e: React.UIEvent<HTMLDivElement>) => {
      const top = (e.target as HTMLDivElement).scrollTop
      for (const ref of [scrollRefA, scrollRefB, scrollRefDiff]) {
        if (ref !== source && ref.current && ref.current.scrollTop !== top) {
          ref.current.scrollTop = top
        }
      }
    }
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Load preset meals once
  useEffect(() => {
    loadPresetMeals()
      .then(setPresetMeals)
      .catch(console.error)
      .finally(() => setLoadingMeals(false))
  }, [])

  // Load saved meals and profiles when user logs in; clear on logout
  useEffect(() => {
    if (!user) {
      setSavedMeals([])
      setSavedProfiles([])
      setProfileId((id) => (id.startsWith('saved:') ? 'none' : id))
      return
    }
    loadSavedMeals().then(setSavedMeals).catch(console.error)
    loadSavedProfiles().then(setSavedProfiles).catch(console.error)
  }, [user])

  const foodsById = useMemo(() => {
    const m = new Map<number, FoodRow>()
    for (const f of data.foods) m.set(f.food_id, f)
    return m
  }, [data.foods])

  const juiceFactorById = useMemo(() => buildJuiceFactorMap(data.nutrients), [data.nutrients])

  // Combine preset and saved meals into unified MealOption list
  const allMeals = useMemo<MealOption[]>(() => {
    const preset: MealOption[] = presetMeals.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      items: p.items,
      isJuice: p.category.toLowerCase().includes('juice'),
    }))
    const saved: MealOption[] = savedMeals.map((s) => ({
      id: s.id,
      name: s.name,
      category: MY_MEALS_CAT,
      items: s.items,
      isJuice: false,
    }))
    return [...saved, ...preset]
  }, [presetMeals, savedMeals])

  const mealsById = useMemo(() => {
    const m = new Map<string, MealOption>()
    for (const meal of allMeals) m.set(meal.id, meal)
    return m
  }, [allMeals])

  const mealA = mealAId != null ? (mealsById.get(mealAId) ?? null) : null
  const mealB = mealBId != null ? (mealsById.get(mealBId) ?? null) : null

  const rdaProfile: RDAProfile | null = useMemo(() => {
    if (profileId === 'none') return null
    if (profileId.startsWith('saved:')) {
      const savedId = profileId.slice(6)
      const sp = savedProfiles.find((p) => p.id === savedId)
      if (!sp) return null
      const shortLabel = sp.name.length > 13 ? sp.name.slice(0, 12) + '…' : sp.name
      return { id: 'custom', label: sp.name, shortLabel, description: 'Saved custom profile', values: sp.values }
    }
    return RDA_PROFILES.find((p) => p.id === profileId) ?? null
  }, [profileId, savedProfiles])

  // Reset food drill-down when meal selection changes
  useEffect(() => { setSelectedFoodA(null) }, [mealAId])
  useEffect(() => { setSelectedFoodB(null) }, [mealBId])

  const valuesA = useMemo<Record<number, number | null>>(() => {
    if (!mealA) return {}
    return computeMealValues(mealA, foodsById, juiceFactorById)
  }, [mealA, foodsById, juiceFactorById])

  const valuesB = useMemo<Record<number, number | null>>(() => {
    if (!mealB) return {}
    return computeMealValues(mealB, foodsById, juiceFactorById)
  }, [mealB, foodsById, juiceFactorById])

  // Drill-down display values: single food when selected, full meal otherwise
  const displayValuesA = useMemo<Record<number, number | null>>(() => {
    if (!mealA || selectedFoodA === null) return valuesA
    const item = mealA.items.find((i) => i.food_id === selectedFoodA)
    if (!item) return valuesA
    return computeSingleFoodValues(selectedFoodA, item.grams, mealA.isJuice, foodsById, juiceFactorById)
  }, [mealA, selectedFoodA, valuesA, foodsById, juiceFactorById])

  const displayValuesB = useMemo<Record<number, number | null>>(() => {
    if (!mealB || selectedFoodB === null) return valuesB
    const item = mealB.items.find((i) => i.food_id === selectedFoodB)
    if (!item) return valuesB
    return computeSingleFoodValues(selectedFoodB, item.grams, mealB.isJuice, foodsById, juiceFactorById)
  }, [mealB, selectedFoodB, valuesB, foodsById, juiceFactorById])

  const valuesDiff = useMemo<Record<number, number | null>>(() => {
    const result: Record<number, number | null> = {}
    for (const n of data.nutrients) {
      const a = valuesA[n.nutrient_id] ?? null
      const b = valuesB[n.nutrient_id] ?? null
      result[n.nutrient_id] = a != null && b != null ? a - b : null
    }
    return result
  }, [valuesA, valuesB, data.nutrients])

  const diffChartData = useMemo<DiffBar[]>(() => {
    if (!mealA || !mealB || !rdaProfile) return []
    const bars: DiffBar[] = []
    for (const n of data.nutrients) {
      const diffVal = valuesDiff[n.nutrient_id]
      if (diffVal === null) continue
      const rdaTarget =
        rdaProfile.values[n.nutrient_name] ?? FOOD_METRIC_TARGETS[n.nutrient_name] ?? null
      if (rdaTarget === null) continue
      bars.push({
        label: abbr(n.nutrient_name),
        fullName: n.nutrient_name,
        diffPct: (diffVal / rdaTarget) * 100,
        unit: n.unit,
        rawDiff: diffVal,
      })
    }
    bars.sort((a, b) => b.diffPct - a.diffPct)
    return bars
  }, [mealA, mealB, rdaProfile, data.nutrients, valuesDiff])

  const bothSelected = mealA !== null && mealB !== null
  const eitherSelected = mealA !== null || mealB !== null

  return (
    <div className="space-y-4">
      {/* Controls bar */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <div className="flex gap-4 flex-wrap items-start">
          {loadingMeals ? (
            <p className="text-slate-500 text-xs py-2">Loading meals…</p>
          ) : (
            <>
              <MealSelector meals={allMeals} value={mealAId} onChange={setMealAId} label="Meal A" />
              <div className="flex items-end pb-3 flex-shrink-0">
                <span className="text-slate-500 text-sm font-medium">vs</span>
              </div>
              <MealSelector meals={allMeals} value={mealBId} onChange={setMealBId} label="Meal B" />
            </>
          )}

          <div className="w-px self-stretch bg-slate-700 mx-1 flex-shrink-0" />

          {/* DV Profile dropdown */}
          <div ref={profileRef} className="relative flex-shrink-0">
            <p className="text-[10px] text-slate-500 mb-1.5 font-medium uppercase tracking-wider">
              DV Profile
            </p>
            <button
              onClick={() => setProfileOpen((v) => !v)}
              className="bg-slate-700 border border-slate-600 hover:border-slate-500 rounded px-3 py-1.5 text-xs text-slate-200 flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              {rdaProfile ? rdaProfile.shortLabel : 'None (Raw Values)'}
              <span className="text-slate-500 text-[10px]">▾</span>
            </button>
            {profileOpen && (
              <div className="absolute z-50 top-full right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl overflow-hidden min-w-[200px]">
                <button
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-700 ${
                    profileId === 'none' ? 'text-violet-300' : 'text-slate-300'
                  }`}
                  onClick={() => { setProfileId('none'); setProfileOpen(false) }}
                >
                  None (Raw Values)
                </button>

                {savedProfiles.length > 0 && (
                  <>
                    <div className="px-3 py-1 text-[10px] text-slate-500 font-semibold uppercase tracking-wider border-t border-slate-700">
                      Saved Profiles
                    </div>
                    {savedProfiles.map((sp) => {
                      const key = `saved:${sp.id}`
                      return (
                        <button
                          key={sp.id}
                          className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-700 ${
                            profileId === key ? 'text-violet-300' : 'text-slate-300'
                          }`}
                          onClick={() => { setProfileId(key); setProfileOpen(false) }}
                        >
                          {sp.name}
                        </button>
                      )
                    })}
                  </>
                )}

                <div className="px-3 py-1 text-[10px] text-slate-500 font-semibold uppercase tracking-wider border-t border-slate-700">
                  Built-in Profiles
                </div>
                {RDA_PROFILES.map((p) => (
                  <button
                    key={p.id}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-700 ${
                      profileId === p.id ? 'text-violet-300' : 'text-slate-300'
                    }`}
                    onClick={() => { setProfileId(p.id); setProfileOpen(false) }}
                  >
                    {p.label}
                  </button>
                ))}

                {!user && (
                  <p className="px-3 py-2 text-[10px] text-slate-500 border-t border-slate-700 italic">
                    Sign in to use saved profiles and My Meals
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Three comparison panels */}
      {eitherSelected ? (
        <div className="flex gap-3">
          <NutrientComparePanel
            title={mealA ? mealA.name : 'Meal A'}
            subtitle={mealA ? mealA.category : undefined}
            nutrients={data.nutrients}
            values={displayValuesA}
            rdaProfile={rdaProfile}
            variant="meal"
            hasMeal={mealA !== null}
            scrollRef={scrollRefA}
            onScroll={syncScroll(scrollRefA)}
            hideScrollbar
            mealItems={mealA?.items}
            foodsById={foodsById}
            selectedFoodId={selectedFoodA}
            onSelectFood={setSelectedFoodA}
          />
          <NutrientComparePanel
            title={mealB ? mealB.name : 'Meal B'}
            subtitle={mealB ? mealB.category : undefined}
            nutrients={data.nutrients}
            values={displayValuesB}
            rdaProfile={rdaProfile}
            variant="meal"
            hasMeal={mealB !== null}
            scrollRef={scrollRefB}
            onScroll={syncScroll(scrollRefB)}
            hideScrollbar
            mealItems={mealB?.items}
            foodsById={foodsById}
            selectedFoodId={selectedFoodB}
            onSelectFood={setSelectedFoodB}
          />
          <NutrientComparePanel
            title="Net Difference (A − B)"
            subtitle={
              bothSelected
                ? `${mealA!.name} minus ${mealB!.name}`
                : 'Select both meals to see the difference'
            }
            nutrients={data.nutrients}
            values={valuesDiff}
            rdaProfile={rdaProfile}
            variant="diff"
            hasMeal={bothSelected}
            scrollRef={scrollRefDiff}
            onScroll={syncScroll(scrollRefDiff)}
          />
        </div>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-slate-400 text-sm font-medium mb-1">Select two meals to compare</p>
            <p className="text-slate-600 text-xs">
              Use the dropdowns above to pick Meal A and Meal B
            </p>
          </div>
        </div>
      )}

      {/* Net difference bar chart */}
      {bothSelected && rdaProfile && diffChartData.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-xs font-semibold text-slate-300">
                Net Difference — % Daily Value ({rdaProfile.shortLabel})
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Sorted largest positive → largest negative ·{' '}
                <span className="text-slate-400">{mealA!.name}</span>
                {' minus '}
                <span className="text-slate-400">{mealB!.name}</span>
              </p>
            </div>
            <div className="flex items-center gap-4 text-[10px]">
              <span className="flex items-center gap-1.5 text-green-400">
                <span className="w-2.5 h-2.5 rounded-sm inline-block bg-green-400 opacity-80" />
                A has more
              </span>
              <span className="flex items-center gap-1.5 text-red-400">
                <span className="w-2.5 h-2.5 rounded-sm inline-block bg-red-400 opacity-80" />
                B has more
              </span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={440}>
            <BarChart
              data={diffChartData}
              margin={{ top: 16, right: 16, left: 0, bottom: 100 }}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis
                dataKey="label"
                tick={<CustomXTick />}
                interval={0}
                axisLine={{ stroke: '#475569' }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v: number) => `${Math.round(v)}%`}
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <Tooltip
                content={<DiffChartTooltip />}
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                isAnimationActive={false}
              />
              <ReferenceLine
                y={0}
                stroke="#64748b"
                strokeWidth={1.5}
                label={{ value: '0%', fontSize: 9, fill: '#64748b', position: 'insideTopRight' }}
              />
              <Bar dataKey="diffPct" radius={[3, 3, 0, 0]} maxBarSize={28}>
                {diffChartData.map((bar) => (
                  <Cell
                    key={bar.label}
                    fill={bar.diffPct >= 0 ? '#4ade80' : '#f87171'}
                    fillOpacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {bothSelected && !rdaProfile && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center py-10">
          <p className="text-slate-500 text-sm">
            Select a DV profile above to see the net difference bar chart.
          </p>
        </div>
      )}
    </div>
  )
}
