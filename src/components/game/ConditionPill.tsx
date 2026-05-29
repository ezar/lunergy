import type { Conditions } from '../../types'

interface ConditionPillProps {
  conditions: Conditions
}

export function ConditionPill({ conditions }: ConditionPillProps) {
  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      <Pill
        label={conditions.phase === 'day' ? '☀ LUNAR DAY' : '☽ LUNAR NIGHT'}
        color={conditions.phase === 'day' ? '#ffcc33' : '#aabbff'}
      />
      {conditions.storm && <Pill label="⛈ DUST STORM" color="#ff8844" blink />}
      {conditions.temp === 'cold' && <Pill label="❄ -130°C" color="#66e0ff" />}
      {conditions.temp === 'hot' && <Pill label="🔥 +120°C" color="#ff4d4d" />}
    </div>
  )
}

function Pill({ label, color, blink = false }: { label: string; color: string; blink?: boolean }) {
  return (
    <span
      className={`font-pixel text-xs px-2.5 py-1 border ${blink ? 'animate-blink-slow' : ''}`}
      style={{ color, borderColor: color + '88', backgroundColor: color + '18' }}
    >
      {label}
    </span>
  )
}
