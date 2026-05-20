import type { FoodRow } from '@/types/nutrition'
import type { DietFood } from '@/lib/dietStorage'
import type { DietNutrientResult, FoodNutrientMap } from '@/lib/dietProfile'
import { getPortionSize } from '@/lib/portionSizes'

export interface SuggestedFood {
  foodId: number
  foodName: string
  category: string
  topGapNutrients: string[]  // names of the top 3 gap nutrients this food most improves
}

const GAP_THRESHOLD = 0.70  // pctDV ratio — must match DietNutrientPanel

/**
 * Rank all foods not in the user's diet list by how much they would improve
 * the current nutrient gaps (pctDV < 70%), and return the top 10.
 *
 * Uses the absolute daily-weight model: the candidate enters at 4 days/week,
 * contributing portionSize × (4/7) grams/day. Adding a food is purely additive —
 * existing foods' daily contributions are unchanged (no normalization dilution).
 */
export function computeDietSuggestions(
  selectedFoods: DietFood[],
  currentResults: DietNutrientResult[],
  allFoodNutrients: FoodNutrientMap,
  foods: FoodRow[],
): SuggestedFood[] {
  if (currentResults.length === 0) return []

  const selectedFoodIds = new Set(selectedFoods.map((f) => f.foodId))

  const gapNutrients = currentResults.filter((r) => r.pctDV < GAP_THRESHOLD)
  if (gapNutrients.length === 0) return []

  const totalGapCapacity = gapNutrients.reduce(
    (sum, r) => sum + (GAP_THRESHOLD - r.pctDV),
    0,
  )

  // Candidate enters at 4 days/week — a reasonable default frequency
  const CANDIDATE_DAYS_PER_WEEK = 4

  const scored: {
    foodId: number
    foodName: string
    category: string
    score: number
    topNutrients: string[]
  }[] = []

  for (const food of foods) {
    if (selectedFoodIds.has(food.food_id)) continue

    const foodNutrients = allFoodNutrients[food.food_id]
    if (!foodNutrients) continue

    const candDailyW = getPortionSize(food.food_id).grams * (CANDIDATE_DAYS_PER_WEEK / 7)

    let totalFill = 0
    const nutrientFills: { name: string; fill: number }[] = []

    for (const gap of gapNutrients) {
      const value = foodNutrients[gap.nutrientId]
      if (value === null || value === undefined || value === 0) continue

      // Adding the candidate is purely additive — no dilution of existing foods
      const candContrib = ((value / 100) * candDailyW) / gap.rdaTarget
      const newPctDV = gap.pctDV + candContrib

      const fill = Math.min(newPctDV, GAP_THRESHOLD) - gap.pctDV

      if (fill > 0.001) {
        totalFill += fill
        nutrientFills.push({ name: gap.nutrientName, fill })
      }
    }

    if (totalFill === 0) continue

    const score = totalGapCapacity > 0 ? totalFill / totalGapCapacity : 0

    nutrientFills.sort((a, b) => b.fill - a.fill)
    const topNutrients = nutrientFills.slice(0, 3).map((n) => n.name)

    scored.push({
      foodId: food.food_id,
      foodName: food.food_name,
      category: food.category,
      score,
      topNutrients,
    })
  }

  scored.sort((a, b) => b.score - a.score)

  return scored.slice(0, 10).map(({ foodId, foodName, category, topNutrients }) => ({
    foodId,
    foodName,
    category,
    topGapNutrients: topNutrients,
  }))
}
