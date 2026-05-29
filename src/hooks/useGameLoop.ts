import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/useGameStore'

export function useGameLoop(): void {
  const tick = useGameStore(s => s.tick)
  const screen = useGameStore(s => s.screen)
  const rafRef = useRef<number | null>(null)
  const lastRef = useRef<number | null>(null)

  useEffect(() => {
    if (screen !== 'game') {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
        lastRef.current = null
      }
      return
    }

    const loop = (ts: number) => {
      if (lastRef.current !== null) {
        const dt = Math.min((ts - lastRef.current) / 1000, 0.1)
        tick(dt)
      }
      lastRef.current = ts
      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
        lastRef.current = null
      }
    }
  }, [screen, tick])
}
