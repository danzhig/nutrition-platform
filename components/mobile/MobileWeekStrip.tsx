'use client'

import type { FoodLogEntry } from '@/types/calendar'
import { toISODate, addDays } from '@/lib/mobileDateUtils'

interface MobileWeekStripProps {
  weekStart: Date
  selectedDate: Date
  onSelectDate: (date: Date) => void
  onPrevWeek: () => void
  onNextWeek: () => void
  entries: Record<string, FoodLogEntry[]>
}

const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export default function MobileWeekStrip({
  weekStart,
  selectedDate,
  onSelectDate,
  onPrevWeek,
  onNextWeek,
  entries,
}: MobileWeekStripProps) {
  const todayStr = toISODate(new Date())
  const selectedStr = toISODate(selectedDate)
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  return (
    <div className="flex items-center gap-1 px-2 py-2">
      <button
        type="button"
        onClick={onPrevWeek}
        className="w-8 h-11 shrink-0 flex items-center justify-center text-slate-400 active:opacity-70 touch-manipulation"
        aria-label="Previous week"
      >
        ‹
      </button>

      <div className="flex-1 grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          const dateStr = toISODate(day)
          const isSelected = dateStr === selectedStr
          const isToday = dateStr === todayStr
          const hasEntries = (entries[dateStr]?.length ?? 0) > 0

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onSelectDate(day)}
              className={`flex flex-col items-center justify-center gap-0.5 rounded-lg min-h-11 py-1.5 touch-manipulation active:opacity-70 ${
                isSelected
                  ? 'ring-2 ring-violet-400'
                  : isToday
                    ? 'bg-violet-600/80'
                    : ''
              }`}
            >
              <span className="text-[10px] text-slate-500">{WEEKDAY_LABELS[i]}</span>
              <span className={`text-sm font-medium ${isSelected || isToday ? 'text-white' : 'text-slate-200'}`}>
                {day.getDate()}
              </span>
              <span className={`w-1 h-1 rounded-full ${hasEntries ? 'bg-violet-400' : 'bg-transparent'}`} />
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={onNextWeek}
        className="w-8 h-11 shrink-0 flex items-center justify-center text-slate-400 active:opacity-70 touch-manipulation"
        aria-label="Next week"
      >
        ›
      </button>
    </div>
  )
}
