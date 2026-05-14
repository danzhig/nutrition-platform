import type { FoodRow } from '@/types/nutrition'
import type { DietFood } from '@/lib/dietStorage'
import type { DietNutrientResult, FoodNutrientMap } from '@/lib/dietProfile'
import { RATING_MULTIPLIERS } from '@/lib/dietProfile'
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
 * Uses the normalized weight model: adding a candidate at rating 3 redistributes
 * the dailyWeightG budget proportionally, diluting existing foods and granting
 * the new food its share. Score = net gap reduction / total gap capacity.
 */
export function computeDietSuggestions(
  selectedFoods: DietFood[],
  currentResults: DietNutrientResult[],
  allFoodNutrients: FoodNutrientMap,
  foods: FoodRow[],
  dailyWeightG: number,
): SuggestedFood[] {
  if (currentResults.length === 0) return []

  const selectedFoodIds = new Set(selectedFoods.map((f) => f.foodId))

  const gapNutrients = currentResults.filter((r) => r.pctDV < GAP_THRESHOLD)
  if (gapNutrients.length === 0) return []

  const totalGapCapacity = gapNutrients.reduce(
    (sum, r) => sum + (GAP_THRESHOLD - r.pctDV),
    0,
  )

  // Pre-compute totalRaw for the current selection (needed for normalization)
  let totalRaw = 0
  for (const { foodId, rating } of selectedFoods) {
    totalRaw += getPortionSize(foodId).grams * RATING_MULTIPLIERS[rating]
  }

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

    // Candidate enters at rating 3 (1.0× multiplier = standard serving)
    const rawW_cand = getPortionSize(food.food_id).grams * 1.0
    const newTotalRaw = totalRaw + rawW_cand

    // Scale factor applied to existing foods: their normalized weights shrink
    const scaleFactor = totalRaw > 0 ? totalRaw / newTotalRaw : 0
    // Candidate's share of the daily weight budget
    const candNormW = (rawW_cand / newTotalRaw) * dailyWeightG

    let totalFill = 0
    const nutrientFills: { name: string; fill: number }[] = []

    for (const gap of gapNutrients) {
      const value = foodNutrients[gap.nutrientId]
      if (value === null || value === undefined || value === 0) continue

      // New pctDV after adding the candidate (existing foods diluted + candidate added)
      const candContrib = ((value / 100) * candNormW) / gap.rdaTarget
      const newPctDV = gap.pctDV * scaleFactor + candContrib

      // Net improvement toward the gap threshold (capped at threshold)
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
