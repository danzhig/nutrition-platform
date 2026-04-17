import type { NutrientCategory } from '@/types/nutrition'

export const FOOD_CATEGORY_LIST = [
  'Fruits', 'Vegetables', 'Leafy Greens', 'Legumes', 'Nuts', 'Seeds',
  'Grains & Cereals', 'Red Meat', 'Poultry', 'Fish & Seafood', 'Eggs',
  'Dairy', 'Dairy Alternatives', 'Oils & Fats', 'Herbs & Spices',
  'Supplements',
] as const

export const NUTRIENT_GROUP_LIST: {
  value: NutrientCategory
  label: string
}[] = [
  { value: 'Macronutrient', label: 'Macronutrients' },
  { value: 'Vitamin',       label: 'Vitamins' },
  { value: 'Mineral',       label: 'Minerals' },
  { value: 'Fatty Acid',    label: 'Fatty Acids' },
  { value: 'Amino Acid',    label: 'Amino Acids' },
  { value: 'Food Metric',   label: 'Food Metrics' },
]

export const ALL_NUTRIENT_CATEGORIES: NutrientCategory[] =
  NUTRIENT_GROUP_LIST.map((g) => g.value)
