'use client'

import { useState } from 'react'
import type { NutrientCategory } from '@/types/nutrition'
import {
  FOOD_CATEGORY_LIST,
  NUTRIENT_GROUP_LIST,
  ALL_NUTRIENT_CATEGORIES,
} from '@/lib/filterConstants'

interface Props {
  selectedFoods: string[]
  selectedNutrients: NutrientCategory[]
  search: string
  perServing: boolean
  onFoodsChange: (cats: string[]) => void
  onNutrientsChange: (cats: NutrientCategory[]) => void
  onSearchChange: (s: string) => void
  onPerServingChange: (v: boolean) => void
}

export default function FilterPanel({
  selectedFoods,
  selectedNutrients,
  search,
  perServing,
  onFoodsChange,
  onNutrientsChange,
  onSearchChange,
  onPerServingChange,
}: Props) {
  const [open, setOpen] = useState(false)

  const allFoods = FOOD_CATEGORY_LIST.length
  const allNutrients = ALL_NUTRIENT_CATEGORIES.length

  const foodsFiltered    = selectedFoods.length < allFoods
  const nutrientsFiltered = selectedNutrients.length < allNutrients

  const activeCount = [
    search.trim() !== '',
    perServing,
    foodsFiltered,
    nutrientsFiltered,
  ].filter(Boolean).length

  function toggleFood(cat: string) {
    if (selectedFoods.includes(cat)) {
      // Never allow zero selected — keep at least one
      if (selectedFoods.length === 1) return
      onFoodsChange(selectedFoods.filter((c) => c !== cat))
    } else {
      onFoodsChange([...selectedFoods, cat])
    }
  }

  function toggleNutrient(cat: NutrientCategory) {
    if (selectedNutrients.includes(cat)) {
      if (selectedNutrients.length === 1) return
      onNutrientsChange(selectedNutrients.filter((c) => c !== cat))
    } else {
      onNutrientsChange([...selectedNutrients, cat])
    }
  }

  function resetAll() {
    onFoodsChange([...FOOD_CATEGORY_LIST])
    onNutrientsChange([...ALL_NUTRIENT_CATEGORIES])
    onSearchChange('')
    onPerServingChange(false)
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Toggle tab — always visible on left edge */}
      <button
        onClick={() => setOpen((v) => !v)}
        title={open ? 'Close filters' : 'Open filters'}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center justify-center gap-1.5 py-5 px-1.5 bg-slate-700 hover:bg-slate-600 border border-l-0 border-slate-600 rounded-r-xl text-slate-300 hover:text-white transition-colors shadow-lg"
      >
        <span className="text-base leading-none">{open ? '✕' : '☰'}</span>
        <span className="text-[9px] font-semibold tracking-widest uppercase text-slate-400 [writing-mode:vertical-rl] rotate-180">
          Filters
        </span>
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
        {/* Header */}
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
              <span className={`relative inline-block w-8 h-4 rounded-full transition-colors ${perServing ? 'bg-emerald-400' : 'bg-slate-500'}`}>
                <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all duration-200 ${perServing ? 'left-4' : 'left-0.5'}`} />
              </span>
            </button>
            <p className="mt-1.5 text-[10px] text-slate-500">
              {perServing ? 'Values scaled to a typical serving size per food.' : 'Values shown per 100g of raw food weight.'}
            </p>
          </section>

          {/* ── Food category ── */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Food category
              </label>
              <span className="text-[10px] text-slate-500">
                {selectedFoods.length}/{allFoods}
              </span>
            </div>
            {/* Select all / Deselect all */}
            <div className="flex gap-2 mb-2">
              <button
                onClick={() => onFoodsChange([...FOOD_CATEGORY_LIST])}
                disabled={selectedFoods.length === allFoods}
                className="flex-1 py-1 text-[10px] font-medium rounded bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Select all
              </button>
              <button
                onClick={() => onFoodsChange([FOOD_CATEGORY_LIST[0]])}
                disabled={selectedFoods.length === 1}
                className="flex-1 py-1 text-[10px] font-medium rounded bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Deselect all
              </button>
            </div>
            {/* Category pills */}
            <div className="flex flex-wrap gap-1.5">
              {FOOD_CATEGORY_LIST.map((cat) => {
                const active = selectedFoods.includes(cat)
                return (
                  <button
                    key={cat}
                    onClick={() => toggleFood(cat)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      active
                        ? 'bg-slate-100 text-slate-900'
                        : 'bg-slate-700 text-slate-500 hover:bg-slate-600 hover:text-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                )
              })}
            </div>
          </section>

          {/* ── Nutrient group ── */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Nutrient group
              </label>
              <span className="text-[10px] text-slate-500">
                {selectedNutrients.length}/{allNutrients}
              </span>
            </div>
            {/* Select all / Deselect all */}
            <div className="flex gap-2 mb-2">
              <button
                onClick={() => onNutrientsChange([...ALL_NUTRIENT_CATEGORIES])}
                disabled={selectedNutrients.length === allNutrients}
                className="flex-1 py-1 text-[10px] font-medium rounded bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Select all
              </button>
              <button
                onClick={() => onNutrientsChange([ALL_NUTRIENT_CATEGORIES[0]])}
                disabled={selectedNutrients.length === 1}
                className="flex-1 py-1 text-[10px] font-medium rounded bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Deselect all
              </button>
            </div>
            {/* Group buttons */}
            <div className="flex flex-col gap-1.5">
              {NUTRIENT_GROUP_LIST.map(({ value, label }) => {
                const active = selectedNutrients.includes(value)
                return (
                  <button
                    key={value}
                    onClick={() => toggleNutrient(value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium text-left transition-colors ${
                      active
                        ? 'bg-slate-100 text-slate-900'
                        : 'bg-slate-700 text-slate-500 hover:bg-slate-600 hover:text-slate-300'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </section>
        </div>

        {/* Reset footer */}
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
