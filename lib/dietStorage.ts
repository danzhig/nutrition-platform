import { supabase } from '@/lib/supabase'

export interface DietFood {
  foodId: number
  rating: number // 1–5
}

const LS_KEY = 'np:diet:foods'

// ─── Supabase helpers ─────────────────────────────────────────────────────────

async function fetchFromSupabase(userId: string): Promise<DietFood[] | null> {
  const { data, error } = await supabase
    .from('user_diet_lists')
    .select('foods')
    .eq('user_id', userId)
    .maybeSingle()
  if (error || !data) return null
  return data.foods as DietFood[]
}

async function upsertToSupabase(userId: string, foods: DietFood[]): Promise<void> {
  await supabase.from('user_diet_lists').upsert(
    { user_id: userId, foods, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' }
  )
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Load diet list. If userId is provided and Supabase returns data, that wins.
 * Falls back to localStorage for guests or on network error.
 */
export async function loadDietList(userId?: string): Promise<DietFood[]> {
  if (userId) {
    const remote = await fetchFromSupabase(userId)
    if (remote !== null) {
      // Cache locally
      try { localStorage.setItem(LS_KEY, JSON.stringify(remote)) } catch { /* ignore */ }
      return remote
    }
  }
  // Fallback: localStorage
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) return JSON.parse(raw) as DietFood[]
  } catch { /* ignore */ }
  return []
}

/**
 * Save diet list. Always writes localStorage immediately; if userId provided,
 * fires an async Supabase upsert (non-blocking).
 */
export function saveDietList(foods: DietFood[], userId?: string): void {
  try { localStorage.setItem(LS_KEY, JSON.stringify(foods)) } catch { /* ignore */ }
  if (userId) {
    upsertToSupabase(userId, foods).catch(console.error)
  }
}

/** Clear the local diet list (called on logout). */
export function clearLocalDietList(): void {
  try { localStorage.removeItem(LS_KEY) } catch { /* ignore */ }
}
