import type { NutrientMeta, FoodRow } from '@/types/nutrition'
import type { Meal } from '@/types/meals'
import type { RDAProfile } from './rdaProfiles'
import { NUTRIENT_BEHAVIORS } from './rdaProfiles'

// How much each category of penalty can reduce the score.
// Hard (UL nutrients): up to 40 points deducted — meaningful but not catastrophic.
// Soft (limit nutrients): up to 10 points deducted — a mild signal.
const HARD_PENALTY_WEIGHT = 0.40
const SOFT_PENALTY_WEIGHT = 0.10

export function computeComplementScore(
  candidateItems: { food_id: number; grams: number }[],
  currentMeals: Meal[],
  nutrients: NutrientMeta[],
  rdaProfile: RDAProfile,
  foodsById: Map<number, FoodRow>
): number {
  // ── 1. Current plan nutrient totals (per 100g → actual grams) ──────────────
  const currentTotals: Record<number, number> = {}
  for (const meal of currentMeals) {
    for (const item of meal.items) {
      const food = foodsById.get(item.food_id)
      if (!food) continue
      const mult = item.grams / 100
      for (const [idStr, val] of Object.entries(food.nutrients)) {
        if (val == null) continue
        const nId = Number(idStr)
        currentTotals[nId] = (currentTotals[nId] ?? 0) + val * mult
      }
    }
  }

  // ── 2. Candidate meal nutrient totals ─────────────────────────────────────
  const candidateTotals: Record<number, number> = {}
  for (const item of candidateItems) {
    if (!item.food_id) continue
    const food = foodsById.get(item.food_id)
    if (!food) continue
    const mult = item.grams / 100
    for (const [idStr, val] of Object.entries(food.nutrients)) {
      if (val == null) continue
      const nId = Number(idStr)
      candidateTotals[nId] = (candidateTotals[nId] ?? 0) + val * mult
    }
  }

  // ── 3. Score per nutrient ──────────────────────────────────────────────────
  let totalBenefit     = 0
  let totalHardPenalty = 0
  let totalSoftPenalty = 0
  let nWithGap = 0  // nutrients currently below 100% DV (benefit denominator)
  let nHard    = 0  // normal-with-ul nutrients with an RDA (penalty denominator)
  let nSoft    = 0  // limit nutrients with an RDA (penalty denominator)

  for (const nutrient of nutrients) {
    const rda = rdaProfile.values[nutrient.nutrient_name]
    if (!rda || rda <= 0) continue  // no target → skip

    const behavior = NUTRIENT_BEHAVIORS[nutrient.nutrient_name] ?? 'normal'
    const nId = nutrient.nutrient_id

    const currentPct = ((currentTotals[nId] ?? 0) / rda) * 100
    const addedPct   = ((candidateTotals[nId] ?? 0) / rda) * 100
    const newPct     = currentPct + addedPct

    // BENEFIT — only for nutrients where more is better
    if (behavior === 'normal' || behavior === 'normal-with-ul') {
      const gap  = Math.max(0, 100 - currentPct)       // % points still needed
      const fill = Math.min(addedPct, gap) / 100        // 0..1 (capped at gap)
      totalBenefit += fill
      if (gap > 0) nWithGap++
    }

    // HARD PENALTY — for UL nutrients pushed past 150% DV
    // 0–150% is considered safe; penalty grows smoothly from 150% to 250%
    if (behavior === 'normal-with-ul') {
      nHard++
      if (newPct > 150) {
        totalHardPenalty += Math.min((newPct - 150) / 100, 1)
      }
    }

    // SOFT PENALTY — for limit nutrients (sodium, sat fat, sugars, etc.)
    if (behavior === 'limit') {
      nSoft++
      totalSoftPenalty += Math.min(addedPct / 100, 1)
    }
  }

  // ── 4. Normalize each component to 0..1 ───────────────────────────────────
  const benefitScore = nWithGap > 0 ? totalBenefit / nWithGap : 0
  const hardScore    = nHard   > 0 ? totalHardPenalty / nHard : 0
  const softScore    = nSoft   > 0 ? totalSoftPenalty / nSoft : 0

  // ── 5. Combine and clamp to 0-100 ─────────────────────────────────────────
  const raw = benefitScore
    - HARD_PENALTY_WEIGHT * hardScore
    - SOFT_PENALTY_WEIGHT * softScore

  return Math.max(0, Math.min(100, Math.round(raw * 100)))
}
