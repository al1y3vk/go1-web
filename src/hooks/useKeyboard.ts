import { useEffect, useRef } from 'react'

const TELEOP_KEYS = new Set([
  'w', 'a', 's', 'd', 'j', 'l',
  'W', 'A', 'S', 'D', 'J', 'L',
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  ' ',
])

export function useKeyboard() {
  const keysRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    function onDown(e: KeyboardEvent) {
      if (!TELEOP_KEYS.has(e.key)) return
      e.preventDefault()
      keysRef.current.add(e.key.toLowerCase())
    }
    function onUp(e: KeyboardEvent) {
      keysRef.current.delete(e.key.toLowerCase())
    }
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [])

  return keysRef
}
