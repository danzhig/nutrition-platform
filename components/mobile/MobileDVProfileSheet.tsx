'use client'

import { useEffect, useState } from 'react'
import { RDA_PROFILES } from '@/lib/rdaProfiles'
import type { SavedProfile } from '@/lib/profileStorage'
import { useSwipeToDismiss } from './useSwipeToDismiss'

const LS_DEFAULT = 'np:m:rda-default'
const LS_DEFAULT_SET = 'np:m:rda-default-set'

interface MobileDVProfileSheetProps {
  open: boolean
  onClose: () => void
  rdaSelection: string
  onSelect: (selection: string) => void
  savedProfiles: SavedProfile[]
  isLoggedIn: boolean
}

interface Row {
  key: string
  label: string
}

export default function MobileDVProfileSheet({
  open,
  onClose,
  rdaSelection,
  onSelect,
  savedProfiles,
  isLoggedIn,
}: MobileDVProfileSheetProps) {
  const [defaultKey, setDefaultKey] = useState<string | null>(null)
  const [toastKey, setToastKey] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setDefaultKey(localStorage.getItem(LS_DEFAULT))
  }, [])

  useEffect(() => {
    if (open) {
      const raf = requestAnimationFrame(() => setVisible(true))
      return () => cancelAnimationFrame(raf)
    }
    setVisible(false)
  }, [open])

  // Android back button dismisses the sheet instead of navigating away.
  useEffect(() => {
    if (!open) return
    window.history.pushState({ sheet: true }, '')
    function onPopState() {
      onClose()
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function requestClose() {
    if (window.history.state?.sheet) {
      window.history.back()
    } else {
      onClose()
    }
  }

  const swipe = useSwipeToDismiss(requestClose)

  function handleSelect(key: string) {
    onSelect(key)
    if (localStorage.getItem(LS_DEFAULT_SET) !== 'true') {
      setToastKey(key)
      setTimeout(() => setToastKey((cur) => (cur === key ? null : cur)), 2500)
    }
    requestClose()
  }

  function toggleDefault(key: string) {
    if (defaultKey === key) {
      localStorage.removeItem(LS_DEFAULT)
      setDefaultKey(null)
    } else {
      localStorage.setItem(LS_DEFAULT, key)
      setDefaultKey(key)
    }
  }

  function confirmDefaultToast() {
    if (toastKey) {
      localStorage.setItem(LS_DEFAULT, toastKey)
      localStorage.setItem(LS_DEFAULT_SET, 'true')
      setDefaultKey(toastKey)
    }
    setToastKey(null)
  }

  if (!open) return null

  const builtInRows: Row[] = RDA_PROFILES.map((p) => ({ key: p.id, label: p.label }))
  const savedRows: Row[] = savedProfiles.map((p) => ({ key: `saved:${p.id}`, label: p.name }))

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60" onClick={requestClose} />

      <div
        className={`fixed inset-x-0 bottom-0 z-40 max-h-[80vh] flex flex-col rounded-t-2xl bg-slate-800 border-t border-slate-700 shadow-2xl transition-transform duration-300 ${
          visible ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)', ...swipe.style }}
      >
        <div className="pt-2 pb-4 shrink-0 touch-none" {...swipe.handlers}>
          <div className="w-9 h-1 rounded-full bg-slate-600 mx-auto" />
        </div>
        <h2 className="px-5 pb-3 text-sm font-semibold text-slate-100 shrink-0">Daily Value Profile</h2>

        <div className="overflow-y-auto overscroll-contain px-2 pb-4" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}>
          <ProfileRow
            row={{ key: '', label: 'None' }}
            active={rdaSelection === ''}
            starred={false}
            onSelect={handleSelect}
            onStar={undefined}
          />
          {builtInRows.map((row) => (
            <ProfileRow
              key={row.key}
              row={row}
              active={rdaSelection === row.key}
              starred={defaultKey === row.key}
              onSelect={handleSelect}
              onStar={toggleDefault}
            />
          ))}

          {isLoggedIn && savedRows.length > 0 && (
            <>
              <div className="px-3 pt-3 pb-1 text-[10px] uppercase tracking-wide text-slate-500">
                Saved Profiles
              </div>
              {savedRows.map((row) => (
                <ProfileRow
                  key={row.key}
                  row={row}
                  active={rdaSelection === row.key}
                  starred={defaultKey === row.key}
                  onSelect={handleSelect}
                  onStar={toggleDefault}
                />
              ))}
            </>
          )}
        </div>
      </div>

      {toastKey && (
        <div className="fixed inset-x-4 z-50 bottom-20 rounded-xl bg-slate-700 border border-slate-600 shadow-xl px-4 py-3 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-200">Set as default on this device?</span>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setToastKey(null)}
              className="text-xs text-slate-400 px-2 py-1"
            >
              Not now
            </button>
            <button
              type="button"
              onClick={confirmDefaultToast}
              className="text-xs font-semibold text-violet-300 px-2 py-1"
            >
              Yes
            </button>
          </div>
        </div>
      )}
    </>
  )
}

function ProfileRow({
  row,
  active,
  starred,
  onSelect,
  onStar,
}: {
  row: Row
  active: boolean
  starred: boolean
  onSelect: (key: string) => void
  onStar?: (key: string) => void
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onSelect(row.key)}
        className="flex-1 flex items-center gap-3 px-3 py-3 rounded-lg text-left active:bg-slate-700/60"
      >
        <span
          className={`w-4 h-4 rounded-full border-2 shrink-0 ${
            active ? 'border-violet-400 bg-violet-400' : 'border-slate-500'
          }`}
        />
        <span className="text-sm text-slate-100 truncate">{row.label}</span>
      </button>
      {onStar && (
        <button
          type="button"
          onClick={() => onStar(row.key)}
          className="p-2.5 shrink-0 active:opacity-70"
          aria-label="Set as device default"
        >
          <span className={starred ? 'text-amber-400' : 'text-slate-600'}>{starred ? '★' : '☆'}</span>
        </button>
      )}
    </div>
  )
}
