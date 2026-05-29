import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Screen,
  SourceId,
  SourceState,
  Conditions,
  LogEvent,
  GameResult,
} from '../types'
import {
  SOURCES,
  PHASES,
  INITIAL_ENERGY,
  rollConditions,
  getEffectiveOutput,
  getPhaseIndex,
} from '../lib/constants'
import { clamp } from '../lib/utils'

const CONDITION_INTERVAL = 15 // seconds
const REFUEL_COST = 100
const FUEL_REFILL_AMOUNT = 100

function initialSourceStates(): Record<SourceId, SourceState> {
  const result = {} as Record<SourceId, SourceState>
  for (const src of SOURCES) {
    result[src.id] = {
      on: src.id === 'solar',
      fuel: src.fuelMax,
    }
  }
  return result
}

export interface GameState {
  screen: Screen
  energy: number
  score: number
  time: number
  conditions: Conditions
  conditionTimer: number
  nextShiftIn: number
  sourceStates: Record<SourceId, SourceState>
  events: LogEvent[]
  activeEventLabel: string | null
  result: GameResult | null
  highScore: number
  phaseIndex: number
  factSource: SourceId | null
  factText: string | null
  factTimer: number

  // actions
  goTo: (screen: Screen) => void
  startGame: () => void
  endGame: () => void
  tick: (dt: number) => void
  toggleSource: (id: SourceId) => void
  refuel: (id: SourceId) => void
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      screen: 'title',
      energy: INITIAL_ENERGY,
      score: 0,
      time: 0,
      conditions: { phase: 'day', storm: false, temp: 'normal' },
      conditionTimer: 0,
      nextShiftIn: CONDITION_INTERVAL,
      sourceStates: initialSourceStates(),
      events: [],
      activeEventLabel: null,
      result: null,
      highScore: 0,
      phaseIndex: 0,
      factSource: null,
      factText: null,
      factTimer: 0,

      goTo: (screen) => set({ screen }),

      startGame: () => {
        const conditions = rollConditions()
        set({
          screen: 'game',
          energy: INITIAL_ENERGY,
          score: 0,
          time: 0,
          conditions,
          conditionTimer: 0,
          nextShiftIn: CONDITION_INTERVAL,
          sourceStates: initialSourceStates(),
          events: [],
          activeEventLabel: null,
          result: null,
          phaseIndex: 0,
          factSource: null,
          factText: null,
          factTimer: 0,
        })
      },

      endGame: () => {
        const { time, score, highScore } = get()
        const newHigh = Math.max(score, highScore)
        const result: GameResult = { time, score }
        set({
          screen: 'gameover',
          result,
          highScore: newHigh,
          activeEventLabel: null,
        })
      },

      tick: (dt: number) => {
        const state = get()
        if (state.screen !== 'game') return

        let {
          energy,
          score,
          time,
          conditions,
          conditionTimer,
          nextShiftIn,
          sourceStates,
          events,
          activeEventLabel,
          phaseIndex,
          factTimer,
        } = state

        // ── Time ──────────────────────────────────────────────────────────
        time += dt

        // ── Phase ─────────────────────────────────────────────────────────
        const newPhaseIndex = getPhaseIndex(time)
        let newEvents = events
        if (newPhaseIndex > phaseIndex) {
          const phase = PHASES[newPhaseIndex]
          newEvents = addLog(newEvents, `⚠ ${phase.name} — CONSUMPTION RISES`, '#ff4d4d', time)
        }

        // ── Condition timer ───────────────────────────────────────────────
        conditionTimer += dt
        let newConditions = conditions
        let newActiveEvent = activeEventLabel
        if (conditionTimer >= CONDITION_INTERVAL) {
          conditionTimer = 0
          newConditions = rollConditions(conditions)
          const label = describeConditions(newConditions)
          newActiveEvent = label
          newEvents = addLog(newEvents, `☽ CONDITIONS: ${label}`, '#66e0ff', time)
        }
        nextShiftIn = CONDITION_INTERVAL - conditionTimer

        // ── Net power ─────────────────────────────────────────────────────
        const consumption = PHASES[newPhaseIndex].consumption
        let generation = 0
        const newSourceStates = { ...sourceStates }

        for (const src of SOURCES) {
          const ss = sourceStates[src.id]
          if (!ss.on) continue
          // drain fuel
          if (src.fuelMax !== null && ss.fuel !== null) {
            const newFuel = Math.max(0, ss.fuel - src.drainRate * dt)
            newSourceStates[src.id] = { ...ss, fuel: newFuel }
            if (newFuel <= 0) {
              // auto shut off
              newSourceStates[src.id] = { on: false, fuel: 0 }
              newEvents = addLog(newEvents, `⚡ ${src.name} OUT OF FUEL — OFFLINE`, '#ffcc33', time)
              continue
            }
          }
          generation += getEffectiveOutput(src.id, newConditions)
        }

        const netDelta = (generation - consumption) * dt
        energy = clamp(energy + netDelta, 0, 100)

        // ── Score ─────────────────────────────────────────────────────────
        const efficiency = generation > 0 ? Math.min(generation / consumption, 2) : 0
        score += dt * (1 + efficiency * 0.5)

        // ── Fact timer ────────────────────────────────────────────────────
        let { factSource, factText } = state
        let newFactTimer = factTimer
        if (factTimer > 0) {
          newFactTimer = Math.max(0, factTimer - dt)
          if (newFactTimer <= 0) {
            factSource = null
            factText = null
          }
        }

        // ── Game over check ───────────────────────────────────────────────
        if (energy <= 0) {
          set({
            energy: 0,
            time,
            score,
            sourceStates: newSourceStates,
            events: newEvents,
            conditions: newConditions,
            conditionTimer,
            nextShiftIn,
            activeEventLabel: newActiveEvent,
            phaseIndex: newPhaseIndex,
            factSource,
            factText,
            factTimer: newFactTimer,
          })
          get().endGame()
          return
        }

        set({
          energy,
          score,
          time,
          sourceStates: newSourceStates,
          events: newEvents,
          conditions: newConditions,
          conditionTimer,
          nextShiftIn,
          activeEventLabel: newActiveEvent,
          phaseIndex: newPhaseIndex,
          factSource,
          factText,
          factTimer: newFactTimer,
        })
      },

      toggleSource: (id) => {
        const { sourceStates, conditions, events, time, score } = get()
        const ss = sourceStates[id]
        const src = SOURCES.find(s => s.id === id)
        if (!src) return

        // Cannot turn on if fuel is 0
        if (!ss.on && src.fuelMax !== null && ss.fuel === 0) return

        const newOn = !ss.on
        const newSourceStates = {
          ...sourceStates,
          [id]: { ...ss, on: newOn },
        }

        let newEvents = events
        let factSource: SourceId | null = null
        let factText: string | null = null
        let factTimer = 0

        if (newOn) {
          const output = getEffectiveOutput(id, conditions)
          newEvents = addLog(
            newEvents,
            `▶ ${src.name} ACTIVATED (+${output.toFixed(1)} kWh/s)`,
            src.color,
            time,
          )
          // Show educational fact
          const facts = src.facts
          const idx = Math.floor(Math.random() * facts.length)
          factSource = id
          factText = facts[idx]
          factTimer = 7
        } else {
          newEvents = addLog(
            newEvents,
            `■ ${src.name} DEACTIVATED`,
            '#888',
            time,
          )
        }

        set({ sourceStates: newSourceStates, events: newEvents, factSource, factText, factTimer, score })
      },

      refuel: (id) => {
        const { sourceStates, score, events, time } = get()
        if (score < REFUEL_COST) return
        const src = SOURCES.find(s => s.id === id)
        if (!src || src.fuelMax === null) return

        const ss = sourceStates[id]
        const newSourceStates = {
          ...sourceStates,
          [id]: { ...ss, fuel: src.fuelMax + FUEL_REFILL_AMOUNT > src.fuelMax ? src.fuelMax : ss.fuel },
        }
        // Actually just refill to max
        newSourceStates[id] = { ...ss, fuel: src.fuelMax }

        const newEvents = addLog(events, `⛽ ${src.name} REFUELLED (-${REFUEL_COST} pts)`, '#33ff88', time)
        set({
          sourceStates: newSourceStates,
          score: score - REFUEL_COST,
          events: newEvents,
        })
      },
    }),
    {
      name: 'lunergy-v1',
      partialize: (state) => ({ highScore: state.highScore }),
    },
  ),
)

function addLog(events: LogEvent[], text: string, color: string, t: number): LogEvent[] {
  return [{ t, text, color }, ...events].slice(0, 20)
}

function describeConditions(c: Conditions): string {
  const parts: string[] = []
  parts.push(c.phase === 'day' ? 'LUNAR DAY' : 'LUNAR NIGHT')
  if (c.storm) parts.push('DUST STORM')
  if (c.temp === 'cold') parts.push('EXTREME COLD')
  if (c.temp === 'hot') parts.push('SOLAR HEAT')
  return parts.join(' + ')
}

export function getNetKwh(
  sourceStates: Record<SourceId, SourceState>,
  conditions: Conditions,
  phaseIndex: number,
): number {
  const consumption = PHASES[phaseIndex].consumption
  let generation = 0
  for (const src of SOURCES) {
    const ss = sourceStates[src.id]
    if (ss.on && (src.fuelMax === null || (ss.fuel !== null && ss.fuel > 0))) {
      generation += getEffectiveOutput(src.id, conditions)
    }
  }
  return generation - consumption
}

export function getTotalGeneration(
  sourceStates: Record<SourceId, SourceState>,
  conditions: Conditions,
): number {
  let generation = 0
  for (const src of SOURCES) {
    const ss = sourceStates[src.id]
    if (ss.on && (src.fuelMax === null || (ss.fuel !== null && ss.fuel > 0))) {
      generation += getEffectiveOutput(src.id, conditions)
    }
  }
  return generation
}
