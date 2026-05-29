let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function playTone(
  freq: number,
  type: OscillatorType,
  duration: number,
  gainVal: number,
  freqEnd?: number,
): void {
  const ac = getCtx()
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.connect(gain)
  gain.connect(ac.destination)
  osc.type = type
  osc.frequency.setValueAtTime(freq, ac.currentTime)
  if (freqEnd !== undefined) {
    osc.frequency.linearRampToValueAtTime(freqEnd, ac.currentTime + duration)
  }
  gain.gain.setValueAtTime(gainVal, ac.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration)
  osc.start(ac.currentTime)
  osc.stop(ac.currentTime + duration)
}

function playNoise(duration: number, gainVal: number, filterFreq: number): void {
  const ac = getCtx()
  const bufferSize = Math.floor(ac.sampleRate * duration)
  const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1

  const source = ac.createBufferSource()
  source.buffer = buffer

  const filter = ac.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = filterFreq
  filter.Q.value = 0.5

  const gain = ac.createGain()
  gain.gain.setValueAtTime(gainVal, ac.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration)

  source.connect(filter)
  filter.connect(gain)
  gain.connect(ac.destination)
  source.start(ac.currentTime)
}

export type SoundId =
  | 'click'
  | 'powerOn'
  | 'powerOff'
  | 'alarm'
  | 'refuel'
  | 'conditionChange'
  | 'gameOver'
  | 'start'
  | 'phaseUp'

export function play(id: SoundId): void {
  try {
    switch (id) {
      case 'click':
        playTone(440, 'square', 0.06, 0.18)
        break
      case 'powerOn':
        playTone(220, 'sawtooth', 0.12, 0.15, 660)
        setTimeout(() => playTone(880, 'square', 0.08, 0.1), 120)
        break
      case 'powerOff':
        playTone(440, 'sawtooth', 0.15, 0.12, 110)
        break
      case 'alarm':
        playTone(880, 'square', 0.15, 0.22)
        setTimeout(() => playTone(660, 'square', 0.15, 0.22), 180)
        break
      case 'refuel':
        playTone(330, 'sine', 0.05, 0.08)
        setTimeout(() => playTone(440, 'sine', 0.05, 0.08), 60)
        setTimeout(() => playTone(550, 'sine', 0.05, 0.08), 120)
        setTimeout(() => playTone(660, 'sine', 0.1, 0.1), 180)
        break
      case 'conditionChange':
        playTone(550, 'triangle', 0.2, 0.12)
        setTimeout(() => playTone(440, 'triangle', 0.2, 0.09), 220)
        break
      case 'gameOver':
        playTone(440, 'sawtooth', 0.3, 0.2, 110)
        setTimeout(() => playNoise(0.8, 0.15, 200), 300)
        break
      case 'start':
        playTone(330, 'square', 0.08, 0.14)
        setTimeout(() => playTone(440, 'square', 0.08, 0.14), 90)
        setTimeout(() => playTone(660, 'square', 0.15, 0.18), 180)
        break
      case 'phaseUp':
        playTone(880, 'square', 0.08, 0.16)
        setTimeout(() => playTone(1100, 'square', 0.12, 0.16), 100)
        break
    }
  } catch {
    // Audio errors are non-fatal
  }
}
