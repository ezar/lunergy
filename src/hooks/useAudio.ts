import { useCallback } from 'react'
import { play, type SoundId } from '../lib/audio'

export function useAudio() {
  const playSound = useCallback((id: SoundId) => {
    play(id)
  }, [])

  return { playSound }
}
