import type { Conditions } from '../../types'
import { ConditionPill } from './ConditionPill'
import { padScore, formatTime } from '../../lib/utils'
import { PHASES } from '../../lib/constants'

interface TopHUDProps {
  score: number
  time: number
  conditions: Conditions
  nextShiftIn: number
  phaseIndex: number
}

export function TopHUD({ score, time, conditions, nextShiftIn, phaseIndex }: TopHUDProps) {
  return (
    <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-space-950/90 backdrop-blur gap-4">
      {/* Logo */}
      <div className="font-pixel text-lg text-gold animate-pulse-glow tracking-widest shrink-0">
        LUNERGY
      </div>

      {/* Conditions + shift */}
      <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
        <ConditionPill conditions={conditions} />
        <div className="flex gap-4 items-center">
          <span className="font-pixel text-xs text-white/40">
            SHIFT IN: <span className="text-cyan">{Math.ceil(nextShiftIn)}s</span>
          </span>
          <span className="font-pixel text-xs text-white/40 hidden sm:inline">
            {PHASES[phaseIndex].name}
          </span>
        </div>
      </div>

      {/* Score + time */}
      <div className="text-right shrink-0">
        <div className="font-pixel text-base text-gold">{padScore(score)}</div>
        <div className="font-pixel text-xs text-white/50 mt-1">{formatTime(time)}</div>
      </div>
    </div>
  )
}
