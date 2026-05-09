/**
 * Diet Evaluator calculation engine.
 */

import type { DietFood } from '@/lib/dietStorage'
import type { NutrientMeta } from '@/types/nutrition'
import type { RDAProfile } from '@/lib/rdaProfiles'
import {
  NUTRIENT_BEHAVIORS,
  NUTRIENT_UPPER_LIMITS,
  FOOD_METRIC_TARGETS,
} from '@/lib/rdaProfiles'
import { getPortionSize } from '@/lib/portionSizes'
import { NUTRIENT_GROUP_LIST } from '@/lib/filterConstants'

// ─── Rating scale ─────────────────────────────────────────────────────────────

export const RATING_MULTIPLIERS: Record<number, number> = {
  1: 0.25,
  2: 0.5,
  3: 1.0,
  4: 1.5,
  5: 2.0,
}

export const RATING_LABELS: Record<number, string> = {
  1: '0.25× serving',
  2: '0.5× serving',
  3: '1× serving',
  4: '1.5× serving',
  5: '2× serving',
}

// ─── Result types ─────────────────────────────────────────────────────────────

/** foodId → nutrientId → value_per_100g (null = data unavailable) */
export type FoodNutrientMap = Record<number, Record<number, number | null>>

export interface DietNutrientResult {
  nutrientId: number
  nutrientName: string
  nutrientCategory: string
  unit: string
  pctDV: number        // raw weighted sum / RDA — may exceed 1.0 (i.e. 100%)
  sourcesCount: number // foods contributing ≥5% DV at their rated portion × multiplier
  rdaTarget: number    // from active RDA profile (or FOOD_METRIC_TARGETS fallback)
  behavior: string     // 'normal' | 'limit' | 'normal-with-ul'
  upperLimit?: number
}

// ─── Category sort order ──────────────────────────────────────────────────────

const CATEGORY_ORDER = NUTRIENT_GROUP_LIST.map((g) => g.value)

// ─── Main calculation ─────────────────────────────────────────────────────────

/**
 * Compute per-nutrient diet coverage for the given food selection.
 *
 * - NULL values in foodNutrients count as 0 (no contribution, no source credit).
 * - sourcesCount uses the rated contribution — if a food contributes ≥5% DV at
 *   its actual rated portion × multiplier, it qualifies as a source.
 * - Nutrients with no RDA target (null in profile and no FOOD_METRIC_TARGETS
 *   fallback) are omitted from results.
 * - Results are sorted by nutrient category in NUTRIENT_GROUP_LIST order.
 */
export function computeDietProfile(
  selectedFoods: DietFood[],
  foodNutrients: FoodNutrientMap,
  rdaProfile: RDAProfile,
  nutrients: NutrientMeta[],
): DietNutrientResult[] {
  const results: DietNutrientResult[] = []

  for (const nutrient of nutrients) {
    // Resolve RDA target — profile value takes precedence; FOOD_METRIC_TARGETS
    // is the fallback for food-metric nutrients (GI, Antioxidant, CoQ10).
    const rawTarget =
      rdaProfile.values[nutrient.nutrient_name] ??
      FOOD_METRIC_TARGETS[nutrient.nutrient_name] ??
      null

    // Skip nutrients with no target — pctDV would be meaningless.
    if (rawTarget === null || rawTarget === 0) continue

    const rdaTarget = rawTarget as number
    const behavior = NUTRIENT_BEHAVIORS[nutrient.nutrient_name] ?? 'normal'
    const upperLimit = NUTRIENT_UPPER_LIMITS[nutrient.nutrient_name]

    let totalContrib = 0
    let sourcesCount = 0

    for (const { foodId, rating } of selectedFoods) {
      const foodRow = foodNutrients[foodId]
      if (!foodRow) continue

      const rawValue = foodRow[nutrient.nutrient_id]
      const value = rawValue ?? 0
      if (value === 0) continue // null or genuine zero — no contribution

      const portionG = getPortionSize(foodId).grams
      const multiplier = RATING_MULTIPLIERS[rating]
      const contrib = (value / 100) * portionG * multiplier

      totalContrib += contrib

      // A food is a "source" if its rated contribution meets the 5% DV threshold.
      if (contrib / rdaTarget >= 0.05) {
        sourcesCount++
      }
    }

    results.push({
      nutrientId: nutrient.nutrient_id,
      nutrientName: nutrient.nutrient_name,
      nutrientCategory: nutrient.nutrient_category,
      unit: nutrient.unit,
      pctDV: totalContrib / rdaTarget,
      sourcesCount,
      rdaTarget,
      behavior,
      upperLimit,
    })
  }

  // Sort by nutrient category in canonical display order.
  results.sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a.nutrientCategory as typeof CATEGORY_ORDER[number])
    const bi = CATEGORY_ORDER.indexOf(b.nutrientCategory as typeof CATEGORY_ORDER[number])
    return ai - bi
  })

  return results
}
