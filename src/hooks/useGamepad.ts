import { useEffect, useRef } from 'react'

export interface GamepadSnapshot {
  axes: number[]
  buttons: boolean[]
  connected: boolean
}

export function useGamepad() {
  const snapshotRef = useRef<GamepadSnapshot>({
    axes: [],
    buttons: [],
    connected: false,
  })
  const rafRef = useRef<number>(0)

  useEffect(() => {
    function poll() {
      const gamepads = navigator.getGamepads()
      const gp = gamepads[0] ?? null
      if (gp) {
        snapshotRef.current = {
          axes: Array.from(gp.axes),
          buttons: gp.buttons.map(b => b.pressed),
          connected: true,
        }
      } else {
        snapshotRef.current = { axes: [], buttons: [], connected: false }
      }
      rafRef.current = requestAnimationFrame(poll)
    }
    rafRef.current = requestAnimationFrame(poll)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return snapshotRef
}
