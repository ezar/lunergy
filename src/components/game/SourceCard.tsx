import { motion } from 'framer-motion'
import type { SourceId, SourceState, Conditions } from '../../types'
import { SOURCES, getEffectiveOutput, getEffectiveMultiplier } from '../../lib/constants'
import { PixelButton } from '../ui/PixelButton'

interface SourceCardProps {
  id: SourceId
  state: SourceState
  conditions: Conditions
  score: number
  onToggle: (id: SourceId) => void
  onRefuel: (id: SourceId) => void
}

export function SourceCard({ id, state, conditions, score, onToggle, onRefuel }: SourceCardProps) {
  const src = SOURCES.find(s => s.id === id)!
  const isOn = state.on
  const fuelPct = src.fuelMax !== null && state.fuel !== null
    ? (state.fuel / src.fuelMax) * 100
    : null
  const noFuel = src.fuelMax !== null && state.fuel !== null && state.fuel <= 0
  const canRefuel = src.fuelMax !== null && !noFuel && state.fuel !== null && state.fuel < src.fuelMax
  const effectiveOutput = isOn ? getEffectiveOutput(id, conditions) : 0
  const multiplier = getEffectiveMultiplier(id, conditions)
  const isModified = Math.abs(multiplier - 1) > 0.05
  const isBoosted = multiplier > 1
  const isReduced = multiplier < 1

  const fuelColor =
    fuelPct === null ? '#33ff88'
    : fuelPct > 50 ? '#33ff88'
    : fuelPct > 20 ? '#ffcc33'
    : '#ff4d4d'

  return (
    <motion.div
      animate={isOn
        ? { boxShadow: [`0 0 10px ${src.color}55`, `0 0 24px ${src.color}99`, `0 0 10px ${src.color}55`] }
        : { boxShadow: '0 0 0px transparent' }
      }
      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      className={[
        'border-2 p-4 flex flex-col gap-3 cursor-pointer select-none transition-colors duration-200',
        isOn ? 'bg-space-800/80' : 'bg-space-950/60',
        noFuel ? 'opacity-60' : '',
      ].join(' ')}
      style={{ borderColor: isOn ? src.color + 'cc' : noFuel ? '#ff4d4d44' : src.color + '55' }}
      onClick={() => { if (!noFuel || isOn) onToggle(id) }}
    >
      {/* Header: icon + name + ON/OFF badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl" style={{ color: src.color }}>{src.icon}</span>
          <span className="font-pixel text-sm leading-tight" style={{ color: src.color }}>
            {src.short}
          </span>
        </div>
        <div
          className={[
            'font-pixel text-xs px-3 py-1 border',
            isOn ? 'animate-blink-slow' : '',
          ].join(' ')}
          style={{
            color: isOn ? '#33ff88' : '#ff4d4d',
            borderColor: isOn ? '#33ff8866' : '#ff4d4d66',
            backgroundColor: isOn ? '#33ff8811' : '#ff4d4d11',
          }}
        >
          {noFuel ? '⚠ NO FUEL' : isOn ? '▶ ON' : '👆 TAP'}
        </div>
      </div>

      {/* Output display */}
      <div className="flex items-baseline gap-2">
        <span className="font-vt text-4xl leading-none" style={{ color: isOn ? src.color : '#555' }}>
          {isOn ? effectiveOutput.toFixed(1) : src.baseOutput.toFixed(1)}
        </span>
        <span className="font-pixel text-xs text-white/40">⚡/s</span>
        {isOn && isModified && (
          <span
            className="font-pixel text-xs ml-1"
            style={{ color: isBoosted ? '#33ff88' : '#ff4d4d' }}
          >
            {isBoosted ? '▲' : '▼'} ×{multiplier.toFixed(2)}
          </span>
        )}
      </div>

      {/* Condition hint */}
      {isOn && isReduced && (
        <p className="font-vt text-base text-pixel-red/80">
          ⚠ Penalised by current conditions
        </p>
      )}
      {isOn && isBoosted && (
        <p className="font-vt text-base text-pixel-green/80">
          ✓ Boosted by current conditions!
        </p>
      )}

      {/* Fuel bar */}
      {fuelPct !== null && (
        <div>
          <div className="flex justify-between mb-1">
            <span className="font-pixel text-xs text-white/40">FUEL</span>
            <span className="font-pixel text-xs" style={{ color: fuelColor }}>
              {fuelPct.toFixed(0)}%
            </span>
          </div>
          <div className="h-3 bg-space-800 border border-white/10">
            <div
              className="h-full transition-all duration-300"
              style={{ width: `${fuelPct}%`, backgroundColor: fuelColor }}
            />
          </div>
        </div>
      )}

      {/* Refuel button */}
      {canRefuel && (
        <PixelButton
          variant="green"
          small
          onClick={(e) => { e.stopPropagation(); onRefuel(id) }}
          disabled={score < 100}
          className="w-full text-center"
        >
          {score < 100 ? 'NEED 100 PTS TO REFUEL' : '⛽ REFUEL (−100 PTS)'}
        </PixelButton>
      )}
    </motion.div>
  )
}
