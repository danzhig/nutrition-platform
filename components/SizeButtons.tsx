'use client'

import type { SizeVariant } from '@/lib/portionSizes'

interface Props {
  sizes: { s: SizeVariant; m: SizeVariant; l: SizeVariant }
  onSelect: (key: 's' | 'm' | 'l', variant: SizeVariant) => void
  activeKey?: 's' | 'm' | 'l' | null
  addedKey?: 's' | 'm' | 'l' | null
}

const SIZE_KEYS = ['s', 'm', 'l'] as const

export default function SizeButtons({ sizes, onSelect, activeKey, addedKey }: Props) {
  return (
    <div className="flex items-center gap-0.5">
      {SIZE_KEYS.map((key) => {
        const variant = sizes[key]
        const isActive = activeKey === key
        const isAdded  = addedKey === key

        return (
          <button
            key={key}
            onClick={(e) => { e.stopPropagation(); onSelect(key, variant) }}
            title={`${variant.label} · ${variant.grams}g`}
            className={`w-6 h-5 flex items-center justify-center text-[10px] font-bold rounded transition-colors ${
              isAdded
                ? 'bg-green-700 border border-green-600 text-green-100'
                : isActive
                ? 'bg-violet-700 border border-violet-500 text-white'
                : 'bg-slate-700 border border-slate-600 text-slate-400 hover:border-violet-500 hover:bg-violet-900/40 hover:text-violet-300'
            }`}
          >
            {isAdded ? '✓' : key.toUpperCase()}
          </button>
        )
      })}
    </div>
  )
}
