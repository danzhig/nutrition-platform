// One row as returned by the heatmap query
export interface HeatmapRow {
  food_id: number
  food_name: string
  category: string
  nutrient_id: number
  nutrient_name: string
  unit: string
  nutrient_category: string
  value_per_100g: number | null
}

// After reshaping: one food with all its nutrient values
export interface FoodRow {
  food_id: number
  food_name: string
  category: string
  nutrients: Record<number, number | null> // nutrient_id → value
}

// Nutrient column metadata
export interface NutrientMeta {
  nutrient_id: number
  nutrient_name: string
  unit: string
  nutrient_category: string
}

// Fully shaped data ready for the heatmap component
export interface HeatmapData {
  foods: FoodRow[]
  nutrients: NutrientMeta[]
  // Per-nutrient min/max for colour normalisation
  columnRanges: Record<number, { min: number; max: number }>
}

export type NutrientCategory = 'All' | 'Macronutrients' | 'Vitamins' | 'Minerals' | 'Fatty Acids'
