'use client'

export type NutritionUnit = 'pct' | 'serving' | '100g'

const OPTIONS: { id: NutritionUnit; label: string }[] = [
  { id: 'pct', label: '%DV' },
  { id: 'serving', label: '/srv' },
  { id: '100g', label: '/100g' },
]

interface MobileUnitToggleProps {
  value: NutritionUnit
  onChange: (value: NutritionUnit) => void
}

export default function MobileUnitToggle({ value, onChange }: MobileUnitToggleProps) {
  return (
    <div className="flex w-full rounded-lg bg-slate-800 p-1 gap-1">
      {OPTIONS.map((opt) => {
        const active = value === opt.id
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`flex-1 py-2 rounded-md text-xs font-semibold touch-manipulation active:opacity-80 transition-colors ${
              active
                ? 'bg-violet-600 text-white'
                : 'bg-transparent border border-slate-700 text-slate-400'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
