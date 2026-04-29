export type FoodLogEntryType = 'plan' | 'meal' | 'food'

export interface FoodLogItem {
  food_id: number
  food_name: string
  amount_g: number
  mode: 'servings' | 'grams'
  meal_label?: string       // required for plan entries; set to meal name for meal entries; omitted for food entries
}

export interface FoodLogEntry {
  id: string
  user_id: string
  log_date: string          // ISO date 'YYYY-MM-DD'
  entry_type: FoodLogEntryType
  label: string | null      // display name captured at log time; never updated
  items: FoodLogItem[]
  source_id: string | null  // soft ref to meal_plans.id / saved_meals.id / preset_meals.id; NULLed on source deletion
  notes: string | null
  created_at: string
}

export type NewFoodLogEntry = Omit<FoodLogEntry, 'id' | 'user_id' | 'created_at'>
