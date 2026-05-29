import { motion } from 'framer-motion'
import { StarCanvas } from '../ui/StarCanvas'
import { PixelButton } from '../ui/PixelButton'
import { Panel } from '../ui/Panel'
import { useGameStore } from '../../store/useGameStore'
import { useAudio } from '../../hooks/useAudio'
import { SOURCES, PHASES } from '../../lib/constants'

export function BriefingScreen() {
  const startGame = useGameStore(s => s.startGame)
  const goTo = useGameStore(s => s.goTo)
  const { playSound } = useAudio()

  const handleStart = () => {
    playSound('start')
    startGame()
  }

  const handleBack = () => {
    playSound('click')
    goTo('title')
  }

  return (
    <div className="relative w-full h-full overflow-y-auto bg-space-950">
      <StarCanvas className="opacity-40" />
      <div className="relative z-10 max-w-2xl mx-auto p-6 flex flex-col gap-5">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <h2 className="font-pixel text-sm text-gold mb-1">MISSION BRIEFING</h2>
          <p className="font-vt text-base text-white/60">Commander, your lunar base needs constant power.</p>
        </motion.div>

        {/* Objective */}
        <Panel className="p-4">
          <h3 className="font-pixel text-[0.5rem] text-cyan mb-3">OBJECTIVE</h3>
          <ul className="font-vt text-sm text-white/70 space-y-1.5 list-none">
            <li>▶ Keep base energy above 0% for as long as possible</li>
            <li>▶ Toggle energy sources ON/OFF to manage power</li>
            <li>▶ Conditions change every 15 seconds — adapt!</li>
            <li>▶ Fuelled sources drain over time — refuel when low</li>
            <li>▶ Difficulty increases across 4 phases</li>
          </ul>
        </Panel>

        {/* Energy sources */}
        <div>
          <h3 className="font-pixel text-[0.5rem] text-gold mb-3">ENERGY SOURCES</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SOURCES.map((src, i) => (
              <motion.div
                key={src.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
              >
                <Panel className="p-3" glow={src.color}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-lg" style={{ color: src.color }}>{src.icon}</span>
                    <span className="font-pixel text-[0.45rem]" style={{ color: src.color }}>{src.name}</span>
                  </div>
                  <div className="font-vt text-sm text-white/70 space-y-0.5">
                    <div>Base output: <span className="text-white">{src.baseOutput} kWh/s</span></div>
                    {src.fuelMax !== null && (
                      <div>Fuel: <span className="text-white">drains over time (refuel = 100 pts)</span></div>
                    )}
                    <div className="text-[0.7rem] text-white/50 mt-1">
                      {src.id === 'solar' && '×2.4 day · ×0 night · ×0.2 storm'}
                      {src.id === 'fusion' && 'Stable · ×0.85 solar heat'}
                      {src.id === 'helium3' && 'High output · ×0.6 extreme cold · fast fuel drain'}
                      {src.id === 'methane' && 'Reliable · ×0.55 extreme cold'}
                    </div>
                  </div>
                </Panel>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Phases */}
        <Panel className="p-4">
          <h3 className="font-pixel text-[0.5rem] text-pixel-red mb-3">DIFFICULTY PHASES</h3>
          <div className="space-y-1.5">
            {PHASES.map((p, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="font-pixel text-[0.42rem] text-white/60">{p.name}</span>
                <span className="font-vt text-sm text-pixel-red">{p.consumption} kWh/s drain</span>
              </div>
            ))}
          </div>
        </Panel>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <PixelButton onClick={handleBack} variant="ghost">
            BACK
          </PixelButton>
          <PixelButton onClick={handleStart} variant="gold">
            BEGIN MISSION
          </PixelButton>
        </div>
      </div>
    </div>
  )
}
