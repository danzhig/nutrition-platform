'use client'

import { useState } from 'react'
import { useAuth } from './AuthProvider'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: Props) {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  function reset() {
    setEmail('')
    setPassword('')
    setError(null)
    setInfo(null)
    setLoading(false)
  }

  function switchMode(next: 'login' | 'signup') {
    setMode(next)
    setError(null)
    setInfo(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)

    if (mode === 'login') {
      const { error } = await signIn(email, password)
      if (error) {
        setError(error)
        setLoading(false)
      } else {
        reset()
        onClose()
      }
    } else {
      const { error, needsConfirmation } = await signUp(email, password)
      if (error) {
        setError(error)
        setLoading(false)
      } else if (needsConfirmation) {
        setInfo('Check your email for a confirmation link, then come back to sign in.')
        setLoading(false)
      } else {
        reset()
        onClose()
      }
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={() => { reset(); onClose() }}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="w-full max-w-sm bg-slate-800 rounded-xl border border-slate-700 shadow-2xl pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
            <h2 className="text-base font-semibold text-white">
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </h2>
            <button
              onClick={() => { reset(); onClose() }}
              className="text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-slate-700"
            >
              ✕
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-3 py-2 text-sm bg-slate-700 border border-slate-600 text-slate-100 placeholder-slate-500 rounded-lg outline-none focus:ring-2 focus:ring-violet-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Min 6 characters"
                className="w-full px-3 py-2 text-sm bg-slate-700 border border-slate-600 text-slate-100 placeholder-slate-500 rounded-lg outline-none focus:ring-2 focus:ring-violet-500 transition"
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-950/40 border border-red-800/50 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            {info && (
              <p className="text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 rounded-lg px-3 py-2">
                {info}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-lg text-sm font-semibold bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
            >
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>

            <p className="text-center text-xs text-slate-500">
              {mode === 'login' ? (
                <>
                  No account?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('signup')}
                    className="text-violet-400 hover:text-violet-300 underline transition-colors"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="text-violet-400 hover:text-violet-300 underline transition-colors"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </form>
        </div>
      </div>
    </>
  )
}
