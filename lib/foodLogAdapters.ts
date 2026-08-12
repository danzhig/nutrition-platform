import type { MealItem } from '@/types/meals'
import type { FoodLogItem } from '@/types/calendar'
import { getPortionSize } from '@/lib/portionSizes'

/**
 * Converts a food_log item into the MealItem shape used by the nutrition
 * sidebar/chart/donut/radar components. `amount_g` (log storage) and
 * `grams` (meal-planner working type) are the same quantity — this is the
 * only place that should know that.
 */
export function logItemToMealItem(item: FoodLogItem): MealItem {
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
