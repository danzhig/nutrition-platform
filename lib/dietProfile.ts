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
  1: 'Rarely (a few times a month)',
  2: 'Sometimes (weekly)',
  3: 'Regularly (a few times a week)',
  4: 'Often (most days)',
  5: 'Staple (daily or more)',
}

// ─── Result types ─────────────────────────────────────────────────────────────

/** foodId → nutrientId → value_per_100g (null = data unavailable) */
export type FoodNutrientMap = Record<number, Record<number, number | null>>

export interface DietNutrientResult {
  nutrientId: number
  nutrientName: string
  nutrientCategory: string
  unit: string
  pctDV: number        // total normalized contribution / RDA — may exceed 1.0
  sourcesCount: number // foods contributing ≥5% DV at their normalized weight
  rdaTarget: number    // from active RDA profile (or FOOD_METRIC_TARGETS fallback)
  behavior: string     // 'normal' | 'limit' | 'normal-with-ul'
  upperLimit?: number
}

/** Per-food proportion of the daily food weight budget (for the composition bar). */
export interface DietFoodComposition {
  foodId: number
  foodName: string
  proportion: number  // 0.0–1.0 fraction of total daily weight
}

// ─── Weighted-average nutrients ──────────────────────────────────────────────
//
// These nutrients are stored as dimensionless indices (not per-100g amounts),
// so they must be computed as a weight-proportion-weighted average across the
// diet rather than summed. Adding more food doesn't change the diet's GI —
// only the composition of the diet changes it.
const WEIGHTED_AVERAGE_NUTRIENTS = new Set(['Glycemic Index'])

// ─── Category sort order ──────────────────────────────────────────────────────

const CATEGORY_ORDER = NUTRIENT_GROUP_LIST.map((g) => g.value)

// ─── Main calculation ─────────────────────────────────────────────────────────

/**
 * Compute per-nutrient diet coverage using a two-pass normalized model.
 *
 * Pass 1: raw weights = portionSize × RATING_MULTIPLIER; sum to totalRawWeight.
 * Pass 2: each food's normalizedWeight = (rawWeight / totalRawWeight) × dailyWeightG.
 *         Nutrient contributions are derived from normalizedWeight, so the total
 *         of all foods always equals dailyWeightG regardless of selection size.
 *
 * Returns both the nutrient results and per-food composition proportions.
 */
export function computeDietProfile(
  selectedFoods: DietFood[],
  foodNutrients: FoodNutrientMap,
  rdaProfile: RDAProfile,
  nutrients: NutrientMeta[],
  foodNames?: Map<number, string>,
): { results: DietNutrientResult[]; compositions: DietFoodComposition[] } {
  const dailyWeightG = rdaProfile.dailyWeightG ?? 1700

  // ── Pass 1: raw weights ──────────────────────────────────────────────────
  const rawWeights = new Map<number, number>()
  let totalRawWeight = 0
  for (const { foodId, rating } of selectedFoods) {
    const portionG = getPortionSize(foodId).grams
    const raw = portionG * RATING_MULTIPLIERS[rating]
    rawWeights.set(foodId, raw)
    totalRawWeight += raw
  }

  // ── Composition proportions (for the stacked bar) ────────────────────────
  const compositions: DietFoodComposition[] = selectedFoods.map(({ foodId }) => ({
    foodId,
    foodName: foodNames?.get(foodId) ?? `Food #${foodId}`,
    proportion: totalRawWeight > 0 ? (rawWeights.get(foodId) ?? 0) / totalRawWeight : 0,
  }))

  // ── Pass 2: nutrient contributions via normalized weights ────────────────
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
      // Weighted-average path: diet-level index = Σ(value × weight) / Σ(weight)
      // Only foods with actual data (non-null, including genuine 0) participate.
      // sourcesCount = how many foods have GI data (quality signal for the average).
      let numerator = 0
      let denominator = 0
      sourcesCount = 0

      for (const { foodId } of selectedFoods) {
        const foodRow = foodNutrients[foodId]
        if (!foodRow) continue
        const rawValue = foodRow[nutrient.nutrient_id]
        if (rawValue === null || rawValue === undefined) continue

        const rawW = rawWeights.get(foodId) ?? 0
        const normalizedW =
          totalRawWeight > 0 ? (rawW / totalRawWeight) * dailyWeightG : 0
        numerator += rawValue * normalizedW
        denominator += normalizedW
        sourcesCount++
      }

      const weightedAvg = denominator > 0 ? numerator / denominator : 0
      pctDV = weightedAvg / rdaTarget
    } else {
      // Standard summing path for genuine per-100g nutrients.
      let totalContrib = 0
      sourcesCount = 0

      for (const { foodId } of selectedFoods) {
        const foodRow = foodNutrients[foodId]
        if (!foodRow) continue

        const rawValue = foodRow[nutrient.nutrient_id]
        const value = rawValue ?? 0
        if (value === 0) continue

        const rawW = rawWeights.get(foodId) ?? 0
        const normalizedW =
          totalRawWeight > 0 ? (rawW / totalRawWeight) * dailyWeightG : 0
        const contrib = (value / 100) * normalizedW

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
