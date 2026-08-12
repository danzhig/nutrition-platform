'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { AppData, FoodRow } from '@/types/nutrition'
import type { FoodLogEntry } from '@/types/calendar'
import type { RDAProfile } from '@/lib/rdaProfiles'
import { getEntriesForDateRange } from '@/lib/foodLogStorage'
import { toISODate, fromISODate, addDays, mondayOf } from '@/lib/mobileDateUtils'
import MobileWeekStrip from './MobileWeekStrip'
import MobileDayLog from './MobileDayLog'
import MobileAddSheet from './MobileAddSheet'

const LS_DATE = 'np:m:cal-date'

interface MobileCalendarScreenProps {
  appData: AppData
  rdaProfile: RDAProfile | null
  userId: string | null
  onOpenNutrientSheet: (nutrientName: string) => void
  onStreakChange?: (streak: number) => void
}

export default function MobileCalendarScreen({
  appData,
  rdaProfile,
  userId,
  onOpenNutrientSheet,
  onStreakChange,
}: MobileCalendarScreenProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date())
  const [weekStart, setWeekStart] = useState<Date>(() => mondayOf(new Date()))
  const [entriesByDate, setEntriesByDate] = useState<Record<string, FoodLogEntry[]>>({})
  const [addSheetOpen, setAddSheetOpen] = useState(false)
  const loadedRange = useRef<{ start: string; end: string } | null>(null)

  const foodsById = useMemo(() => {
    const map = new Map<number, FoodRow>()
    for (const f of appData.foods) map.set(f.food_id, f)
    return map
  }, [appData.foods])

  // Restore last-viewed date after mount (avoids SSR hydration mismatch).
  useEffect(() => {
    const saved = localStorage.getItem(LS_DATE)
    if (saved) {
      const d = fromISODate(saved)
      setSelectedDate(d)
      setWeekStart(mondayOf(d))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(LS_DATE, toISODate(selectedDate))
  }, [selectedDate])

  async function loadRange(startISO: string, endISO: string) {
    if (!userId) {
      setEntriesByDate({})
      loadedRange.current = { start: startISO, end: endISO }
      return
    }
    try {
      const entries = await getEntriesForDateRange(startISO, endISO)
      const grouped: Record<string, FoodLogEntry[]> = {}
      for (const entry of entries) {
        ;(grouped[entry.log_date] ??= []).push(entry)
      }
      setEntriesByDate(grouped)
      loadedRange.current = { start: startISO, end: endISO }
    } catch (err) {
      console.error(err)
    }
  }

  // Initial load: -30d..+14d around today covers both the day log (Ph-5a)
  // and the 30-day streak lookback (Ph-5b) in a single fetch.
  useEffect(() => {
    const today = new Date()
    loadRange(toISODate(addDays(today, -30)), toISODate(addDays(today, 14)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  function ensureRangeLoaded(start: Date, end: Date) {
    const startISO = toISODate(start)
    const endISO = toISODate(end)
    const loaded = loadedRange.current
    if (loaded && startISO >= loaded.start && endISO <= loaded.end) return
    const mergedStart = loaded && loaded.start < startISO ? loaded.start : startISO
    const mergedEnd = loaded && loaded.end > endISO ? loaded.end : endISO
    loadRange(mergedStart, mergedEnd)
  }

  function handlePrevWeek() {
    const next = addDays(weekStart, -7)
    setWeekStart(next)
    ensureRangeLoaded(next, addDays(next, 6))
  }

  function handleNextWeek() {
    const next = addDays(weekStart, 7)
    setWeekStart(next)
    ensureRangeLoaded(next, addDays(next, 6))
  }

  function handleSelectDate(date: Date) {
    setSelectedDate(date)
  }

  // Streak: consecutive logged days ending yesterday, plus today if it has
  // an entry. Starting at today (rather than yesterday) would reset the
  // streak to 0 every midnight before the user has a chance to log.
  const streak = useMemo(() => {
    const today = new Date()
    let count = 0
    let cursor = addDays(today, -1)
    while (entriesByDate[toISODate(cursor)]?.length) {
      count++
      cursor = addDays(cursor, -1)
    }
    if (entriesByDate[toISODate(today)]?.length) count++
    return count
  }, [entriesByDate])

  useEffect(() => {
    onStreakChange?.(streak)
  }, [streak, onStreakChange])

  function handleEntriesChanged() {
    const loaded = loadedRange.current
    if (loaded) loadRange(loaded.start, loaded.end)
  }

  const selectedEntries = entriesByDate[toISODate(selectedDate)] ?? []

  return (
    <div className="flex flex-col">
      <MobileWeekStrip
        weekStart={weekStart}
        selectedDate={selectedDate}
        onSelectDate={handleSelectDate}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
        entries={entriesByDate}
      />
      <MobileDayLog
        entries={selectedEntries}
        nutrients={appData.nutrients}
        foodsById={foodsById}
        rdaProfile={rdaProfile}
        onOpenAddSheet={() => setAddSheetOpen(true)}
        onOpenNutrientSheet={onOpenNutrientSheet}
      />
      <MobileAddSheet
        open={addSheetOpen}
        onClose={() => setAddSheetOpen(false)}
        selectedDate={toISODate(selectedDate)}
        appData={appData}
        userId={userId}
        currentDayEntries={selectedEntries}
        rdaProfile={rdaProfile}
        onEntriesChanged={handleEntriesChanged}
      />
    </div>
  )
}
