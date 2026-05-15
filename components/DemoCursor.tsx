'use client'

interface Props {
  x: number
  y: number
  clicking: boolean
}

export default function DemoCursor({ x, y, clicking }: Props) {
  if (x < -100) return null
  return (
    <div
      style={{
        position: 'fixed',
        left: x - 1,
        top: y - 1,
        zIndex: 10001,
        pointerEvents: 'none',
        transformOrigin: '1px 1px',
        transform: clicking ? 'scale(0.72)' : 'scale(1)',
        transition: `left 450ms cubic-bezier(0.25, 0.46, 0.45, 0.94), top 450ms cubic-bezier(0.25, 0.46, 0.45, 0.94), transform ${clicking ? '70ms ease-in' : '160ms ease-out'}`,
        filter: 'drop-shadow(1px 2px 3px rgba(0,0,0,0.45))',
      }}
    >
      {/* Classic arrow cursor. Hot-spot is the tip at SVG (1,1) = CSS (0,0) after offset. */}
      <svg viewBox="0 0 12 20" width="24" height="40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M 1 1 L 1 16 L 4.5 13 L 7.5 19.5 L 9.5 18.5 L 6.5 12 L 11 12 Z"
          fill="white"
          stroke="#1a1a1a"
          strokeWidth="1.2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}
