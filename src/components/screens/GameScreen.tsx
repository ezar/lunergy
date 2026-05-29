import { useGameStore, getNetKwh } from '../../store/useGameStore'
import { useGameLoop } from '../../hooks/useGameLoop'
import { useAudio } from '../../hooks/useAudio'
import { StarCanvas } from '../ui/StarCanvas'
import { TopHUD } from '../game/TopHUD'
import { EnergyBar } from '../game/EnergyBar'
import { MoonBase } from '../game/MoonBase'
import { SourceCard } from '../game/SourceCard'
import { EventBanner } from '../game/EventBanner'
import { ConditionHintBanner } from '../game/ConditionHintBanner'
import { HintBanner } from '../game/HintBanner'
import { EventLog } from '../game/EventLog'
import { FactToast } from '../game/FactToast'
import type { SourceId } from '../../types'
import { SOURCES } from '../../lib/constants'

export function GameScreen() {
  useGameLoop()
  const { playSound } = useAudio()

  const energy = useGameStore(s => s.energy)
  const score = useGameStore(s => s.score)
  const time = useGameStore(s => s.time)
  const conditions = useGameStore(s => s.conditions)
  const sourceStates = useGameStore(s => s.sourceStates)
  const events = useGameStore(s => s.events)
  const activeEventLabel = useGameStore(s => s.activeEventLabel)
  const nextShiftIn = useGameStore(s => s.nextShiftIn)
  const phaseIndex = useGameStore(s => s.phaseIndex)
  const factSource = useGameStore(s => s.factSource)
  const factText = useGameStore(s => s.factText)
  const conditionHint = useGameStore(s => s.conditionHint)
  const toggleSource = useGameStore(s => s.toggleSource)
  const refuel = useGameStore(s => s.refuel)

  const netKwh = getNetKwh(sourceStates, conditions, phaseIndex)

  const handleToggle = (id: SourceId) => {
    const wasOn = sourceStates[id].on
    toggleSource(id)
    playSound(wasOn ? 'powerOff' : 'powerOn')
  }

  const handleRefuel = (id: SourceId) => {
    refuel(id)
    playSound('refuel')
  }

  return (
    <div className="relative w-full h-full flex flex-col bg-space-950 overflow-hidden">
      {/* Background */}
      <StarCanvas className="opacity-50" />

      {/* All content above canvas */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Top HUD */}
        <TopHUD
          score={score}
          time={time}
          conditions={conditions}
          nextShiftIn={nextShiftIn}
          phaseIndex={phaseIndex}
        />

        {/* Energy bar */}
        <EnergyBar energy={energy} netKwh={netKwh} />

        {/* Event banner */}
        <EventBanner label={activeEventLabel} />

        {/* Condition hint — explains what the condition means */}
        <ConditionHintBanner hint={conditionHint} />

        {/* Main content area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: moon base + sources */}
          <div className="flex flex-col flex-1 overflow-y-auto px-4 py-3 gap-4">
            {/* Contextual gameplay hints */}
            <HintBanner energy={energy} conditions={conditions} sourceStates={sourceStates} />

            {/* Moon base */}
            <MoonBase energy={energy} />

            {/* Source grid */}
            <div className="grid grid-cols-2 gap-3 pb-4">
              {SOURCES.map(src => (
                <SourceCard
                  key={src.id}
                  id={src.id}
                  state={sourceStates[src.id]}
                  conditions={conditions}
                  score={score}
                  onToggle={handleToggle}
                  onRefuel={handleRefuel}
                />
              ))}
            </div>
          </div>

          {/* Right: event log (desktop only) */}
          <div className="hidden lg:flex w-56 flex-col shrink-0 p-2">
            <EventLog events={events} />
          </div>
        </div>
      </div>

      {/* Fact toast overlay */}
      <FactToast factSource={factSource} factText={factText} />
    </div>
  )
}
