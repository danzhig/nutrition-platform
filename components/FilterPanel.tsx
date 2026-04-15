'use client'

import { useState } from 'react'
import type { NutrientCategory } from '@/types/nutrition'

const FOOD_CATEGORIES = [
  'All', 'Fruits', 'Vegetables', 'Leafy Greens', 'Legumes', 'Nuts', 'Seeds',
  'Grains & Cereals', 'Red Meat', 'Poultry', 'Fish & Seafood', 'Eggs',
  'Dairy', 'Dairy Alternatives', 'Oils & Fats', 'Herbs & Spices',
]

// Values must match nutrient_categories.name in the DB exactly
const NUTRIENT_GROUPS: { value: NutrientCategory; label: string }[] = [
  { value: 'All',           label: 'All nutrients' },
  { value: 'Macronutrient', label: 'Macronutrients' },
  { value: 'Vitamin',       label: 'Vitamins' },
  { value: 'Mineral',       label: 'Minerals' },
  { value: 'Fatty Acid',    label: 'Fatty Acids' },
]

interface Props {
  selectedFood: string
  selectedNutrient: NutrientCategory
  search: string
  perServing: boolean
  onFoodChange: (cat: string) => void
  onNutrientChange: (cat: NutrientCategory) => void
  onSearchChange: (s: string) => void
  onPerServingChange: (v: boolean) => void
}

export default function FilterPanel({
  selectedFood,
  selectedNutrient,
  search,
  perServing,
  onFoodChange,
  onNutrientChange,
  onSearchChange,
  onPerServingChange,
}: Props) {
  const [open, setOpen] = useState(false)

  const activeCount = [
    selectedFood !== 'All',
    selectedNutrient !== 'All',
    search.trim() !== '',
    perServing,
  ].filter(Boolean).length

  function resetAll() {
    onFoodChange('All')
    onNutrientChange('All')
    onSearchChange('')
    onPerServingChange(false)
  }

  return (
    <>
      {/* Backdrop — clicking it closes the panel */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Toggle tab — always visible on the left edge */}
      <button
        onClick={() => setOpen((v) => !v)}
        title={open ? 'Close filters' : 'Open filters'}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center justify-center gap-1.5 py-5 px-1.5 bg-slate-700 hover:bg-slate-600 border border-l-0 border-slate-600 rounded-r-xl text-slate-300 hover:text-white transition-colors shadow-lg"
      >
        {/* Hamburger / X icon */}
        <span className="text-base leading-none">{open ? '✕' : '☰'}</span>
        {/* Rotated label */}
        <span className="text-[9px] font-semibold tracking-widest uppercase text-slate-400 [writing-mode:vertical-rl] rotate-180">
          Filters
        </span>
        {/* Active filter badge */}
        {activeCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center shadow">
            {activeCount}
          </span>
        )}
      </button>

      {/* Slide-in panel */}
      <div
        className={`fixed top-0 left-0 h-full w-72 z-50 flex flex-col bg-slate-800 border-r border-slate-700 shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">Filters &amp; Settings</span>
            {activeCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                {activeCount} active
              </span>
            )}
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-slate-700"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">

          {/* ── Search ── */}
          <section>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Search food
            </label>
            <input
              type="search"
              placeholder="e.g. salmon, almond…"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-700 border border-slate-600 text-slate-100 placeholder-slate-400 rounded-lg outline-none focus:ring-2 focus:ring-slate-400"
            />
          </section>

          {/* ── Value mode ── */}
          <section>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Value mode
            </label>
            <button
              onClick={() => onPerServingChange(!perServing)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                perServing
                  ? 'bg-emerald-700 border-emerald-600 text-white'
                  : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 hover:text-white'
              }`}
            >
              <span>{perServing ? 'Per serving' : 'Per 100g'}</span>
              {/* Toggle pill */}
              <span className={`relative inline-block w-8 h-4 rounded-full transition-colors ${perServing ? 'bg-emerald-400' : 'bg-slate-500'}`}>
                <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all duration-200 ${perServing ? 'left-4' : 'left-0.5'}`} />
              </span>
            </button>
            <p className="mt-1.5 text-[10px] text-slate-500">
              {perServing
                ? 'Values scaled to a typical serving size per food.'
                : 'Values shown per 100g of raw food weight.'}
            </p>
          </section>

          {/* ── Food category ── */}
          <section>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Food category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {FOOD_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => onFoodChange(cat)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedFood === cat
                      ? 'bg-slate-100 text-slate-900'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </section>

          {/* ── Nutrient group ── */}
          <section>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Nutrient group
            </label>
            <div className="flex flex-col gap-1.5">
              {NUTRIENT_GROUPS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => onNutrientChange(value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium text-left transition-colors ${
                    selectedNutrient === value
                      ? 'bg-slate-100 text-slate-900'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Reset footer — only shown when filters are active */}
        {activeCount > 0 && (
          <div className="px-4 py-3 border-t border-slate-700 bg-slate-900 shrink-0">
            <button
              onClick={resetAll}
              className="w-full py-2 rounded-lg text-xs font-semibold text-slate-300 bg-slate-700 hover:bg-slate-600 hover:text-white transition-colors"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>
    </>
  )
}
