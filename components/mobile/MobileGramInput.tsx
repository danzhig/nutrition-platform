'use client'

import { useRef, useState } from 'react'

interface MobileGramInputProps {
  grams: number
  onChange: (grams: number) => void
}

export default function MobileGramInput({ grams, onChange }: MobileGramInputProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(grams))
  const inputRef = useRef<HTMLInputElement>(null)

  function startEdit() {
    setDraft(String(grams))
    setEditing(true)
    requestAnimationFrame(() => {
      inputRef.current?.focus()
      inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }

  function confirm() {
    const parsed = parseFloat(draft)
    if (Number.isFinite(parsed) && parsed > 0) {
      onChange(parsed)
    }
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={confirm}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            confirm()
          }
        }}
        className="w-20 text-base text-center bg-slate-700 border border-violet-500 rounded-lg px-2 py-1.5 text-slate-100 outline-none"
      />
    )
  }

  return (
    <button
      type="button"
      onClick={startEdit}
      className="flex items-center gap-1 rounded-lg bg-slate-700 border border-slate-600 px-3 py-1.5 text-sm font-medium text-slate-100 active:opacity-70 touch-manipulation"
    >
      <span>{grams}g</span>
      <span className="text-slate-500 text-xs">↑</span>
    </button>
  )
}
