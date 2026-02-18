import type { GamepadSnapshot } from '../hooks/useGamepad'

interface Props {
  gp: GamepadSnapshot
  className?: string
}

const ACTIVE = '#00e676'
const ACTIVE_DIM = 'rgba(0, 230, 118, 0.45)'

// Stick position scaled to max displacement within the ring
function stickPos(axes: number[], xIdx: number, yIdx: number, cx: number, cy: number, range: number) {
  return {
    x: cx + (axes[xIdx] ?? 0) * range,
    y: cy + (axes[yIdx] ?? 0) * range,
  }
}

export function GamepadVisual({ gp, className }: Props) {
  if (!gp.connected) return null

  const b = gp.buttons
  const ls = stickPos(gp.axes, 0, 1, 142, 211, 28)
  const rs = stickPos(gp.axes, 2, 3, 365, 300, 28)

  // LT/RT are analog (buttons 6/7 report as pressed boolean, but axes may exist)
  // For visual fill we use the button pressed state
  const ltActive = b[6] ?? false
  const rtActive = b[7] ?? false

  return (
    <svg viewBox="0 85 580 410" className={className}>
      {/* Controller body - from SVG Repo xbox-control-for-one (Public Domain) */}
      <path d="M505.765,151.733c-16.255-10.392-4.528-16.329-21.353-29.193c-16.824-12.864-85.104-34.639-96.983-24.743
        s-25.233,11.873-25.233,11.873h-72.112h-0.122h-72.118c0,0-13.36-1.977-25.233-11.873c-11.873-9.896-80.16,11.873-96.983,24.743
        c-16.824,12.864-5.098,18.801-21.353,29.193C58.02,162.125,15.467,305.619,15.467,305.619s-55.417,159.824,43.544,179.12
        c0,0,24.248-15.336,45.025-40.079c20.784-24.743,61.353-59.872,83.128-60.368c21.298-0.483,99.389-0.019,102.792,0l0,0
        c0,0,0.024,0,0.061,0c0.043,0,0.062,0,0.062,0l0,0c3.403-0.019,81.494-0.483,102.792,0c21.769,0.496,62.345,35.625,83.128,60.368
        s45.024,40.079,45.024,40.079c98.961-19.296,43.544-179.12,43.544-179.12S522.02,162.125,505.765,151.733z"
        fill="#2a2a3a" stroke="#3a4a5a" strokeWidth={2} />

      {/* === Left stick === */}
      {/* Outer ring */}
      <circle cx={142} cy={211} r={49} fill="none" stroke="#3a4a5a" strokeWidth={2} />
      <circle cx={142} cy={211} r={42} fill="#1a1a2a" />
      {/* Stick thumb */}
      <circle cx={ls.x} cy={ls.y} r={22}
        fill={b[10] ? ACTIVE : '#333345'} stroke="#4a4a5a" strokeWidth={1.5} />

      {/* === Right stick === */}
      <circle cx={365} cy={300} r={49} fill="none" stroke="#3a4a5a" strokeWidth={2} />
      <circle cx={365} cy={300} r={42} fill="#1a1a2a" />
      <circle cx={rs.x} cy={rs.y} r={22}
        fill={b[11] ? ACTIVE : '#333345'} stroke="#4a4a5a" strokeWidth={1.5} />

      {/* === Face buttons (Y/X/B/A) === */}
      {/* Y - top */}
      <circle cx={438} cy={174} r={19} fill={b[3] ? '#ffd600' : '#1e1e30'} stroke="#3a4a5a" strokeWidth={1.5} />
      <text x={438} y={180} textAnchor="middle" fontSize={16} fontWeight={700}
        fill={b[3] ? '#1a1a2a' : '#556'}>Y</text>

      {/* X - left */}
      <circle cx={399} cy={212} r={19} fill={b[2] ? '#2979ff' : '#1e1e30'} stroke="#3a4a5a" strokeWidth={1.5} />
      <text x={399} y={218} textAnchor="middle" fontSize={16} fontWeight={700}
        fill={b[2] ? '#fff' : '#556'}>X</text>

      {/* B - right */}
      <circle cx={479} cy={212} r={19} fill={b[1] ? '#ff1744' : '#1e1e30'} stroke="#3a4a5a" strokeWidth={1.5} />
      <text x={479} y={218} textAnchor="middle" fontSize={16} fontWeight={700}
        fill={b[1] ? '#fff' : '#556'}>B</text>

      {/* A - bottom */}
      <circle cx={438} cy={252} r={19} fill={b[0] ? ACTIVE : '#1e1e30'} stroke="#3a4a5a" strokeWidth={1.5} />
      <text x={438} y={258} textAnchor="middle" fontSize={16} fontWeight={700}
        fill={b[0] ? '#1a1a2a' : '#556'}>A</text>

      {/* === D-pad === */}
      {/* Vertical bar */}
      <rect x={207} y={270} width={18} height={60} rx={3}
        fill="#1e1e30" stroke="#3a4a5a" strokeWidth={1} />
      {/* Horizontal bar */}
      <rect x={187} y={290} width={60} height={18} rx={3}
        fill="#1e1e30" stroke="#3a4a5a" strokeWidth={1} />
      {/* D-pad highlights */}
      {b[12] && <rect x={209} y={270} width={14} height={22} rx={2} fill={ACTIVE_DIM} />}
      {b[13] && <rect x={209} y={308} width={14} height={22} rx={2} fill={ACTIVE_DIM} />}
      {b[14] && <rect x={187} y={292} width={22} height={14} rx={2} fill={ACTIVE_DIM} />}
      {b[15] && <rect x={225} y={292} width={22} height={14} rx={2} fill={ACTIVE_DIM} />}

      {/* === Back / Start (View / Menu) === */}
      <circle cx={249} cy={212} r={10}
        fill={b[8] ? ACTIVE : '#1e1e30'} stroke="#3a4a5a" strokeWidth={1} />
      <circle cx={332} cy={212} r={10}
        fill={b[9] ? ACTIVE : '#1e1e30'} stroke="#3a4a5a" strokeWidth={1} />

      {/* === Xbox button === */}
      <circle cx={290} cy={148} r={15}
        fill={b[16] ? '#fff' : '#1e1e30'} stroke="#3a4a5a" strokeWidth={1.5} />

      {/* === LB / RB bumpers === */}
      <rect x={95} y={120} width={80} height={18} rx={9}
        fill={b[4] ? ACTIVE : '#1e1e30'} stroke="#3a4a5a" strokeWidth={1.5} />
      <text x={135} y={133} textAnchor="middle" fontSize={12} fontWeight={700}
        fill={b[4] ? '#1a1a2a' : '#556'}>LB</text>

      <rect x={400} y={120} width={80} height={18} rx={9}
        fill={b[5] ? ACTIVE : '#1e1e30'} stroke="#3a4a5a" strokeWidth={1.5} />
      <text x={440} y={133} textAnchor="middle" fontSize={12} fontWeight={700}
        fill={b[5] ? '#1a1a2a' : '#556'}>RB</text>

      {/* === LT / RT triggers === */}
      <rect x={110} y={98} width={55} height={16} rx={5}
        fill="#1e1e30" stroke="#3a4a5a" strokeWidth={1} />
      {ltActive && <rect x={110} y={98} width={55} height={16} rx={5} fill={ACTIVE_DIM} />}
      <text x={137.5} y={110} textAnchor="middle" fontSize={10} fontWeight={600}
        fill={ltActive ? ACTIVE : '#556'}>LT</text>

      <rect x={415} y={98} width={55} height={16} rx={5}
        fill="#1e1e30" stroke="#3a4a5a" strokeWidth={1} />
      {rtActive && <rect x={415} y={98} width={55} height={16} rx={5} fill={ACTIVE_DIM} />}
      <text x={442.5} y={110} textAnchor="middle" fontSize={10} fontWeight={600}
        fill={rtActive ? ACTIVE : '#556'}>RT</text>
    </svg>
  )
}
