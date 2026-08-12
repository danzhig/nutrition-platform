'use client'

interface MobileHeaderProps {
  profileLabel?: string
  onProfileClick?: () => void
  streakDays?: number
}

export default function MobileHeader({
  profileLabel = 'No Profile',
  onProfileClick,
  streakDays = 0,
}: MobileHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-2 px-4 h-14 shrink-0 border-b border-slate-800 bg-slate-900">
      <span className="text-base font-semibold text-slate-100 truncate">Nutrition</span>
      <div className="flex items-center gap-2">
        {streakDays > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-amber-500/15 text-amber-400 text-xs font-medium px-2.5 py-1">
            🔥 {streakDays}
          </span>
        )}
        <button
          type="button"
          onClick={onProfileClick}
          className="max-w-[140px] truncate rounded-full bg-slate-800 text-slate-200 text-xs font-medium px-3 py-1.5 active:opacity-70 active:scale-[0.97] transition-opacity transition-transform duration-150"
        >
          {profileLabel}
        </button>
      </div>
    </header>
  )
}
