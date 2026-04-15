/**
 * Maps a normalised value (0–1) to a CSS hsl() colour string.
 *
 * Scale:
 *   1.0  → deep green   hsl(142, 76%, 28%)
 *   0.5  → dark slate   hsl(220, 13%, 22%)  — mid blends into dark bg
 *   0.0  → deep red     hsl(0, 72%, 42%)
 *   null → dark slate   #1e293b
 */
export function cellColor(value: number | null, min: number, max: number): string {
  if (value === null || value === undefined) return '#1e293b' // dark slate — data unavailable

  const range = max - min
  const normalised = range === 0 ? 0.5 : (value - min) / range // 0.0 → 1.0

  if (normalised >= 0.5) {
    // Green half: 0.5 → dark slate, 1.0 → deep green
    const t = (normalised - 0.5) / 0.5 // 0 → 1
    const lightness = Math.round(22 + t * 10) // 22% → 32%, then push to 28% at full
    const saturation = Math.round(t * 76)     // 0% → 76%
    const hue = 142
    return `hsl(${hue}, ${saturation}%, ${Math.round(32 - t * 4)}%)`
  } else {
    // Red half: 0.0 → deep red, 0.5 → dark slate
    const t = normalised / 0.5 // 0 → 1
    const lightness = Math.round(42 + t * 16) // 42% → 58% → blends to dark
    const saturation = Math.round(72 - t * 72) // 72% → 0%
    return `hsl(0, ${saturation}%, ${lightness}%)`
  }
}

/** Returns a light or muted text colour for good contrast on the dark cell backgrounds */
export function textColor(value: number | null, min: number, max: number): string {
  if (value === null || value === undefined) return '#475569' // muted for unavailable
  const range = max - min
  const normalised = range === 0 ? 0.5 : (value - min) / range
  // White text on strongly coloured cells; muted slate on mid cells
  if (normalised > 0.6 || normalised < 0.25) return '#ffffff'
  return '#94a3b8' // slate-400
}
