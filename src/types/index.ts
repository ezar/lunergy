export type Screen = 'title' | 'briefing' | 'game' | 'gameover'

export type SourceId = 'solar' | 'fusion' | 'helium3' | 'methane'

export type ConditionPhase = 'day' | 'night'
export type ConditionTemp = 'normal' | 'cold' | 'hot'

export interface Conditions {
  phase: ConditionPhase
  storm: boolean
  temp: ConditionTemp
}

export interface SourceModifiers {
  day: number
  night: number
  storm: number
  cold: number
  hot: number
}

export interface SourceDef {
  id: SourceId
  name: string
  short: string
  icon: string
  color: string
  baseOutput: number
  drainRate: number
  fuelMax: number | null
  facts: string[]
  modifiers: SourceModifiers
}

export interface SourceState {
  on: boolean
  fuel: number | null
}

export interface LogEvent {
  t: number
  text: string
  color: string
}

export interface GameEvent {
  id: string
  label: string
  probability: number
}

export interface PhaseConfig {
  fromSeconds: number
  consumption: number
  name: string
}

export interface GameResult {
  time: number
  score: number
}
