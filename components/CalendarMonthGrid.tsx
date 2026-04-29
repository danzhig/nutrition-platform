'use client'

import { useMemo } from 'react'
import type { FoodLogEntry, FoodLogEntryType } from '@/types/calendar'

interface Props {
  year: number
  month: number
  entries: FoodLogEntry[]
  loading: boolean
  selectedDate: string | null
  onDateSelect: (date: string) => void
  onAddClick: (date: string) => void
  onPrevMonth: () => void
  onNextMonth: () => void
  onToday: () => void
}

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
const DAY_HEADERS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function buildGrid(year: number, month: number): (number | null)[] {
  const firstDow = new Date(year, month, 1).getDay() // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = Array(firstDow).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function pillClass(type: FoodLogEntryType): string {
  if (type === 'plan') return 'bg-violet-900/50 border-violet-700/50 text-violet-300'
  if (type === 'meal') return 'bg-teal-900/50 border-teal-700/50 text-teal-300'
  return 'bg-amber-900/50 border-amber-700/50 text-amber-300'
}

export default function CalendarMonthGrid({
  year, month, entries, loading, selectedDate,
  onDateSelect, onAddClick, onPrevMonth, onNextMonth, onToday,
}: Props) {
  const todayStr = useMemo(() => {
    const t = new Date()
    return toDateStr(t.getFullYear(), t.getMonth(), t.getDate())
  }, [])

  const cells = useMemo(() => buildGrid(year, month), [year, month])

  const byDate = useMemo(() => {
    const map: Record<string, FoodLogEntry[]> = {}
    for (const e of entries) {
      ;(map[e.log_date] ??= []).push(e)
    }
    return map
  }, [entries])

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1">
          <button
            onClick={onPrevMonth}
            className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
            aria-label="Previous month"
          >
            ‹
          </button>
          <span className="text-slate-200 font-semibold w-44 text-center text-sm">
            {MONTH_NAMES[month]} {year}
          </span>
          <button
            onClick={onNextMonth}
            className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
            aria-label="Next month"
          >
            ›
          </button>
        </div>
        <div className="flex items-center gap-2">
          {loading && (
            <span className="text-xs text-slate-600">loading…</span>
          )}
          <button
            onClick={onToday}
            className="px-3 py-1 text-xs font-medium rounded border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      {/* Day-of-week header */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_HEADERS.map(d => (
          <div key={d} className="text-center text-[11px] font-medium text-slate-600 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          const ds = day !== null ? toDateStr(year, month, day) : null
          const dayEntries = ds ? (byDate[ds] ?? []) : []
          const isToday    = ds === todayStr
          const isSelected = ds === selectedDate

          return (
            <div
              key={i}
              onClick={() => ds && onDateSelect(ds)}
              className={[
                'group relative min-h-[88px] p-1.5 rounded-lg border transition-colors',
                day !== null ? 'cursor-pointer' : 'pointer-events-none opacity-20',
                isSelected
                  ? 'border-violet-500/70 bg-violet-900/20'
                  : day !== null
                    ? 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/60'
                    : 'border-slate-800/30 bg-slate-800/10',
              ].join(' ')}
            >
              {day !== null && (
                <>
                  {/* Date number */}
                  <div
                    className={[
                      'text-xs font-medium w-5 h-5 flex items-center justify-center rounded-full mb-1.5',
                      isToday
                        ? 'bg-violet-500 text-white'
                        : isSelected
                          ? 'text-violet-300'
                          : 'text-slate-400',
                    ].join(' ')}
                  >
                    {day}
                  </div>

                  {/* Entry pills */}
                  {dayEntries.slice(0, 3).map(e => (
                    <div
                      key={e.id}
                      className={`text-[10px] leading-tight px-1.5 py-0.5 rounded border mb-0.5 truncate ${pillClass(e.entry_type)}`}
                    >
                      {e.label ?? e.entry_type}
                    </div>
                  ))}

                  {/* Overflow indicator */}
                  {dayEntries.length > 3 && (
                    <div className="text-[10px] text-slate-500 px-0.5">
                      +{dayEntries.length - 3} more
                    </div>
                  )}

                  {/* Hover + button */}
                  <button
                    onClick={ev => { ev.stopPropagation(); onAddClick(ds!) }}
                    className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded text-slate-600 hover:text-violet-300 hover:bg-slate-700 opacity-0 group-hover:opacity-100 transition-opacity text-sm leading-none"
                    aria-label={`Add entry for ${ds}`}
                  >
                    +
                  </button>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
