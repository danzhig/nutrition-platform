/**
 * Diet Evaluator calculation engine.
 *
 * Model: each food's daily contribution = portionSize × (daysPerWeek / 7).
 * No normalization to dailyWeightG — coverage reflects what the person
 * actually eats. The 28-day budget (dailyWeightG × 28) is informational,
 * used only by the monthly fill bar.
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

// ─── Result types ─────────────────────────────────────────────────────────────

/** foodId → nutrientId → value_per_100g (null = data unavailable) */
export type FoodNutrientMap = Record<number, Record<number, number | null>>

export interface DietNutrientResult {
  nutrientId: number
  nutrientName: string
  nutrientCategory: string
  unit: string
  pctDV: number        // total daily contribution / RDA — may exceed 1.0
  sourcesCount: number // foods contributing ≥5% DV at their daily weight
  rdaTarget: number
  behavior: string     // 'normal' | 'limit' | 'normal-with-ul'
  upperLimit?: number
}

/** Per-food monthly gram total (portionSize × daysPerWeek × 4) for the fill bar. */
export interface DietFoodComposition {
  foodId: number
  foodName: string
  monthlyGrams: number
}

// ─── Weighted-average nutrients ──────────────────────────────────────────────
//
// These nutrients are dimensionless indices (not per-100g amounts) and must be
// computed as a weight-proportion-weighted average rather than summed.
export const WEIGHTED_AVERAGE_NUTRIENTS = new Set(['Glycemic Index'])

// ─── Category sort order ──────────────────────────────────────────────────────

const CATEGORY_ORDER = NUTRIENT_GROUP_LIST.map((g) => g.value)

// ─── Main calculation ─────────────────────────────────────────────────────────

/**
 * Compute per-nutrient diet coverage using an absolute daily-average model.
 *
 * Each food's daily gram contribution = portionSize × (daysPerWeek / 7).
 * This equals (portionSize × daysPerWeek × 4) / 28 — the food's share of
 * the 28-day budget averaged back to a single day. Nutrients are summed
 * across all foods from these actual daily weights with no further scaling.
 */
export function computeDietProfile(
  selectedFoods: DietFood[],
  foodNutrients: FoodNutrientMap,
  rdaProfile: RDAProfile,
  nutrients: NutrientMeta[],
  foodNames?: Map<number, string>,
): { results: DietNutrientResult[]; compositions: DietFoodComposition[] } {
  // Daily weight per food — gramsOverride replaces the default portion size when set
  const dailyWeights = new Map<number, number>()
  for (const { foodId, daysPerWeek, gramsOverride } of selectedFoods) {
    const portionG = gramsOverride ?? getPortionSize(foodId).grams
    dailyWeights.set(foodId, portionG * (daysPerWeek / 7))
  }

  // Monthly gram totals for the fill bar
  const compositions: DietFoodComposition[] = selectedFoods.map(({ foodId, daysPerWeek, gramsOverride }) => ({
    foodId,
    foodName: foodNames?.get(foodId) ?? `Food #${foodId}`,
    monthlyGrams: (gramsOverride ?? getPortionSize(foodId).grams) * daysPerWeek * 4,
  }))

  // Nutrient results
  const results: DietNutrientResult[] = []

  for (const nutrient of nutrients) {
    const rawTarget =
      rdaProfile.values[nutrient.nutrient_name] ??
      FOOD_METRIC_TARGETS[nutrient.nutrient_name] ??
      null

    if (rawTarget === null || rawTarget === 0) continue

    const rdaTarget = rawTarget as number
    const behavior = NUTRIENT_BEHAVIORS[nutrient.nutrient_name] ?? 'normal'
    const upperLimit = NUTRIENT_UPPER_LIMITS[nutrient.nutrient_name]

    let pctDV: number
    let sourcesCount: number

    if (WEIGHTED_AVERAGE_NUTRIENTS.has(nutrient.nutrient_name)) {
      // Weighted-average path: diet-level index = Σ(value × dailyW) / Σ(dailyW)
      let numerator = 0
      let denominator = 0
      sourcesCount = 0

      for (const { foodId } of selectedFoods) {
        const foodRow = foodNutrients[foodId]
        if (!foodRow) continue
        const rawValue = foodRow[nutrient.nutrient_id]
        if (rawValue === null || rawValue === undefined) continue

        const dailyW = dailyWeights.get(foodId) ?? 0
        numerator += rawValue * dailyW
        denominator += dailyW
        sourcesCount++
      }

      const weightedAvg = denominator > 0 ? numerator / denominator : 0
      pctDV = weightedAvg / rdaTarget
    } else {
      // Standard summing path
      let totalContrib = 0
      sourcesCount = 0

      for (const { foodId } of selectedFoods) {
        const foodRow = foodNutrients[foodId]
        if (!foodRow) continue

        const rawValue = foodRow[nutrient.nutrient_id]
        const value = rawValue ?? 0
        if (value === 0) continue

        const dailyW = dailyWeights.get(foodId) ?? 0
        const contrib = (value / 100) * dailyW

        totalContrib += contrib
        if (contrib / rdaTarget >= 0.05) sourcesCount++
      }

      pctDV = totalContrib / rdaTarget
    }

    results.push({
      nutrientId: nutrient.nutrient_id,
      nutrientName: nutrient.nutrient_name,
      nutrientCategory: nutrient.nutrient_category,
      unit: nutrient.unit,
      pctDV,
      sourcesCount,
      rdaTarget,
      behavior,
      upperLimit,
    })
  }

  results.sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a.nutrientCategory as typeof CATEGORY_ORDER[number])
    const bi = CATEGORY_ORDER.indexOf(b.nutrientCategory as typeof CATEGORY_ORDER[number])
    return ai - bi
  })

  return { results, compositions }
}
