'use client'

import { useState, useMemo, useCallback, useRef, useLayoutEffect } from 'react'
import type { NutrientMeta, FoodRow } from '@/types/nutrition'
import type { DietNutrientResult, FoodNutrientMap } from '@/lib/dietProfile'
import { WEIGHTED_AVERAGE_NUTRIENTS } from '@/lib/dietProfile'
import type { DietFood } from '@/lib/dietStorage'
import { rdaCellColor } from '@/lib/rdaColorScale'
import { getPortionSize } from '@/lib/portionSizes'
import NutrientInfoCard from './NutrientInfoCard'

type FilterMode = 'all' | 'gaps' | 'fulfilled'
type SortMode = 'gap-first' | 'category'

const GAP_THRESHOLD = 0.70

const CONTRIB_COLORS = [
  '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981',
  '#f472b6', '#fb923c', '#a3e635', '#64748b',
]

interface TopSource {
  foodId: number
  foodName: string
  pctDV: number
}

export interface DietFoodContrib {
  foodName: string
  contribPctDV: number  // fraction (0–1); multiply by 100 for %
  color: string
}

interface Props {
  results: DietNutrientResult[]
  allNutrients: NutrientMeta[]
  foodsById: Map<number, FoodRow>
  hasSelection: boolean
  hasProfile: boolean
  allFoodNutrients: FoodNutrientMap
  selectedFoodIds: Set<number>
  selectedFoods: DietFood[]
  onAddFood: (foodId: number) => void
}

// ─── Color helpers ────────────────────────────────────────────────────────────

function dietBarColor(
  pctDV: number,
  behavior: string,
  upperLimit?: number,
  rdaTarget?: number,
): string {
  const pct = pctDV * 100
  if (behavior === 'limit') return rdaCellColor(pct, 'limit')
  if (behavior === 'normal-with-ul' && upperLimit !== undefined && rdaTarget !== undefined) {
    if (pct >= 70) return rdaCellColor(pct, 'normal-with-ul', (upperLimit / rdaTarget) * 100)
  }
  if (pct < 30) return 'hsl(0, 72%, 40%)'
  if (pct < 70) return 'hsl(38, 82%, 44%)'
  return 'hsl(142, 65%, 34%)'
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
    .replace('Net Carbohydrates', 'Net Carbs')
}

// ─── Per-food contribution computation ───────────────────────────────────────

function computeFoodContribs(
  result: DietNutrientResult,
  selectedFoods: DietFood[],
  allFoodNutrients: FoodNutrientMap,
  foodsById: Map<number, FoodRow>,
): DietFoodContrib[] {
  // Mirrors computeDietProfile: daily weight = portionSize × (daysPerWeek / 7)
  const dailyWeights = new Map<number, number>()
  for (const { foodId, daysPerWeek, gramsOverride } of selectedFoods) {
    dailyWeights.set(foodId, (gramsOverride ?? getPortionSize(foodId).grams) * (daysPerWeek / 7))
  }

  const contribs: { foodName: string; contribPctDV: number }[] = []

  if (WEIGHTED_AVERAGE_NUTRIENTS.has(result.nutrientName)) {
    // Weighted-average path: GI = Σ(value × dailyW) / Σ(dailyW)
    let denominator = 0
    const entries: { foodName: string; rawValue: number; dailyW: number }[] = []

    for (const { foodId } of selectedFoods) {
      const nutrients = allFoodNutrients[foodId]
      if (!nutrients) continue
      const rawValue = nutrients[result.nutrientId]
      if (rawValue === null || rawValue === undefined) continue

      const dailyW = dailyWeights.get(foodId) ?? 0
      denominator += dailyW
      entries.push({ foodName: foodsById.get(foodId)?.food_name ?? `Food #${foodId}`, rawValue, dailyW })
    }

    for (const { foodName, rawValue, dailyW } of entries) {
      const contribPctDV = denominator > 0 ? (rawValue * (dailyW / denominator)) / result.rdaTarget : 0
      if (contribPctDV < 0.001) continue
      contribs.push({ foodName, contribPctDV })
    }
  } else {
    // Standard summing path
    for (const { foodId } of selectedFoods) {
      const nutrients = allFoodNutrients[foodId]
      if (!nutrients) continue

      const rawValue = nutrients[result.nutrientId]
      if (rawValue === null || rawValue === undefined || rawValue === 0) continue

      const dailyW = dailyWeights.get(foodId) ?? 0
      const contribPctDV = ((rawValue / 100) * dailyW) / result.rdaTarget

      if (contribPctDV < 0.001) continue
      contribs.push({ foodName: foodsById.get(foodId)?.food_name ?? `Food #${foodId}`, contribPctDV })
    }
  }

  contribs.sort((a, b) => b.contribPctDV - a.contribPctDV)

  const TOP_N = 8
  const named = contribs.slice(0, TOP_N).map((c, i) => ({
    ...c,
    color: CONTRIB_COLORS[i % CONTRIB_COLORS.length],
  }))

  const otherSum = contribs.slice(TOP_N).reduce((s, c) => s + c.contribPctDV, 0)
  if (otherSum >= 0.001) {
    named.push({ foodName: 'Other', contribPctDV: otherSum, color: '#475569' })
  }

  return named
}

// ─── Top-sources computation ──────────────────────────────────────────────────

function computeTopSources(
  nutrientId: number,
  rdaTarget: number,
  foodsById: Map<number, FoodRow>,
  allFoodNutrients: FoodNutrientMap,
  selectedFoodIds: Set<number>,
): TopSource[] {
  const candidates: TopSource[] = []

  for (const foodIdStr of Object.keys(allFoodNutrients)) {
    const foodId = Number(foodIdStr)
    if (selectedFoodIds.has(foodId)) continue

    const nutrients = allFoodNutrients[foodId]
    if (!nutrients) continue

    const value = nutrients[nutrientId]
    if (value === null || value === undefined || value === 0) continue

    const portionG = getPortionSize(foodId).grams
    const contrib = (value / 100) * portionG
    const pctDV = (contrib / rdaTarget) * 100
    if (pctDV < 1) continue

    const food = foodsById.get(foodId)
    if (!food) continue

    candidates.push({ foodId, foodName: food.food_name, pctDV })
  }

  return candidates.sort((a, b) => b.pctDV - a.pctDV).slice(0, 3)
}

// ─── Top-sources tooltip ──────────────────────────────────────────────────────

function SourceTooltip({
  sources,
  anchorRect,
  nutrientName,
  onAdd,
  onMouseEnter,
  onMouseLeave,
}: {
  sources: TopSource[]
  anchorRect: DOMRect
  nutrientName: string
  onAdd: (foodId: number) => void
  onMouseEnter: () => void
  onMouseLeave: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const TOOLTIP_W = 236
  const GAP = 8

  useLayoutEffect(() => {
    if (!ref.current) return
    const h = ref.current.offsetHeight

    let left = anchorRect.left - TOOLTIP_W - GAP
    if (left < 8) left = Math.min(anchorRect.right + GAP, window.innerWidth - TOOLTIP_W - 8)

    let top = anchorRect.top - 8
    top = Math.max(8, top)
    top = Math.min(top, window.innerHeight - h - 8)

    setPos({ top, left })
  }, [anchorRect, sources])

  return (
    <div
      ref={ref}
      className="fixed z-50 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl p-3 text-xs"
      style={{
        width: TOOLTIP_W,
        top: pos?.top ?? 0,
        left: pos?.left ?? 0,
        visibility: pos ? 'visible' : 'hidden',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-2.5">
        Top sources not in your diet
      </p>

      {sources.length === 0 ? (
        <p className="text-slate-500 text-[10px] italic">
          No food data available for {nutrientName}
        </p>
      ) : (
        <div className="space-y-1.5">
          {sources.map((s) => (
            <div key={s.foodId} className="flex items-center gap-2">
              <span className="flex-1 text-slate-200 truncate text-[10px]" title={s.foodName}>
                {s.foodName}
              </span>
              <span className="text-slate-400 text-[10px] flex-shrink-0 tabular-nums">
                {Math.round(s.pctDV)}%
              </span>
              <button
                onClick={() => onAdd(s.foodId)}
                className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-violet-600 hover:bg-violet-500 text-white rounded text-[10px] font-bold transition-colors leading-none"
                title={`Add ${s.foodName} to your diet`}
              >
                +
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DietNutrientPanel({
  results,
  allNutrients,
  foodsById,
  hasSelection,
  hasProfile,
  allFoodNutrients,
  selectedFoodIds,
  selectedFoods,
  onAddFood,
}: Props) {
  const [filter, setFilter] = useState<FilterMode>(() => {
    if (typeof window === 'undefined') return 'all'
    return (localStorage.getItem('np:diet:filter') as FilterMode) ?? 'all'
  })
  const [sort, setSort] = useState<SortMode>(() => {
    if (typeof window === 'undefined') return 'gap-first'
    return (localStorage.getItem('np:diet:sort') as SortMode) ?? 'gap-first'
  })
  const [infoNutrient, setInfoNutrient] = useState<NutrientMeta | null>(null)
  const [infoAnchor, setInfoAnchor] = useState<DOMRect | null>(null)
  const [infoDietContribs, setInfoDietContribs] = useState<DietFoodContrib[]>([])
  const [infoDietTotalPctDV, setInfoDietTotalPctDV] = useState<number | null>(null)

  const [hoverResult, setHoverResult] = useState<DietNutrientResult | null>(null)
  const [hoverAnchorRect, setHoverAnchorRect] = useState<DOMRect | null>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const nutrientMetaById = useMemo(
    () => new Map(allNutrients.map((n) => [n.nutrient_id, n])),
    [allNutrients],
  )

  function setFilterPersist(f: FilterMode) {
    setFilter(f)
    localStorage.setItem('np:diet:filter', f)
  }

  function setSortPersist(s: SortMode) {
    setSort(s)
    localStorage.setItem('np:diet:sort', s)
  }

  // ── Hover tooltip handlers ────────────────────────────────────────────────

  function showTooltip(result: DietNutrientResult, rect: DOMRect) {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    setHoverResult(result)
    setHoverAnchorRect(rect)
  }

  function scheduleHide() {
    hideTimerRef.current = setTimeout(() => {
      setHoverResult(null)
      setHoverAnchorRect(null)
    }, 150)
  }

  function cancelHide() {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
  }

  function dismissTooltip() {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    setHoverResult(null)
    setHoverAnchorRect(null)
  }

  // ── NutrientInfoCard click ─────────────────────────────────────────────────

  const handleRowClick = useCallback(
    (result: DietNutrientResult, e: React.MouseEvent) => {
      dismissTooltip()
      const nutrient = nutrientMetaById.get(result.nutrientId)
      if (!nutrient) return

      // Toggle off
      if (infoNutrient?.nutrient_id === result.nutrientId) {
        setInfoNutrient(null)
        setInfoAnchor(null)
        setInfoDietContribs([])
        setInfoDietTotalPctDV(null)
        return
      }

      const contribs = hasSelection
        ? computeFoodContribs(result, selectedFoods, allFoodNutrients, foodsById)
        : []

      // Only open if there's something to show
      if (!nutrient.body_role && contribs.length === 0) return

      setInfoNutrient(nutrient)
      setInfoAnchor((e.currentTarget as HTMLElement).getBoundingClientRect())
      setInfoDietContribs(contribs)
      setInfoDietTotalPctDV(result.pctDV)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [infoNutrient, nutrientMetaById, hasSelection, selectedFoods, allFoodNutrients, foodsById],
  )

  // ── Top sources for the hovered nutrient ─────────────────────────────────

  const topSources = useMemo<TopSource[]>(() => {
    if (!hoverResult) return []
    return computeTopSources(
      hoverResult.nutrientId,
      hoverResult.rdaTarget,
      foodsById,
      allFoodNutrients,
      selectedFoodIds,
    )
  }, [hoverResult, foodsById, allFoodNutrients, selectedFoodIds])

  // ── Filtered + sorted list ────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = results
    if (filter === 'gaps') list = list.filter((r) => r.pctDV < GAP_THRESHOLD)
    if (filter === 'fulfilled') list = list.filter((r) => r.pctDV >= GAP_THRESHOLD)
    if (sort === 'gap-first') return [...list].sort((a, b) => a.pctDV - b.pctDV)
    return list
  }, [results, filter, sort])

  type RenderItem =
    | { kind: 'header'; label: string }
    | { kind: 'row'; result: DietNutrientResult }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const renderList = useMemo<RenderItem[]>(() => {
    if (sort !== 'category') return filtered.map((r) => ({ kind: 'row', result: r }))
    const items: RenderItem[] = []
    let lastCat = ''
    for (const result of filtered) {
      if (result.nutrientCategory !== lastCat) {
        items.push({ kind: 'header', label: result.nutrientCategory })
        lastCat = result.nutrientCategory
      }
      items.push({ kind: 'row', result })
    }
    return items
  }, [filtered, sort])

  // ── Empty / no-profile states ─────────────────────────────────────────────

  if (!hasProfile) {
    return (
      <div className="h-full flex items-center justify-center px-4">
        <p className="text-slate-500 text-xs text-center">
          Select a DV profile in the header to see nutrient coverage
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="h-full flex flex-col">
        {/* Filter + sort controls */}
        <div className="px-3 pt-2 pb-2 border-b border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-1">
            {(['all', 'gaps', 'fulfilled'] as FilterMode[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilterPersist(f)}
                className={`px-2.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  filter === f
                    ? 'bg-violet-600 text-white'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
              >
                {f === 'all' ? 'All' : f === 'gaps' ? 'Gaps' : 'Fulfilled'}
              </button>
            ))}
            <select
              value={sort}
              onChange={(e) => setSortPersist(e.target.value as SortMode)}
              className="ml-auto bg-slate-700 text-slate-300 text-[10px] rounded px-1.5 py-0.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-violet-500"
            >
              <option value="gap-first">Gap-first</option>
              <option value="category">Category</option>
            </select>
          </div>
        </div>

        {/* Nutrient rows */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5 min-h-0">
          {!hasSelection && (
            <p className="text-slate-500 text-[10px] text-center pt-2 pb-3 italic">
              Add foods to see your actual coverage
            </p>
          )}

          {filtered.length === 0 && hasSelection && (
            <p className="text-slate-500 text-[11px] text-center py-6">
              {filter === 'gaps'
                ? 'No gaps — your diet covers everything!'
                : 'No nutrients match this filter.'}
            </p>
          )}

          {renderList.map((item) => {
            if (item.kind === 'header') {
              return (
                <div key={`cat-${item.label}`} className="px-1 pt-3 pb-0.5 first:pt-1">
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider font-medium">
                    {item.label}
                  </p>
                </div>
              )
            }

            const { result } = item
            const pct = result.pctDV * 100
            const barWidth = Math.min(pct, 100)
            const barColor = dietBarColor(
              result.pctDV,
              result.behavior,
              result.upperLimit,
              result.rdaTarget,
            )
            const nutrient = nutrientMetaById.get(result.nutrientId)
            // Clickable if it has info card content OR foods are selected (shows distribution)
            const isClickable = !!nutrient?.body_role || hasSelection
            const isSelected = infoNutrient?.nutrient_id === result.nutrientId
            const isHovered = hoverResult?.nutrientId === result.nutrientId
            const hasCap =
              result.behavior === 'limit' || result.behavior === 'normal-with-ul'

            return (
              <div
                key={result.nutrientId}
                className={`flex items-center gap-1.5 px-1 py-0.5 rounded transition-colors ${
                  isClickable ? 'cursor-pointer' : ''
                } ${
                  isSelected
                    ? 'bg-slate-700/60 ring-1 ring-violet-500/40'
                    : isHovered
                      ? 'bg-slate-700/40'
                      : 'hover:bg-slate-700/40'
                }`}
                onMouseEnter={
                  hasSelection
                    ? (e) => showTooltip(result, (e.currentTarget as HTMLElement).getBoundingClientRect())
                    : undefined
                }
                onMouseLeave={hasSelection ? scheduleHide : undefined}
                onMouseDown={
                  isClickable ? (e) => handleRowClick(result, e) : undefined
                }
                title={
                  hasSelection
                    ? `Click to see distribution for ${result.nutrientName}`
                    : nutrient?.body_role
                      ? `Click to learn about ${result.nutrientName}`
                      : undefined
                }
              >
                {/* Name */}
                <div
                  className="flex items-center gap-0.5 flex-shrink-0"
                  style={{ width: 82 }}
                >
                  {hasCap && (
                    <span
                      className="text-amber-400 text-[9px] flex-shrink-0 leading-none"
                      title={
                        result.behavior === 'limit'
                          ? 'Lower is better — daily cap nutrient'
                          : 'Has a recommended upper limit'
                      }
                    >
                      ⚠
                    </span>
                  )}
                  <span
                    className={`truncate text-[10px] ${
                      isClickable ? 'text-slate-200' : 'text-slate-300'
                    }`}
                    title={result.nutrientName}
                  >
                    {abbr(result.nutrientName)}
                  </span>
                  {isClickable && (
                    <span className="text-slate-600 text-[8px] flex-shrink-0 ml-0.5">ⓘ</span>
                  )}
                </div>

                {/* Bar */}
                <div className="flex-1 h-3 bg-slate-700 rounded-sm overflow-hidden relative">
                  <div
                    className="h-full rounded-sm transition-all duration-300"
                    style={{ width: `${barWidth}%`, backgroundColor: barColor }}
                  />
                  <span className="absolute inset-0 flex items-center justify-end pr-1 text-[9px] text-white font-medium leading-none">
                    {pct < 1 ? '<1' : Math.round(pct)}%
                  </span>
                </div>

                {/* Source count badge */}
                <div className="flex-shrink-0 w-6 flex justify-center">
                  <span
                    className={`px-1 py-0.5 rounded text-[9px] font-bold leading-none ${
                      result.sourcesCount === 0
                        ? 'bg-red-500/25 text-red-400'
                        : result.sourcesCount === 1
                          ? 'bg-amber-500/25 text-amber-400'
                          : 'bg-emerald-500/25 text-emerald-400'
                    }`}
                    title={`${result.sourcesCount} food${result.sourcesCount !== 1 ? 's' : ''} contributing ≥5% DV for ${result.nutrientName}`}
                  >
                    {result.sourcesCount}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Hover tooltip — top 3 food sources */}
      {hoverResult && hoverAnchorRect && (
        <SourceTooltip
          sources={topSources}
          anchorRect={hoverAnchorRect}
          nutrientName={hoverResult.nutrientName}
          onAdd={(foodId) => {
            onAddFood(foodId)
            dismissTooltip()
          }}
          onMouseEnter={cancelHide}
          onMouseLeave={scheduleHide}
        />
      )}

      {/* NutrientInfoCard — click-through */}
      {infoNutrient && infoAnchor && (
        <NutrientInfoCard
          nutrient={infoNutrient}
          anchorRect={infoAnchor}
          onClose={() => {
            setInfoNutrient(null)
            setInfoAnchor(null)
            setInfoDietContribs([])
            setInfoDietTotalPctDV(null)
          }}
          meals={[]}
          foodsById={foodsById}
          dietContribs={infoDietContribs}
          dietTotalPctDV={infoDietTotalPctDV ?? undefined}
        />
      )}
    </>
  )
}
