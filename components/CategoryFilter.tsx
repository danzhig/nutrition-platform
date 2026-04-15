'use client'

import type { NutrientCategory } from '@/types/nutrition'

const FOOD_CATEGORIES = [
  'All',
  'Fruits',
  'Vegetables',
  'Leafy Greens',
  'Legumes',
  'Nuts',
  'Seeds',
  'Grains & Cereals',
  'Red Meat',
  'Poultry',
  'Fish & Seafood',
  'Eggs',
  'Dairy',
  'Dairy Alternatives',
  'Oils & Fats',
  'Herbs & Spices',
]

// These must match the `name` values in the nutrient_categories table exactly
const NUTRIENT_CATEGORIES: { value: NutrientCategory; label: string }[] = [
  { value: 'All',          label: 'All' },
  { value: 'Macronutrient', label: 'Macros' },
  { value: 'Vitamin',       label: 'Vitamins' },
  { value: 'Mineral',       label: 'Minerals' },
  { value: 'Fatty Acid',    label: 'Fatty Acids' },
]

interface Props {
  selectedFood: string
  selectedNutrient: NutrientCategory
  onFoodChange: (cat: string) => void
  onNutrientChange: (cat: NutrientCategory) => void
}

export default function CategoryFilter({
  selectedFood,
  selectedNutrient,
  onFoodChange,
  onNutrientChange,
}: Props) {
  return (
    <div className="space-y-3">
      {/* Food category filter */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
          Food category
        </p>
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
      </div>

      {/* Nutrient group filter */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
          Nutrient group
        </p>
        <div className="flex flex-wrap gap-1.5">
          {NUTRIENT_CATEGORIES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onNutrientChange(value)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedNutrient === value
                  ? 'bg-slate-100 text-slate-900'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
