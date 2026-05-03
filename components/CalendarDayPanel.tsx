'use client'

import { useState, useMemo } from 'react'
import type { NutrientMeta, FoodRow } from '@/types/nutrition'
import type { Meal, MealItem } from '@/types/meals'
import type { FoodLogEntry, FoodLogItem, FoodLogEntryType } from '@/types/calendar'
import { updateEntryItemGrams, deleteEntry } from '@/lib/foodLogStorage'
import { getPortionSize, getSizeKey } from '@/lib/portionSizes'
import MealNutritionSidebar from './MealNutritionSidebar'
import MealNutritionChart from './MealNutritionChart'
import SizeButtons from './SizeButtons'

interface Props {
  date: string
  entries: FoodLogEntry[]
  nutrients: NutrientMeta[]
  foodsById: Map<number, FoodRow>
  onClose: () => void
  onDayChange: (date: string) => void
  onAddEntry: () => void
  onEntriesChanged: () => void
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function stepDate(dateStr: string, delta: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + delta)
  return d.toISOString().split('T')[0]
}

function logItemToMealItem(item: FoodLogItem): MealItem {
  const p = getPortionSize(item.food_id)
  return {
    id: `${item.food_id}-${item.meal_label ?? 'direct'}`,
    food_id: item.food_id,
    food_name: item.food_name,
    grams: item.amount_g,
    mode: item.mode,
    servings: item.amount_g / p.grams,
    portion_grams: p.grams,
    portion_label: p.label,
  }
}

function entryBadgeClass(type: FoodLogEntryType): string {
  if (type === 'plan') return 'bg-violet-900/50 text-violet-300 border-violet-700/50'
  if (type === 'meal') return 'bg-teal-900/50 text-teal-300 border-teal-700/50'
  return 'bg-amber-900/50 text-amber-300 border-amber-700/50'
}

function itemKey(entryId: string, item: FoodLogItem): string {
  return `${entryId}::${item.food_id}::${item.meal_label ?? ''}`
}

// ── Component ────────────────────────────────────────────────────────────────

export default function CalendarDayPanel({
  date, entries, nutrients, foodsById,
  onClose, onDayChange, onAddEntry, onEntriesChanged,
}: Props) {
  const [chartMode, setChartMode] = useState(false)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState('')
  const [removing, setRemoving] = useState<Set<string>>(new Set())

  // ── Derived data ──────────────────────────────────────────────────────────

  const caloriesId = useMemo(
    () => nutrients.find(n => n.nutrient_name === 'Calories')?.nutrient_id ?? null,
    [nutrients]
  )

  function itemKcal(item: FoodLogItem): number {
    if (caloriesId === null) return 0
    const v = foodsById.get(item.food_id)?.nutrients[caloriesId]
    return v != null ? (v as number) * item.amount_g / 100 : 0
  }

  function entryKcal(entry: FoodLogEntry): number {
    return Math.round(entry.items.reduce((s, item) => s + itemKcal(item), 0))
  }

  const totalKcal = useMemo(
    () => Math.round(entries.flatMap(e => e.items).reduce((s, item) => s + itemKcal(item), 0)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entries, caloriesId, foodsById]
  )

  // Single aggregated meal for the nutrition sidebar / chart
  const dayMeals = useMemo<Meal[]>(() => {
    const allItems = entries.flatMap(e => e.items).map(logItemToMealItem)
    if (allItems.length === 0) return []
    return [{ id: 'day-total', name: 'Day Total', items: allItems }]
  }, [entries])

  const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  // ── Edit grams ────────────────────────────────────────────────────────────

  function handleEditStart(key: string, currentGrams: number) {
    setEditingKey(key)
    setEditingValue(String(currentGrams))
  }

  async function handleEditSave(entryId: string, item: FoodLogItem) {
    const g = parseFloat(editingValue)
    setEditingKey(null)
    if (isNaN(g) || g <= 0) return
    try {
      await updateEntryItemGrams(entryId, item.food_id, item.meal_label, g)
      onEntriesChanged()
    } catch (e) {
      console.error(e)
    }
  }

  // ── Remove entry ──────────────────────────────────────────────────────────

  async function handleRemoveEntry(entryId: string) {
    setRemoving(prev => new Set(prev).add(entryId))
    try {
      await deleteEntry(entryId)
      onEntriesChanged()
    } catch (e) {
      console.error(e)
      setRemoving(prev => { const next = new Set(prev); next.delete(entryId); return next })
    }
  }

  // ── Food item row ─────────────────────────────────────────────────────────

  function FoodItemRow({ item, entryId }: { item: FoodLogItem; entryId: string }) {
    const key = itemKey(entryId, item)
    const isEditing = editingKey === key
    const itemSizes = getPortionSize(item.food_id).sizes ?? null
    const activeKey = itemSizes ? getSizeKey(item.food_id, Math.round(item.amount_g)) : null

    async function handleSizeClick(grams: number) {
      try {
        await updateEntryItemGrams(entryId, item.food_id, item.meal_label, grams)
        onEntriesChanged()
      } catch (e) {
        console.error(e)
      }
    }

    return (
      <div className="flex items-center justify-between pl-4 pr-3 py-1 hover:bg-slate-700/30 group">
        <span className="text-xs text-slate-300 flex-1 min-w-0 truncate pr-2">
          {item.food_name}
        </span>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {itemSizes && (
            <SizeButtons
              sizes={itemSizes}
              activeKey={activeKey}
              onSelect={(_key, variant) => handleSizeClick(variant.grams)}
            />
          )}
          {isEditing ? (
            <input
              type="number"
              value={editingValue}
              onChange={e => setEditingValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter')  { e.preventDefault(); handleEditSave(entryId, item) }
                if (e.key === 'Escape') { setEditingKey(null) }
              }}
              onBlur={() => handleEditSave(entryId, item)}
              autoFocus
              min="1"
              className="w-16 text-xs text-center bg-slate-700 border border-violet-500 rounded px-1.5 py-0.5 text-slate-100 focus:outline-none tabular-nums"
            />
          ) : (
            <button
              onClick={() => handleEditStart(key, item.amount_g)}
              className="text-xs text-slate-500 hover:text-violet-300 px-1.5 py-0.5 rounded hover:bg-slate-700 tabular-nums transition-colors"
              title="Click to edit grams"
            >
              {item.amount_g % 1 === 0 ? item.amount_g : item.amount_g.toFixed(1)}g
            </button>
          )}
          <button
            onClick={() => handleRemoveEntry(entryId)}
            className="text-slate-700 hover:text-red-400 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
            title="Remove this entry"
          >
            ✕
          </button>
        </div>
      </div>
    )
  }

  // ── Entry card ────────────────────────────────────────────────────────────

  function EntryCard({ entry }: { entry: FoodLogEntry }) {
    const isRemoving = removing.has(entry.id)
    const kcal = entryKcal(entry)

    // Group plan items by meal_label for sub-grouped display
    const itemsByLabel = useMemo(() => {
      const groups: Record<string, FoodLogItem[]> = {}
      for (const item of entry.items) {
        const label = item.meal_label ?? 'Other'
        ;(groups[label] ??= []).push(item)
      }
      return groups
    }, [entry.items])

    const mealLabels = Object.keys(itemsByLabel)

    return (
      <div
        className={`rounded-lg border border-slate-700/60 bg-slate-800/40 overflow-hidden transition-opacity ${isRemoving ? 'opacity-40 pointer-events-none' : ''}`}
      >
        {/* Card header */}
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/60 border-b border-slate-700/40">
          <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium flex-shrink-0 ${entryBadgeClass(entry.entry_type)}`}>
            {entry.entry_type}
          </span>
          <span className="text-sm font-medium text-slate-200 flex-1 min-w-0 truncate">
            {entry.label ?? entry.entry_type}
          </span>
          {kcal > 0 && (
            <span className="text-[11px] text-slate-500 flex-shrink-0 tabular-nums">{kcal} kcal</span>
          )}
          <button
            onClick={() => handleRemoveEntry(entry.id)}
            className="w-5 h-5 flex items-center justify-center rounded text-slate-600 hover:text-red-400 hover:bg-slate-700 text-xs transition-colors flex-shrink-0"
            title="Remove this entry"
          >
            ✕
          </button>
        </div>

        {/* Items — food entry: single item directly */}
        {entry.entry_type === 'food' && entry.items.map(item => (
          <FoodItemRow key={item.food_id} item={item} entryId={entry.id} />
        ))}

        {/* Items — meal entry: list all foods */}
        {entry.entry_type === 'meal' && entry.items.map((item, i) => (
          <FoodItemRow key={`${item.food_id}-${i}`} item={item} entryId={entry.id} />
        ))}

        {/* Items — plan entry: group by meal_label */}
        {entry.entry_type === 'plan' && mealLabels.map(label => (
          <div key={label}>
            <div className="px-3 pt-2 pb-0.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              {label}
            </div>
            {itemsByLabel[label].map((item, i) => (
              <FoodItemRow key={`${item.food_id}-${i}`} item={item} entryId={entry.id} />
            ))}
          </div>
        ))}
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="sticky top-4 rounded-xl border border-slate-700 bg-slate-800/60 flex flex-col overflow-hidden"
      style={{ height: 'calc(100vh - 100px)' }}
    >
      {/* Header */}
      <div className="flex-shrink-0 border-b border-slate-700 px-4 py-3">
        <div className="flex items-center gap-1 mb-2">
          <button
            onClick={() => onDayChange(stepDate(date, -1))}
            className="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors text-base"
            aria-label="Previous day"
          >
            ‹
          </button>
          <span className="flex-1 text-sm font-semibold text-slate-200 text-center px-1">
            {formattedDate}
          </span>
          <button
            onClick={() => onDayChange(stepDate(date, 1))}
            className="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors text-base"
            aria-label="Next day"
          >
            ›
          </button>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded text-slate-500 hover:text-slate-300 hover:bg-slate-700 text-sm leading-none ml-1 transition-colors"
            aria-label="Close panel"
          >
            ✕
          </button>
        </div>
        <button
          onClick={onAddEntry}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-dashed border-slate-600 hover:border-violet-500 text-slate-500 hover:text-violet-400 text-xs font-medium transition-colors"
        >
          + Add Entry
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto min-h-0">

        {/* Entry list */}
        <div className="px-3 pt-3 space-y-2">
          {entries.length === 0 ? (
            <p className="text-center text-slate-600 text-sm py-6">
              No entries for this day.
            </p>
          ) : (
            entries.map(entry => <EntryCard key={entry.id} entry={entry} />)
          )}
        </div>

        {/* Day Total */}
        {dayMeals.length > 0 && (
          <div className="px-3 pt-4 pb-3">
            {/* Section header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Day Total
                </span>
                {totalKcal > 0 && (
                  <span className="text-xs text-slate-500 tabular-nums">{totalKcal} kcal</span>
                )}
              </div>
              {/* Sidebar / Chart toggle */}
              <div className="flex overflow-hidden rounded border border-slate-700 text-[11px]">
                <button
                  onClick={() => setChartMode(false)}
                  className={`px-2 py-0.5 transition-colors ${
                    !chartMode ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'
                  }`}
                >
                  ▤
                </button>
                <button
                  onClick={() => setChartMode(true)}
                  className={`px-2 py-0.5 border-l border-slate-700 transition-colors ${
                    chartMode ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'
                  }`}
                >
                  ▦
                </button>
              </div>
            </div>

            {/* Nutrition view */}
            {chartMode ? (
              <MealNutritionChart
                nutrients={nutrients}
                meals={dayMeals}
                foodsById={foodsById}
                rdaProfile={null}
              />
            ) : (
              <MealNutritionSidebar
                nutrients={nutrients}
                meals={dayMeals}
                foodsById={foodsById}
                rdaProfile={null}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
