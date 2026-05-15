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
        left: x - 13,
        top: y - 3,
        zIndex: 10001,
        pointerEvents: 'none',
        transition: 'left 450ms cubic-bezier(0.25, 0.46, 0.45, 0.94), top 450ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        filter: 'drop-shadow(2px 3px 5px rgba(0,0,0,0.55))',
      }}
    >
      <svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Index finger — dips down on click */}
        <g
          style={{
            transform: clicking ? 'translateY(4px)' : 'translateY(0px)',
            transition: 'transform 80ms ease-in',
          }}
        >
          <rect x="8.5" y="0" width="8" height="18" rx="4" fill="white" stroke="#1e1e1e" strokeWidth="1.5" />
          <rect x="10" y="1.5" width="5" height="8.5" rx="2.5" fill="#f0eeec" />
        </g>
        {/* Palm body */}
        <path
          d="M4 15.5 Q4 13 9 13 L20 13 Q24 13 24 17 L24 29 Q24 33 20 33 L8.5 33 Q4.5 33 4.5 29 Z"
          fill="white"
          stroke="#1e1e1e"
          strokeWidth="1.5"
        />
        {/* Middle finger knuckle */}
        <path
          d="M20 13 L20 10 Q20 7.5 22 7.5 L22 13"
          fill="white"
          stroke="#1e1e1e"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Ring finger knuckle */}
        <path
          d="M22 13 L22 11.5 Q22 10 24 10 L24 13"
          fill="white"
          stroke="#1e1e1e"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Thumb */}
        <path
          d="M4.5 20 C4.5 20 2 19 2 22 C2 25 4.5 25 4.5 25"
          fill="white"
          stroke="#1e1e1e"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Palm crease */}
        <line x1="8" y1="22" x2="21" y2="22" stroke="#e0dedd" strokeWidth="0.75" />
      </svg>
    </div>
  )
}
