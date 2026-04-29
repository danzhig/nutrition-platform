'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAuth } from './AuthProvider'
import CalendarMonthGrid from './CalendarMonthGrid'
import CalendarWeekList from './CalendarWeekList'
import CalendarDayPanel from './CalendarDayPanel'
import CalendarAddModal from './CalendarAddModal'
import type { HeatmapData } from '@/types/nutrition'
import type { FoodLogEntry } from '@/types/calendar'
import { getEntriesForDateRange } from '@/lib/foodLogStorage'

interface Props {
  data: HeatmapData
}

type ViewMode = 'month' | 'week'

const KEYS = {
  view:         'np:calendar:view',
  year:         'np:calendar:year',
  month:        'np:calendar:month',
  selectedDate: 'np:calendar:selected-date',
}

export default function CalendarView({ data }: Props) {
  const { user } = useAuth()
  const today = new Date()

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window === 'undefined') return 'month'
    const s = localStorage.getItem(KEYS.view)
    return s === 'week' ? 'week' : 'month'
  })

  const [year, setYear] = useState<number>(() => {
    if (typeof window === 'undefined') return today.getFullYear()
    const n = parseInt(localStorage.getItem(KEYS.year) ?? '', 10)
    return isNaN(n) ? today.getFullYear() : n
  })

  const [month, setMonth] = useState<number>(() => {
    if (typeof window === 'undefined') return today.getMonth()
    const n = parseInt(localStorage.getItem(KEYS.month) ?? '', 10)
    return isNaN(n) ? today.getMonth() : n
  })

  const [selectedDate, setSelectedDate] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(KEYS.selectedDate)
  })

  const [addTargetDate, setAddTargetDate] = useState<string | null>(null)
  const [entries, setEntries] = useState<FoodLogEntry[]>([])
  const [loading, setLoading] = useState(false)

  // Persist state
  useEffect(() => { localStorage.setItem(KEYS.view, viewMode) }, [viewMode])
  useEffect(() => {
    localStorage.setItem(KEYS.year, String(year))
    localStorage.setItem(KEYS.month, String(month))
  }, [year, month])
  useEffect(() => {
    if (selectedDate) localStorage.setItem(KEYS.selectedDate, selectedDate)
    else localStorage.removeItem(KEYS.selectedDate)
  }, [selectedDate])

  // Food lookup map
  const foodsById = useMemo(() => {
    const map = new Map<number, (typeof data.foods)[number]>()
    for (const f of data.foods) map.set(f.food_id, f)
    return map
  }, [data.foods])

  // Fetch entries — month mode: current month only; week mode: ±120 days from today
  const fetchEntries = useCallback(async () => {
    if (!user) { setEntries([]); return }
    let start: string
    let end: string
    if (viewMode === 'week') {
      const base = new Date()
      const s = new Date(base); s.setDate(base.getDate() - 120)
      const e = new Date(base); e.setDate(base.getDate() + 120)
      start = s.toISOString().split('T')[0]
      end   = e.toISOString().split('T')[0]
    } else {
      const mm = String(month + 1).padStart(2, '0')
      const lastDay = new Date(year, month + 1, 0).getDate()
      start = `${year}-${mm}-01`
      end   = `${year}-${mm}-${String(lastDay).padStart(2, '0')}`
    }
    setLoading(true)
    try {
      setEntries(await getEntriesForDateRange(start, end))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [user, year, month, viewMode])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  // Day selection — handles cross-month navigation from the panel ‹ › arrows
  function handleDaySelect(date: string) {
    setSelectedDate(date)
    const d = new Date(date + 'T00:00:00')
    const newYear  = d.getFullYear()
    const newMonth = d.getMonth()
    if (newYear !== year || newMonth !== month) {
      setYear(newYear)
      setMonth(newMonth)
    }
  }

  function navMonth(delta: number) {
    const d = new Date(year, month + delta, 1)
    setYear(d.getFullYear())
    setMonth(d.getMonth())
  }

  function goToday() {
    setYear(today.getFullYear())
    setMonth(today.getMonth())
  }

  // Entries for the selected date (filtered from month cache)
  const selectedDateEntries = useMemo<FoodLogEntry[]>(() => {
    if (!selectedDate) return []
    return entries.filter(e => e.log_date === selectedDate)
  }, [entries, selectedDate])

  const panelOpen = selectedDate !== null

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-slate-200 font-semibold">Calendar</h2>
        <div className="flex overflow-hidden rounded-lg border border-slate-700 text-sm">
          <button
            onClick={() => setViewMode('month')}
            className={`px-4 py-1.5 font-medium transition-colors ${
              viewMode === 'month'
                ? 'bg-violet-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-4 py-1.5 font-medium transition-colors border-l border-slate-700 ${
              viewMode === 'week'
                ? 'bg-violet-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'
            }`}
          >
            Week
          </button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-4 items-start">

        {/* Calendar column */}
        <div className={panelOpen ? 'w-[65%] flex-shrink-0' : 'w-full'}>
          {viewMode === 'month' && (
            <CalendarMonthGrid
              year={year}
              month={month}
              entries={entries}
              loading={loading}
              selectedDate={selectedDate}
              onDateSelect={handleDaySelect}
              onAddClick={setAddTargetDate}
              onPrevMonth={() => navMonth(-1)}
              onNextMonth={() => navMonth(1)}
              onToday={goToday}
            />
          )}
          {viewMode === 'week' && (
            <CalendarWeekList
              entries={entries}
              nutrients={data.nutrients}
              foodsById={foodsById}
              selectedDate={selectedDate}
              onDateSelect={handleDaySelect}
              onAddClick={setAddTargetDate}
            />
          )}
        </div>

        {/* Day Detail Panel */}
        {panelOpen && (
          <div className="flex-1 min-w-0">
            <CalendarDayPanel
              date={selectedDate}
              entries={selectedDateEntries}
              nutrients={data.nutrients}
              foodsById={foodsById}
              onClose={() => setSelectedDate(null)}
              onDayChange={handleDaySelect}
              onAddEntry={() => setAddTargetDate(selectedDate)}
              onEntriesChanged={fetchEntries}
            />
          </div>
        )}
      </div>

      {/* Add Entry Modal */}
      {addTargetDate && (
        <CalendarAddModal
          targetDate={addTargetDate}
          foods={data.foods}
          nutrients={data.nutrients}
          foodsById={foodsById}
          onClose={() => setAddTargetDate(null)}
          onAdded={() => {
            setAddTargetDate(null)
            fetchEntries()
          }}
        />
      )}
    </div>
  )
}
