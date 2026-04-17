import type { NutrientBehavior } from './rdaProfiles'

/**
 * Color scale for % Daily Value mode.
 *
 * pct      — (value / rdaTarget) × 100
 * behavior — how to interpret excess
 * ulPct    — (upperLimit / rdaTarget) × 100  [only for 'normal-with-ul']
 *
 * 'normal':
 *   0 %      → deep red
 *   50 %     → orange
 *   85–115 % → green (sweet spot)
 *   >115 %   → fading green (fine, no concern)
 *
 * 'limit' (sat fat, sodium, etc. — lower is better):
 *   0–60 %   → green (well under limit)
 *   60–90 %  → yellow-green
 *   90–110 % → orange (approaching / at limit)
 *   >110 %   → red (over limit)
 *
 * 'normal-with-ul' (iron, zinc, vit A, etc.):
 *   Same as 'normal' up to ~110 %
 *   110 % → UL × 0.65 : lighter green (excess but not yet concerning)
 *   UL × 0.65 → UL    : amber warning
 *   > UL               : red (dangerous excess)
 */
export function rdaCellColor(
  pct: number | null,
  behavior: NutrientBehavior = 'normal',
  ulPct?: number
): string {
  if (pct === null) return '#1e293b'

  if (behavior === 'limit') return limitColor(pct)

  if (behavior === 'normal-with-ul' && ulPct != null && pct > 110) {
    const safeEnd  = Math.max(140, ulPct * 0.65)
    const warnEnd  = ulPct
    const dangerEnd = ulPct * 1.8

    if (pct <= safeEnd) {
      // Slightly faded green — excess but within safe range
      const t = Math.min(1, (pct - 110) / (safeEnd - 110))
      return `hsl(142, ${Math.round(65 - t * 25)}%, ${Math.round(32 + t * 2)}%)`
    }
    if (pct <= warnEnd) {
      // Green → amber — approaching UL
      const t = (pct - safeEnd) / (warnEnd - safeEnd)
      const hue  = Math.round(142 - t * 110)  // 142 → 32
      const sat  = Math.round(40 + t * 50)
      const lgt  = Math.round(34 + t * 8)
      return `hsl(${hue}, ${sat}%, ${lgt}%)`
    }
    // Over UL → red, deepening
    const t = Math.min(1, (pct - warnEnd) / Math.max(1, dangerEnd - warnEnd))
    const hue = Math.round(32 - t * 32)
    return `hsl(${hue}, ${Math.round(80 + t * 8)}%, ${Math.round(40 - t * 8)}%)`
  }

  return normalAscending(pct)
}

function normalAscending(pct: number): string {
  if (pct <= 0) return 'hsl(0, 75%, 40%)'

  if (pct < 25) {
    // 0–25 %: deep red — poor contribution from this food
    const t = pct / 25
    return `hsl(${Math.round(t * 10)}, 74%, ${Math.round(40 + t * 3)}%)`
  }

  if (pct < 40) {
    // 25–40 %: red → orange
    const t = (pct - 25) / 15
    return `hsl(${Math.round(10 + t * 37)}, ${Math.round(74 + t * 5)}%, ${Math.round(43 + t * 4)}%)`
  }

  if (pct < 50) {
    // 40–50 %: orange → green transition — fully green by 50%
    const t = (pct - 40) / 10
    return `hsl(${Math.round(47 + t * 95)}, ${Math.round(79 - t * 12)}%, ${Math.round(47 - t * 16)}%)`
  }

  // 50 %+: green zone — good contribution from a single food
  if (pct <= 150) {
    // Richer green as you approach and pass 100 %
    const proximity = Math.max(0, 1 - Math.abs(pct - 100) / 80)
    return `hsl(142, ${Math.round(62 + proximity * 14)}%, ${Math.round(35 - proximity * 5)}%)`
  }

  // Over 150 %: slowly fade (excellent, just a lot)
  const fade = Math.min(1, (pct - 150) / 250)
  return `hsl(142, ${Math.round(74 - fade * 35)}%, ${Math.round(31 + fade * 6)}%)`
}

function limitColor(pct: number): string {
  if (pct <= 0) return 'hsl(142, 72%, 28%)'

  if (pct <= 60) {
    const t = pct / 60
    return `hsl(142, ${Math.round(72 - t * 20)}%, ${Math.round(28 + t * 4)}%)`
  }

  if (pct <= 90) {
    const t = (pct - 60) / 30
    const hue = Math.round(142 - t * 85)  // green → yellow (57)
    return `hsl(${hue}, ${Math.round(52 + t * 20)}%, ${Math.round(32 + t * 10)}%)`
  }

  if (pct <= 115) {
    const t = (pct - 90) / 25
    const hue = Math.round(57 - t * 40)   // yellow → orange (17)
    return `hsl(${hue}, ${Math.round(72 + t * 8)}%, ${Math.round(42 - t * 4)}%)`
  }

  // Over limit
  const t = Math.min(1, (pct - 115) / 70)
  return `hsl(${Math.round(17 - t * 17)}, ${Math.round(80 + t * 5)}%, ${Math.round(38 - t * 7)}%)`
}

/** White text works on all the dark/saturated backgrounds in this scale. */
export function rdaTextColor(_pct: number | null): string {
  return '#ffffff'
}
