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
  if (pct <= 0)  return 'hsl(0, 75%, 40%)'

  if (pct < 50) {
    const t = pct / 50
    return `hsl(${Math.round(t * 18)}, ${Math.round(75 - t * 5)}%, ${Math.round(40 + t * 4)}%)`
  }

  if (pct < 85) {
    const t = (pct - 50) / 35
    const hue = Math.round(18 + t * 108)
    return `hsl(${hue}, ${Math.round(70 + t * 8)}%, ${Math.round(44 - t * 10)}%)`
  }

  if (pct <= 120) {
    // Sweet spot — peak green near 100 %
    const t = Math.abs(pct - 100) / 20  // 0 at 100 %, 1 at 80 or 120
    return `hsl(142, ${Math.round(72 - t * 8)}%, ${Math.round(30 - t * 2)}%)`
  }

  // Over 120 % with no UL concern — fade gently
  const fade = Math.min(1, (pct - 120) / 200)
  return `hsl(142, ${Math.round(64 - fade * 35)}%, ${Math.round(32 + fade * 5)}%)`
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
