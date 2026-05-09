'use client'

import type { SuggestedFood } from '@/lib/dietSuggestions'

interface Props {
  suggestions: SuggestedFood[]
  onAdd: (foodId: number) => void
  hasSelection: boolean
  hasProfile: boolean
}

export default function DietSuggestionsPanel({
  suggestions,
  onAdd,
  hasSelection,
  hasProfile,
}: Props) {
  // No profile active
  if (!hasProfile) {
    return (
      <p className="text-slate-500 text-xs text-center py-4">
        Select a DV profile in the header to see personalized suggestions
      </p>
    )
  }

  // No foods in the diet yet
  if (!hasSelection) {
    return (
      <p className="text-slate-500 text-xs text-center py-4">
        Add foods to your diet to see personalized suggestions
      </p>
    )
  }

  // All nutrients fulfilled — nothing to suggest
  if (suggestions.length === 0) {
    return (
      <div className="py-4 text-center">
        <p className="text-emerald-400 text-sm font-semibold">Your diet covers all nutrients well!</p>
        <p className="text-slate-500 text-xs mt-1">
          No significant gaps detected — keep it up.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex gap-3" style={{ minWidth: 'max-content' }}>
        {suggestions.map((s) => (
          <div
            key={s.foodId}
            className="w-40 flex-shrink-0 bg-slate-700/50 border border-slate-600 rounded-lg p-3 flex flex-col gap-2"
          >
            {/* Food name + category */}
            <div>
              <p
                className="text-[11px] font-semibold text-slate-100 leading-tight truncate"
                title={s.foodName}
              >
                {s.foodName}
              </p>
              <p className="text-[9px] text-slate-500 mt-0.5 truncate">{s.category}</p>
            </div>

            {/* Top gap nutrients this food addresses */}
            <div className="flex flex-col gap-1 flex-1">
              {s.topGapNutrients.map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-0.5 text-[9px] text-violet-300 bg-violet-500/15 rounded px-1.5 py-0.5 truncate"
                  title={`Improves ${name} gap`}
                >
                  <span className="text-violet-400 flex-shrink-0">↑</span>
                  <span className="truncate">{name.replace('Vitamin ', 'Vit. ')}</span>
                </span>
              ))}
            </div>

            {/* Add button */}
            <button
              onClick={() => onAdd(s.foodId)}
              className="w-full py-1 rounded text-[10px] font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors"
            >
              + Add
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
