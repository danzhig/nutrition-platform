'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import type { NutrientMeta, FoodRow } from '@/types/nutrition'
import type { FoodLogEntry, FoodLogEntryType } from '@/types/calendar'

interface Props {
  entries: FoodLogEntry[]
  nutrients: NutrientMeta[]
  foodsById: Map<number, FoodRow>
  selectedDate: string | null
  onDateSelect: (date: string) => void
  onAddClick: (date: string) => void
}

const WEEK_KEY = 'np:calendar:week'
const DAY_ABBREV = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// ── Date helpers ──────────────────────────────────────────────────────────────

function toISO(d: Date): string {
  return d.toISOString().split('T')[0]
}

function getMonday(d: Date): Date {
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const m = new Date(d)
  m.setDate(d.getDate() + diff)
  m.setHours(0, 0, 0, 0)
  return m
}

function shiftWeeks(mondayStr: string, n: number): string {
  const d = new Date(mondayStr + 'T00:00:00')
  d.setDate(d.getDate() + n * 7)
  return toISO(d)
}

function buildWindow(center: string, pastWeeks: number, futureWeeks: number): string[] {
  const weeks: string[] = []
  for (let i = -pastWeeks; i <= futureWeeks; i++) {
    weeks.push(shiftWeeks(center, i))
  }
  return weeks
}

function getWeekDays(mondayStr: string): Date[] {
  const monday = new Date(mondayStr + 'T00:00:00')
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(d.getDate() + i)
    return d
  })
}

// ── Entry styling ─────────────────────────────────────────────────────────────

function entryBorderColor(type: FoodLogEntryType): string {
  if (type === 'plan') return 'border-violet-500/60'
  if (type === 'meal') return 'border-teal-500/60'
  return 'border-amber-500/60'
}

function entryTextColor(type: FoodLogEntryType): string {
  if (type === 'plan') return 'text-violet-300'
  if (type === 'meal') return 'text-teal-300'
  return 'text-amber-300'
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CalendarWeekList({
  entries, nutrients, foodsById, selectedDate, onDateSelect, onAddClick,
}: Props) {
  const todayStr = useMemo(() => toISO(new Date()), [])

  // Anchor: the Monday of the week to scroll to on mount (restored from localStorage)
  const anchorRef = useRef(
    typeof window !== 'undefined'
      ? localStorage.getItem(WEEK_KEY) ?? toISO(getMonday(new Date()))
      : toISO(getMonday(new Date()))
  )

  const [weekStarts, setWeekStarts] = useState<string[]>(() =>
    buildWindow(anchorRef.current, 8, 8)
  )

  // Refs for each week strip (keyed by ISO Monday) and sentinels
  const weekRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const topSentinelRef    = useRef<HTMLDivElement>(null)
  const bottomSentinelRef = useRef<HTMLDivElement>(null)
  const hasScrolledRef    = useRef(false)

  // ── Scroll to anchor on first mount ────────────────────────────────────────
  useEffect(() => {
    if (hasScrolledRef.current) return
    const target = weekRefs.current.get(anchorRef.current)
    if (target) {
      target.scrollIntoView({ behavior: 'instant', block: 'start' })
      hasScrolledRef.current = true
    }
  })

  // ── Save scroll position to localStorage ───────────────────────────────────
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    function onScroll() {
      clearTimeout(timer)
      timer = setTimeout(() => {
        for (const [weekDate, el] of weekRefs.current) {
          const rect = el.getBoundingClientRect()
          if (rect.top >= -20 && rect.top < window.innerHeight * 0.4) {
            localStorage.setItem(WEEK_KEY, weekDate)
            break
          }
        }
      }, 250)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); clearTimeout(timer) }
  }, [])

  // ── IntersectionObserver: extend window at top/bottom ──────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      (observed) => {
        for (const obs of observed) {
          if (!obs.isIntersecting) continue
          if (obs.target === topSentinelRef.current) {
            setWeekStarts(prev => {
              const earliest = prev[0]
              return [...buildWindow(earliest, 4, 0).slice(0, 4), ...prev]
            })
          }
          if (obs.target === bottomSentinelRef.current) {
            setWeekStarts(prev => {
              const latest = prev[prev.length - 1]
              return [...prev, ...buildWindow(latest, 0, 4).slice(1)]
            })
          }
        }
      },
      { rootMargin: '400px' },
    )
    if (topSentinelRef.current)    observer.observe(topSentinelRef.current)
    if (bottomSentinelRef.current) observer.observe(bottomSentinelRef.current)
    return () => observer.disconnect()
  }, [])

  // ── Calorie lookup ─────────────────────────────────────────────────────────
  const caloriesId = useMemo(
    () => nutrients.find(n => n.nutrient_name === 'Calories')?.nutrient_id ?? null,
    [nutrients]
  )

  function sumKcal(dayEntries: FoodLogEntry[]): number {
    if (caloriesId === null) return 0
    return Math.round(
      dayEntries.flatMap(e => e.items).reduce((sum, item) => {
        const v = foodsById.get(item.food_id)?.nutrients[caloriesId]
        return sum + (v != null ? (v as number) * item.amount_g / 100 : 0)
      }, 0)
    )
  }

  // ── Entries by date ────────────────────────────────────────────────────────
  const byDate = useMemo(() => {
    const map = new Map<string, FoodLogEntry[]>()
    for (const e of entries) {
      const arr = map.get(e.log_date) ?? []
      arr.push(e)
      map.set(e.log_date, arr)
    }
    return map
  }, [entries])

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Top sentinel */}
      <div ref={topSentinelRef} className="h-1" />

      {weekStarts.map(weekStart => {
        const weekDays   = getWeekDays(weekStart)
        const weekDate   = new Date(weekStart + 'T00:00:00')
        const weekLabel  = weekDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        const isCurrentWeek = weekStart === toISO(getMonday(new Date()))

        return (
          <div
            key={weekStart}
            ref={el => {
              if (el) weekRefs.current.set(weekStart, el)
              else weekRefs.current.delete(weekStart)
            }}
            className="mb-6"
          >
            {/* Week header */}
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-semibold ${isCurrentWeek ? 'text-violet-300' : 'text-slate-500'}`}>
                Week of {weekLabel}
              </span>
              {isCurrentWeek && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-900/40 text-violet-400 font-medium border border-violet-700/50">
                  current
                </span>
              )}
            </div>

            {/* Day columns */}
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map(dayDate => {
                const dayStr     = toISO(dayDate)
                const dayEntries = byDate.get(dayStr) ?? []
                const kcal       = sumKcal(dayEntries)
                const isToday    = dayStr === todayStr
                const isSelected = dayStr === selectedDate

                return (
                  <div
                    key={dayStr}
                    onClick={() => onDateSelect(dayStr)}
                    className={[
                      'group relative flex flex-col rounded-lg border p-1.5 min-h-[120px] cursor-pointer transition-colors',
                      isSelected
                        ? 'border-violet-500/70 bg-violet-900/20'
                        : 'border-slate-700/40 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/60',
                    ].join(' ')}
                  >
                    {/* Day header: number + abbrev */}
                    <div className="flex items-center justify-between mb-1.5">
                      <div className={[
                        'text-[11px] font-medium w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0',
                        isToday    ? 'bg-violet-500 text-white' :
                        isSelected ? 'text-violet-300' :
                                     'text-slate-400',
                      ].join(' ')}>
                        {dayDate.getDate()}
                      </div>
                      <span className="text-[9px] text-slate-600">
                        {DAY_ABBREV[dayDate.getDay()]}
                      </span>
                    </div>

                    {/* Entry cards */}
                    <div className="flex-1 space-y-1 min-h-0">
                      {dayEntries.map(entry => {
                        const uniqueMealLabels = entry.entry_type === 'plan'
                          ? Array.from(new Set(
                              entry.items
                                .map(i => i.meal_label)
                                .filter((l): l is string => l !== undefined)
                            ))
                          : []
                        const eKcal = Math.round(
                          entry.items.reduce((s, item) => {
                            if (caloriesId === null) return s
                            const v = foodsById.get(item.food_id)?.nutrients[caloriesId]
                            return s + (v != null ? (v as number) * item.amount_g / 100 : 0)
                          }, 0)
                        )
                        return (
                          <div
                            key={entry.id}
                            className={`border-l-2 ${entryBorderColor(entry.entry_type)} pl-1.5 py-0.5 rounded-r bg-slate-800/60`}
                          >
                            <div className="flex items-start gap-0.5">
                              <span className={`text-[10px] leading-tight truncate flex-1 font-medium ${entryTextColor(entry.entry_type)}`}>
                                {entry.label ?? entry.entry_type}
                              </span>
                              {eKcal > 0 && (
                                <span className="text-[9px] text-slate-600 tabular-nums flex-shrink-0 mt-px">
                                  {eKcal}
                                </span>
                              )}
                            </div>
                            {uniqueMealLabels.map(ml => (
                              <div key={ml} className="text-[9px] text-slate-600 truncate leading-tight">
                                {ml}
                              </div>
                            ))}
                          </div>
                        )
                      })}
                    </div>

                    {/* Bottom: day kcal total + add button */}
                    <div className="mt-1.5 pt-1 border-t border-slate-700/30 flex items-center justify-between">
                      {kcal > 0 ? (
                        <span className="text-[9px] text-slate-500 tabular-nums">{kcal} kcal</span>
                      ) : (
                        <span />
                      )}
                      <button
                        onClick={e => { e.stopPropagation(); onAddClick(dayStr) }}
                        className="w-5 h-5 flex items-center justify-center rounded text-slate-700 hover:text-violet-300 hover:bg-slate-700 transition-colors text-sm leading-none"
                        aria-label={`Add entry for ${dayStr}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Bottom sentinel */}
      <div ref={bottomSentinelRef} className="h-1" />
    </div>
  )
}
