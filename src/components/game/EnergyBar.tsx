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
    <div className="px-5 py-3 bg-space-900/60 border-b border-white/10">
      <div className="flex items-center justify-between mb-2">
        <span className="font-pixel text-sm text-white/70">⚡ BASE POWER</span>
        <div className="flex items-center gap-4">
          <span
            className={`font-pixel text-base ${isCritical ? 'text-pixel-red animate-blink' : isLow ? 'text-gold' : 'text-pixel-green'}`}
          >
            {energy.toFixed(1)}%
          </span>
          <span
            className={`font-vt text-2xl font-bold ${netKwh >= 0 ? 'text-pixel-green' : 'text-pixel-red'}`}
          >
            {netKwh >= 0 ? '+' : ''}{netKwh.toFixed(1)} kWh/s
          </span>
        </div>
      </div>

      {/* Track */}
      <div className="relative h-7 bg-space-800 border border-white/20 overflow-hidden">
        {[25, 50, 75].map(pct => (
          <div
            key={pct}
            className="absolute top-0 bottom-0 w-px bg-white/10"
            style={{ left: `${pct}%` }}
          />
        ))}

        <motion.div
          className="h-full"
          style={{ backgroundColor: color }}
          animate={{ width: `${energy}%` }}
          transition={{ duration: 0.15, ease: 'linear' }}
        />

        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${color}55 ${energy}%, transparent ${energy}%)`,
          }}
        />

        {/* Percentage labels */}
        {[25, 50, 75].map(pct => (
          <span
            key={pct}
            className="absolute top-1/2 -translate-y-1/2 font-pixel text-[0.55rem] text-white/20"
            style={{ left: `${pct}%`, transform: 'translateX(-50%) translateY(-50%)' }}
          >
            {pct}%
          </span>
        ))}
      </div>

      {isCritical && (
        <p className="font-pixel text-xs text-pixel-red animate-blink mt-2 text-center">
          ⚠ CRITICAL — ACTIVATE MORE SOURCES NOW!
        </p>
      )}
    </div>
  )
}
