export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function formatTime(seconds: number): string {
  const s = Math.floor(seconds)
  const mm = String(Math.floor(s / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return `${mm}:${ss}`
}

export function padScore(score: number): string {
  return String(Math.floor(score)).padStart(6, '0')
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function seededRng(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

export function energyColor(energy: number): string {
  if (energy > 60) return '#33ff88'
  if (energy > 30) return '#ffcc33'
  return '#ff4d4d'
}
