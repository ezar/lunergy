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
    <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-space-950/80 backdrop-blur">
      {/* Logo */}
      <div className="font-pixel text-[0.65rem] text-gold animate-pulse-glow tracking-widest">
        LUNERGY
      </div>

      {/* Conditions */}
      <div className="flex flex-col items-center gap-1">
        <ConditionPill conditions={conditions} />
        <div className="flex gap-3 items-center">
          <span className="font-pixel text-[0.38rem] text-white/30">
            SHIFT IN: <span className="text-cyan">{Math.ceil(nextShiftIn)}s</span>
          </span>
          <span className="font-pixel text-[0.38rem] text-white/30">
            {PHASES[phaseIndex].name}
          </span>
        </div>
      </div>

      {/* Score + time */}
      <div className="text-right">
        <div className="font-pixel text-[0.55rem] text-gold">{padScore(score)}</div>
        <div className="font-pixel text-[0.42rem] text-white/50 mt-0.5">{formatTime(time)}</div>
      </div>
    </div>
  )
}
