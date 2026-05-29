import { AnimatePresence, motion } from 'framer-motion'
import type { Conditions, SourceId, SourceState } from '../../types'
import { SOURCES, getEffectiveOutput } from '../../lib/constants'

interface HintBannerProps {
  energy: number
  conditions: Conditions
  sourceStates: Record<SourceId, SourceState>
}

function getHint(
  energy: number,
  conditions: Conditions,
  sourceStates: Record<SourceId, SourceState>,
): string | null {
  // Solar ON at night — generates nothing
  const solarOn = sourceStates['solar'].on
  const solarOutput = getEffectiveOutput('solar', conditions)
  if (solarOn && solarOutput === 0 && energy < 70) {
    return '💡 Solar gives 0 power right now! Turn it OFF and activate Fusion or Helium-3.'
  }

  // All active sources combined output is 0 (e.g., only solar on during night)
  const totalOutput = SOURCES.reduce((sum, src) => {
    const ss = sourceStates[src.id]
    if (!ss.on) return sum
    if (src.fuelMax !== null && ss.fuel !== null && ss.fuel <= 0) return sum
    return sum + getEffectiveOutput(src.id, conditions)
  }, 0)
  if (totalOutput === 0 && energy < 60) {
    return '⚠ No sources generating power! Activate Fusion or Helium-3 immediately.'
  }

  // Energy critically low — at least one source available to turn on
  const availableOff = SOURCES.filter(src => {
    const ss = sourceStates[src.id]
    if (ss.on) return false
    if (src.fuelMax !== null && ss.fuel !== null && ss.fuel <= 0) return false
    return getEffectiveOutput(src.id, conditions) > 0
  })
  if (energy < 35 && availableOff.length > 0) {
    const names = availableOff.map(s => s.short).join(', ')
    return `💡 Energy critical! Turn on ${names} to stop the drop.`
  }
  if (energy < 55 && availableOff.length > 0) {
    return `💡 Energy dropping — activate more sources to stabilise.`
  }

  return null
}

export function HintBanner({ energy, conditions, sourceStates }: HintBannerProps) {
  const hint = getHint(energy, conditions, sourceStates)

  return (
    <AnimatePresence>
      {hint && (
        <motion.div
          key={hint}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.3 }}
          className="mx-4 mt-2 bg-gold/10 border border-gold/40 px-4 py-2 text-center"
        >
          <p className="font-vt text-lg text-gold">{hint}</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
