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

  const fuelColor =
    fuelPct === null
      ? '#33ff88'
      : fuelPct > 50
      ? '#33ff88'
      : fuelPct > 20
      ? '#ffcc33'
      : '#ff4d4d'

  return (
    <motion.div
      animate={isOn ? { boxShadow: [`0 0 8px ${src.color}55`, `0 0 20px ${src.color}88`, `0 0 8px ${src.color}55`] } : { boxShadow: '0 0 0px transparent' }}
      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      className={[
        'border p-3 flex flex-col gap-2 cursor-pointer select-none transition-colors duration-200',
        isOn
          ? 'bg-space-800/80 border-opacity-70'
          : 'bg-space-950/60 border-white/10',
        noFuel ? 'opacity-60' : '',
      ].join(' ')}
      style={{
        borderColor: isOn ? src.color + 'aa' : undefined,
      }}
      onClick={() => { if (!noFuel || isOn) onToggle(id) }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg" style={{ color: src.color }}>{src.icon}</span>
          <span className="font-pixel text-[0.45rem]" style={{ color: src.color }}>
            {src.short}
          </span>
        </div>
        <div
          className={[
            'font-pixel text-[0.42rem] px-2 py-0.5 border',
            isOn ? 'animate-pulse-glow' : '',
          ].join(' ')}
          style={{
            color: isOn ? '#33ff88' : '#ff4d4d',
            borderColor: isOn ? '#33ff8866' : '#ff4d4d66',
            backgroundColor: isOn ? '#33ff8811' : '#ff4d4d11',
          }}
        >
          {noFuel ? 'NO FUEL' : isOn ? 'ON' : 'OFF'}
        </div>
      </div>

      {/* Output */}
      <div className="flex items-baseline gap-1">
        <span className="font-vt text-xl" style={{ color: isOn ? src.color : '#444' }}>
          {isOn ? effectiveOutput.toFixed(1) : src.baseOutput.toFixed(1)}
        </span>
        <span className="font-pixel text-[0.38rem] text-white/40">kWh/s</span>
        {isOn && isModified && (
          <span
            className="font-pixel text-[0.38rem] ml-1"
            style={{ color: multiplier >= 1 ? '#33ff88' : '#ff4d4d' }}
          >
            ×{multiplier.toFixed(2)}
          </span>
        )}
      </div>

      {/* Fuel bar */}
      {fuelPct !== null && (
        <div>
          <div className="flex justify-between mb-0.5">
            <span className="font-pixel text-[0.38rem] text-white/40">FUEL</span>
            <span className="font-pixel text-[0.38rem]" style={{ color: fuelColor }}>
              {fuelPct.toFixed(0)}%
            </span>
          </div>
          <div className="h-1.5 bg-space-800 border border-white/10">
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
          REFUEL (-100 PTS)
        </PixelButton>
      )}
    </motion.div>
  )
}
