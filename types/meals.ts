/**
 * Meal planner domain types.
 * These are the in-memory working types — what the UI works with.
 * Stored in Supabase as JSON in the meal_plans.meals column.
 */

export interface MealItem {
  id: string             // client-generated (crypto.randomUUID) — React key only
  food_id: number
  food_name: string
  grams: number          // computed: the value used for nutrition calculation
  mode: 'servings' | 'grams'
  servings: number       // number of portions (only meaningful when mode='servings')
  portion_grams: number  // reference serving size for this food
  portion_label: string  // e.g. "1 breast", "1 cup"
}

export interface Meal {
  id: string             // client-generated
  name: string
  items: MealItem[]
  isJuice?: boolean      // true = apply cold-press juice nutrient reduction factors
}

/**
 * The working copy in the planner.
 * id is null for a new plan that hasn't been saved yet.
 */
export interface ActiveMealPlan {
  id: string | null
  name: string
  meals: Meal[]
  /**
   * Which DV profile to compare against.
   * '' = none | ProfileId = built-in | 'saved:uuid' = user-saved custom profile
   */
  rda_selection: string
}
