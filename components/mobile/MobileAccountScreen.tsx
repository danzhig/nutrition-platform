'use client'

import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'

interface MobileAccountScreenProps {
  onLoginSuccess?: () => void
}

const RDA_SEL_KEY = 'np:m:rda-sel'

export default function MobileAccountScreen({ onLoginSuccess }: MobileAccountScreenProps) {
  const { user, loading, signIn, signUp, signOut } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function switchMode(next: 'login' | 'signup') {
    setMode(next)
    setError(null)
    setInfo(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setSubmitting(true)

    if (mode === 'login') {
      const { error } = await signIn(email, password)
      if (error) {
        setError(error)
        setSubmitting(false)
      } else {
        setEmail('')
        setPassword('')
        setSubmitting(false)
        onLoginSuccess?.()
      }
    } else {
      const { error, needsConfirmation } = await signUp(email, password)
      if (error) {
        setError(error)
        setSubmitting(false)
      } else if (needsConfirmation) {
        setInfo('Check your email for a confirmation link, then come back to sign in.')
        setSubmitting(false)
      } else {
        setEmail('')
        setPassword('')
        setSubmitting(false)
        onLoginSuccess?.()
      }
    }
  }

  if (loading) {
    return <div className="p-4 text-slate-400 text-sm">Loading…</div>
  }

  if (user) {
    const profileLabel = typeof window !== 'undefined' ? localStorage.getItem(RDA_SEL_KEY) : null

    return (
      <div className="p-4 space-y-4">
        <div className="rounded-xl bg-slate-800 border border-slate-700 p-4 space-y-1">
          <span className="text-xs text-slate-400">Signed in as</span>
          <p className="text-sm font-medium text-slate-100 truncate">{user.email}</p>
        </div>

        <button
          type="button"
          className="w-full flex items-center justify-between rounded-xl bg-slate-800 border border-slate-700 p-4 text-left active:opacity-70 active:scale-[0.99] transition-opacity transition-transform duration-150"
        >
          <span className="text-sm text-slate-300">Default DV Profile</span>
          <span className="text-sm text-slate-400 truncate max-w-[140px]">
            {profileLabel ?? 'No Profile'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => signOut()}
          className="w-full py-2.5 rounded-lg text-sm font-medium border border-slate-600 text-slate-300 active:opacity-70 active:scale-[0.99] transition-opacity transition-transform duration-150"
        >
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 py-10">
      <h1 className="text-xl font-semibold text-slate-100 mb-8">Nutrition</h1>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
          <input
            type="email"
            inputMode="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null) }}
            required
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder="you@example.com"
            className="w-full px-3 py-3 text-base bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-lg outline-none focus:ring-2 focus:ring-violet-500 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(null) }}
            required
            minLength={6}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder="Min 6 characters"
            className="w-full px-3 py-3 text-base bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-lg outline-none focus:ring-2 focus:ring-violet-500 transition"
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
          disabled={submitting}
          className="w-full py-3 rounded-lg text-sm font-semibold bg-violet-600 disabled:opacity-50 text-white active:opacity-80 transition-opacity"
        >
          {submitting ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>

        <p className="text-center text-xs text-slate-500">
          {mode === 'login' ? (
            <>
              No account?{' '}
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className="text-violet-400 underline"
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
                className="text-violet-400 underline"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </form>
    </div>
  )
}
