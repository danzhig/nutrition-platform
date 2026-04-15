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

const NUTRIENT_CATEGORIES: NutrientCategory[] = [
  'All',
  'Macronutrients',
  'Vitamins',
  'Minerals',
  'Fatty Acids',
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
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
          Food category
        </p>
        <div className="flex flex-wrap gap-1.5">
          {FOOD_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onFoodChange(cat)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedFood === cat
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Nutrient group filter */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
          Nutrient group
        </p>
        <div className="flex flex-wrap gap-1.5">
          {NUTRIENT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onNutrientChange(cat)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedNutrient === cat
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
