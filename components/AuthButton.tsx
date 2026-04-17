'use client'

import { useState } from 'react'
import { useAuth } from './AuthProvider'
import AuthModal from './AuthModal'

export default function AuthButton() {
  const { user, loading, signOut } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  if (loading) {
    return <div className="w-20 h-8 rounded-lg bg-slate-700 animate-pulse" />
  }

  if (!user) {
    return (
      <>
        <button
          onClick={() => setModalOpen(true)}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors"
        >
          Sign in
        </button>
        <AuthModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors border border-slate-600"
      >
        {/* Avatar circle */}
        <span className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center text-[9px] font-bold text-white shrink-0">
          {user.email?.[0]?.toUpperCase() ?? '?'}
        </span>
        <span className="max-w-[120px] truncate hidden sm:block">{user.email}</span>
        <span className="text-slate-500">▾</span>
      </button>

      {dropdownOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setDropdownOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden">
            <div className="px-3 py-2 border-b border-slate-700">
              <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
            </div>
            <button
              onClick={async () => { setDropdownOpen(false); await signOut() }}
              className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  )
}
