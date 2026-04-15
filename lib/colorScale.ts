/**
 * Maps a normalised value (0–1) to a CSS hsl() colour string.
 *
 * Scale:
 *   1.0  → deep green   hsl(142, 76%, 28%)
 *   0.5  → light grey   hsl(0, 0%, 92%)
 *   0.0  → deep red     hsl(0, 72%, 42%)
 *   null → slate grey   #cbd5e1
 */
export function cellColor(value: number | null, min: number, max: number): string {
  if (value === null || value === undefined) return '#cbd5e1' // neutral slate — data unavailable

  const range = max - min
  const normalised = range === 0 ? 0.5 : (value - min) / range // 0.0 → 1.0

  if (normalised >= 0.5) {
    // Green half: 0.5 → grey, 1.0 → deep green
    const t = (normalised - 0.5) / 0.5 // 0 → 1
    const lightness = Math.round(92 - t * 64) // 92% → 28%
    const saturation = Math.round(t * 76)     // 0% → 76%
    return `hsl(142, ${saturation}%, ${lightness}%)`
  } else {
    // Red half: 0.0 → deep red, 0.5 → grey
    const t = normalised / 0.5 // 0 → 1
    const lightness = Math.round(42 + t * 50) // 42% → 92%
    const saturation = Math.round(72 - t * 72) // 72% → 0%
    return `hsl(0, ${saturation}%, ${lightness}%)`
  }
}

/** Returns black or white depending on which has better contrast against the bg color */
export function textColor(value: number | null, min: number, max: number): string {
  if (value === null || value === undefined) return '#475569'
  const range = max - min
  const normalised = range === 0 ? 0.5 : (value - min) / range
  // Use white text at the dark ends, dark text in the middle
  if (normalised > 0.75 || normalised < 0.2) return '#ffffff'
  return '#1e293b'
}
