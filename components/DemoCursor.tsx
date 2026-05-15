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
        left: x - 9,
        top: y,
        zIndex: 10001,
        pointerEvents: 'none',
        transition: 'left 450ms cubic-bezier(0.25, 0.46, 0.45, 0.94), top 450ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        filter: 'drop-shadow(2px 3px 5px rgba(0,0,0,0.5))',
      }}
    >
      {/*
        3/4-angle view: four fingers at staggered heights create the depth illusion.
        Render order = back to front so later elements sit in front.
        Index finger hot-spot is at SVG (9.25, 0) → CSS offset left-9, top+0.
      */}
      <svg width="30" height="38" viewBox="0 0 30 38" fill="none" xmlns="http://www.w3.org/2000/svg">

        {/* Pinky — shortest, furthest back, slightly desaturated */}
        <rect x="22" y="13" width="6" height="9" rx="3" fill="#e8e6e3" stroke="#1e1e1e" strokeWidth="1.2"/>

        {/* Ring finger */}
        <rect x="17.5" y="10" width="6.5" height="12" rx="3.25" fill="#edecea" stroke="#1e1e1e" strokeWidth="1.3"/>

        {/* Middle finger — nearly as tall as index */}
        <rect x="12.5" y="6" width="7" height="15" rx="3.5" fill="#f3f1ef" stroke="#1e1e1e" strokeWidth="1.4"/>
        <rect x="14" y="7.5" width="4" height="6" rx="2" fill="#e8e6e3"/>

        {/* Palm — drawn after back fingers so it buries their bases */}
        <path
          d="M4 17 Q3.5 24 5 30.5 Q8 37 15.5 37 Q23 37 26.5 32 Q28.5 27 27.5 22 Q26 17 22 16.5 L13 16.5 Q7.5 16.5 4 17 Z"
          fill="white"
          stroke="#1e1e1e"
          strokeWidth="1.5"
        />

        {/* Index finger — drawn last so it sits in front of palm */}
        <g
          style={{
            transform: clicking ? 'translateY(4px)' : 'translateY(0px)',
            transition: 'transform 80ms ease-in',
          }}
        >
          <rect x="5" y="0" width="8.5" height="19.5" rx="4.25" fill="white" stroke="#1e1e1e" strokeWidth="1.5"/>
          {/* Fingernail / highlight */}
          <rect x="6.5" y="1.5" width="5" height="9" rx="2.5" fill="#f0eeec"/>
        </g>

        {/* Thumb */}
        <path
          d="M4.5 21 C4.5 21 2 20 2 23.5 C2 27 4.5 27 4.5 27"
          fill="white"
          stroke="#1e1e1e"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Palm crease */}
        <line x1="7" y1="24" x2="22" y2="24" stroke="#dddbd9" strokeWidth="0.8"/>
      </svg>
    </div>
  )
}
