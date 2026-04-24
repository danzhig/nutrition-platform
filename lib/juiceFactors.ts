import type { NutrientMeta } from '@/types/nutrition'

/**
 * Cold-press juicing retention factors.
 * Represents the fraction of each nutrient that passes into the juice.
 * The remainder stays in the pulp/refuse.
 *
 * Rationale:
 * - Fiber: nearly all insoluble fiber is left in pulp; ~10% (soluble) passes through
 * - Protein / Amino Acids: cellular proteins mostly stay in pulp
 * - Fat / Fatty Acids: lipids largely stay in cell membranes / pulp
 * - Sugars / Net Carbs: water-soluble sugars pass through well
 * - Vitamins (water-soluble esp.): pass through well; minor losses
 * - Minerals: mostly pass through
 */

const FACTORS_BY_NAME: Record<string, number> = {
  // Macronutrients
  'Calories': 0.70,
  'Protein': 0.25,
  'Dietary Fibre': 0.10,
  'Net Carbohydrates': 0.90,
  'Total Sugars': 0.90,
  'Total Fat': 0.50,
  'Saturated Fat': 0.50,
  'Monounsaturated Fat': 0.50,
  'Polyunsaturated Fat': 0.50,
  'Cholesterol': 0.50,
  // GI is a ratio property — not a quantity left behind in pulp
  'Glycemic Index': 1.0,
}

const FACTORS_BY_CATEGORY: Record<string, number> = {
  'Amino Acid': 0.25,   // follow protein
  'Fatty Acid': 0.50,   // follow fat
  'Vitamin': 0.85,
  'Mineral': 0.85,
  'Macronutrient': 0.80,
  'Food Metric': 0.90,
}

const DEFAULT_FACTOR = 0.85

export function getJuiceFactor(nutrientName: string, nutrientCategory: string): number {
  if (Object.prototype.hasOwnProperty.call(FACTORS_BY_NAME, nutrientName)) {
    return FACTORS_BY_NAME[nutrientName]
  }
  return FACTORS_BY_CATEGORY[nutrientCategory] ?? DEFAULT_FACTOR
}

export function buildJuiceFactorMap(nutrients: NutrientMeta[]): Map<number, number> {
  const m = new Map<number, number>()
  for (const n of nutrients) {
    m.set(n.nutrient_id, getJuiceFactor(n.nutrient_name, n.nutrient_category))
  }
  return m
}
