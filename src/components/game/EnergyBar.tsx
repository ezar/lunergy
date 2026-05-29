import { motion } from 'framer-motion'
import { energyColor } from '../../lib/utils'

interface EnergyBarProps {
  energy: number
  netKwh: number
}

export function EnergyBar({ energy, netKwh }: EnergyBarProps) {
  const color = energyColor(energy)
  const isCritical = energy < 30
  const isLow = energy < 60

  return (
    <div className="px-4 py-2">
      <div className="flex items-center justify-between mb-1">
        <span className="font-pixel text-[0.5rem] text-white/70">BASE POWER</span>
        <div className="flex items-center gap-3">
          <span
            className={`font-pixel text-[0.55rem] ${isCritical ? 'text-pixel-red animate-blink' : isLow ? 'text-gold' : 'text-pixel-green'}`}
          >
            {energy.toFixed(1)}%
          </span>
          <span
            className={`font-vt text-base ${netKwh >= 0 ? 'text-pixel-green' : 'text-pixel-red'}`}
          >
            {netKwh >= 0 ? '+' : ''}{netKwh.toFixed(1)} kWh/s
          </span>
        </div>
      </div>

      {/* Track */}
      <div className="relative h-4 bg-space-800 border border-white/20 overflow-hidden">
        {/* Segment lines */}
        {[25, 50, 75].map(pct => (
          <div
            key={pct}
            className="absolute top-0 bottom-0 w-px bg-white/10"
            style={{ left: `${pct}%` }}
          />
        ))}

        {/* Fill */}
        <motion.div
          className="h-full"
          style={{ backgroundColor: color }}
          animate={{ width: `${energy}%` }}
          transition={{ duration: 0.15, ease: 'linear' }}
        />

        {/* Glow overlay */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${color}55 ${energy}%, transparent ${energy}%)`,
          }}
        />
      </div>

      {/* Critical warning */}
      {isCritical && (
        <p className="font-pixel text-[0.45rem] text-pixel-red animate-blink mt-1 text-center">
          ⚠ CRITICAL POWER — ACTIVATE MORE SOURCES
        </p>
      )}
    </div>
  )
}
