'use client'

import { useState } from 'react'
import type { Meal, MealItem } from '@/types/meals'
import type { FoodRow } from '@/types/nutrition'
import { getPortionSize } from '@/lib/portionSizes'
import FoodPickerModal from './FoodPickerModal'

interface Props {
  meal: Meal
  foods: FoodRow[]
  onChange: (meal: Meal) => void
  onDelete: () => void
  onSaveAsTemplate?: (meal: Meal) => Promise<void>
}

export default function MealCard({ meal, foods, onChange, onDelete, onSaveAsTemplate }: Props) {
  const [showPicker, setShowPicker] = useState(false)
  const [nameEditing, setNameEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedConfirm, setSavedConfirm] = useState(false)

  async function handleSaveAsTemplate() {
    if (!onSaveAsTemplate || saving) return
    setSaving(true)
    try {
      await onSaveAsTemplate(meal)
      setSavedConfirm(true)
      setTimeout(() => setSavedConfirm(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  const totalGrams = meal.items.reduce((sum, item) => sum + item.grams, 0)

  function updateItem(id: string, patch: Partial<MealItem>) {
    const updated = meal.items.map((item) => {
      if (item.id !== id) return item
      const merged = { ...item, ...patch }
      // Keep grams in sync when in servings mode
      if (merged.mode === 'servings') {
        merged.grams = Math.round(merged.servings * merged.portion_grams * 100) / 100
      }
      return merged
    })
    onChange({ ...meal, items: updated })
  }

  function removeItem(id: string) {
    onChange({ ...meal, items: meal.items.filter((i) => i.id !== id) })
  }

  function handleAddFood(food: FoodRow) {
    const portion = getPortionSize(food.food_id)
    const item: MealItem = {
      id: crypto.randomUUID(),
      food_id: food.food_id,
      food_name: food.food_name,
      grams: portion.grams,
      mode: 'servings',
      servings: 1,
      portion_grams: portion.grams,
      portion_label: portion.label,
    }
    onChange({ ...meal, items: [...meal.items, item] })
  }

  return (
    <>
      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
        {/* Meal header */}
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-900/40 border-b border-slate-700">
          {nameEditing ? (
            <input
              autoFocus
              className="flex-1 bg-slate-700 text-slate-100 text-sm font-semibold px-2 py-0.5 rounded border border-slate-500 focus:outline-none focus:border-violet-500 min-w-0"
              value={meal.name}
              onChange={(e) => onChange({ ...meal, name: e.target.value })}
              onBlur={() => setNameEditing(false)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') setNameEditing(false) }}
            />
          ) : (
            <button
              onClick={() => setNameEditing(true)}
              className="flex-1 text-sm font-semibold text-slate-100 hover:text-violet-300 text-left min-w-0"
              title="Click to rename"
            >
              {meal.name}
            </button>
          )}
          {totalGrams > 0 && (
            <span className="text-[11px] text-slate-500 flex-shrink-0">
              {Math.round(totalGrams)}g total
            </span>
          )}
          {onSaveAsTemplate && meal.items.length > 0 && (
            <button
              onClick={handleSaveAsTemplate}
              disabled={saving}
              className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 hover:bg-violet-700 text-slate-400 hover:text-white transition-colors flex-shrink-0 disabled:opacity-50"
              title="Save as reusable meal template"
            >
              {savedConfirm ? '✓ Saved' : saving ? '…' : 'Save template'}
            </button>
          )}
          <button
            onClick={onDelete}
            className="text-slate-500 hover:text-red-400 text-xs leading-none flex-shrink-0 w-5 h-5 flex items-center justify-center"
            title="Remove meal"
          >
            ✕
          </button>
        </div>

        {/* Food items */}
        {meal.items.length === 0 ? (
          <p className="text-slate-600 text-xs text-center py-4">No foods added yet.</p>
        ) : (
          <div className="divide-y divide-slate-700/60">
            {meal.items.map((item) => (
              <div key={item.id} className="flex items-center gap-2 px-3 py-1.5">
                {/* Food name */}
                <span
                  className="text-xs text-slate-200 flex-1 min-w-0 truncate"
                  title={item.food_name}
                >
                  {item.food_name}
                </span>

                {/* Mode toggle: srv | g */}
                <div className="flex rounded overflow-hidden border border-slate-600 flex-shrink-0 text-[10px]">
                  <button
                    onClick={() => updateItem(item.id, { mode: 'servings' })}
                    className={`px-1.5 py-0.5 transition-colors ${
                      item.mode === 'servings'
                        ? 'bg-violet-700 text-white'
                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                    }`}
                  >
                    srv
                  </button>
                  <button
                    onClick={() => updateItem(item.id, { mode: 'grams' })}
                    className={`px-1.5 py-0.5 transition-colors ${
                      item.mode === 'grams'
                        ? 'bg-violet-700 text-white'
                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                    }`}
                  >
                    g
                  </button>
                </div>

                {/* Quantity input */}
                {item.mode === 'servings' ? (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <input
                      type="number"
                      min="0.25"
                      step="0.25"
                      value={item.servings}
                      onChange={(e) => {
                        const s = Math.max(0.25, parseFloat(e.target.value) || 0.25)
                        updateItem(item.id, { servings: s, grams: Math.round(s * item.portion_grams * 100) / 100 })
                      }}
                      className="w-14 bg-slate-700 border border-slate-600 rounded px-1.5 py-0.5 text-xs text-slate-100 text-center focus:outline-none focus:border-violet-500"
                    />
                    <span
                      className="text-[10px] text-slate-400 truncate max-w-[72px]"
                      title={item.portion_label}
                    >
                      {item.portion_label}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={item.grams}
                      onChange={(e) => {
                        const g = Math.max(1, parseInt(e.target.value) || 1)
                        updateItem(item.id, { grams: g })
                      }}
                      className="w-16 bg-slate-700 border border-slate-600 rounded px-1.5 py-0.5 text-xs text-slate-100 text-center focus:outline-none focus:border-violet-500"
                    />
                    <span className="text-[10px] text-slate-400">g</span>
                  </div>
                )}

                {/* Delete item */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-slate-500 hover:text-red-400 text-xs leading-none flex-shrink-0 w-4 h-4 flex items-center justify-center"
                  title="Remove food"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add food */}
        <div className="px-3 py-2 border-t border-slate-700/60">
          <button
            onClick={() => setShowPicker(true)}
            className="w-full text-xs text-violet-400 hover:text-violet-300 border border-dashed border-slate-600 hover:border-violet-500 rounded py-1.5 transition-colors"
          >
            + Add food
          </button>
        </div>
      </div>

      {showPicker && (
        <FoodPickerModal
          foods={foods}
          onAdd={handleAddFood}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  )
}
