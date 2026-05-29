import type { SourceDef, PhaseConfig, Conditions, SourceId } from '../types'

export const SOURCES: SourceDef[] = [
  {
    id: 'solar',
    name: 'SOLAR PANELS',
    short: 'SOLAR',
    icon: '☀',
    color: '#ffcc33',
    baseOutput: 18,
    drainRate: 0,
    fuelMax: null,
    facts: [
      "A lunar day lasts 14 Earth-days with no atmosphere. Each m² of panel captures up to 1,366 W of sunlight — nearly double Earth's surface output.",
      "Solar panels on the Moon must endure temperature swings from +250°C in sunlight to -130°C in shadow — an engineering challenge unlike any on Earth.",
      "NASA's Artemis base camp plans to use solar arrays on permanently lit crater rims near the lunar south pole to generate power continuously.",
    ],
    modifiers: {
      day: 2.4,
      night: 0.0,
      storm: 0.2,
      cold: 1.0,
      hot: 1.1,
    },
  },
  {
    id: 'fusion',
    name: 'NUCLEAR FUSION',
    short: 'FUSION',
    icon: '⚛',
    color: '#66e0ff',
    baseOutput: 11,
    drainRate: 0.5,
    fuelMax: 100,
    facts: [
      "Nuclear fusion recreates the energy of the Sun. 1 gram of deuterium-tritium fuel can equal the energy of 8 tons of oil — ideal for long lunar missions.",
      "Unlike fission, fusion produces no long-lived radioactive waste. The primary byproduct is helium — a harmless, inert gas.",
      "The ITER fusion reactor in France aims to produce 500 MW from just 50 MW of input — a Q=10 gain factor that could power humanity for millennia.",
    ],
    modifiers: {
      day: 1.0,
      night: 1.0,
      storm: 1.0,
      cold: 1.0,
      hot: 0.85,
    },
  },
  {
    id: 'helium3',
    name: 'HELIUM-3 REACTOR',
    short: 'HELIUM-3',
    icon: '◆',
    color: '#ff99cc',
    baseOutput: 14,
    drainRate: 1.4,
    fuelMax: 60,
    facts: [
      "Helium-3 is exceedingly rare on Earth but abundant in lunar regolith — about 1.1 million tonnes sit on the Moon's surface. Just 1 tonne could power a city for a year.",
      "Helium-3 fusion produces no radioactive neutrons, making it the cleanest possible fusion reaction. The Moon may hold enough He-3 to power Earth for 10,000 years.",
      "China's Chang'e programme has specifically targeted Helium-3 extraction as a strategic resource for future fusion energy on Earth.",
    ],
    modifiers: {
      day: 1.0,
      night: 1.0,
      storm: 1.0,
      cold: 0.6,
      hot: 1.0,
    },
  },
  {
    id: 'methane',
    name: 'METHANE BURNER',
    short: 'METHANE',
    icon: '♨',
    color: '#33ff88',
    baseOutput: 7,
    drainRate: 0.9,
    fuelMax: 80,
    facts: [
      "Methane (CH₄) can be synthesised on the Moon by combining hydrogen from water ice with carbon extracted from regolith — making it a locally-sourced fuel.",
      "SpaceX's Starship uses methane engines (Raptor) because methane can be manufactured on Mars and the Moon, enabling interplanetary refuelling.",
      "Methane has an energy density of 55.5 MJ/kg — higher than many traditional fuels — while remaining storable as a liquid at relatively mild temperatures.",
    ],
    modifiers: {
      day: 1.0,
      night: 1.0,
      storm: 1.0,
      cold: 0.55,
      hot: 1.0,
    },
  },
]

export const PHASES: PhaseConfig[] = [
  { fromSeconds: 0,  consumption: 7,  name: 'PHASE 1: CONTACT' },
  { fromSeconds: 30, consumption: 11, name: 'PHASE 2: ESTABLISHMENT' },
  { fromSeconds: 60, consumption: 16, name: 'PHASE 3: EXPANSION' },
  { fromSeconds: 90, consumption: 22, name: 'PHASE 4: SURVIVAL' },
]

export const GAME_OVER_MESSAGES: string[] = [
  'The base did not survive. Study the energy sources and try again!',
  'Good attempt! Try combining sources more effectively.',
  'So close! Lunar expansion demands constant power.',
  'OUTSTANDING! You are a certified lunar energy commander.',
]

export const INITIAL_ENERGY = 70
export const BASE_CONSUMPTION = 7

export function rollConditions(prev?: Conditions): Conditions {
  const phase = Math.random() < 0.45
    ? (prev?.phase === 'day' ? 'night' : 'day')
    : (prev?.phase ?? 'day')
  const storm = Math.random() < 0.28
  const tempRoll = Math.random()
  let temp: Conditions['temp']
  if (phase === 'night' && tempRoll < 0.6) temp = 'cold'
  else if (phase === 'day' && tempRoll < 0.35) temp = 'hot'
  else temp = 'normal'
  return { phase, storm, temp }
}

export function getEffectiveMultiplier(id: SourceId, conditions: Conditions): number {
  const src = SOURCES.find(s => s.id === id)
  if (!src) return 1
  const m = src.modifiers
  let mult = conditions.phase === 'day' ? m.day : m.night
  if (conditions.storm) mult *= m.storm
  if (conditions.temp === 'cold') mult *= m.cold
  if (conditions.temp === 'hot') mult *= m.hot
  return mult
}

export function getEffectiveOutput(id: SourceId, conditions: Conditions): number {
  const src = SOURCES.find(s => s.id === id)
  if (!src) return 0
  return src.baseOutput * getEffectiveMultiplier(id, conditions)
}

export function getPhaseIndex(time: number): number {
  let idx = 0
  for (let i = PHASES.length - 1; i >= 0; i--) {
    if (time >= PHASES[i].fromSeconds) { idx = i; break }
  }
  return idx
}
