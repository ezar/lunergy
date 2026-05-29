import type { Conditions } from '../../types'

interface ConditionPillProps {
  conditions: Conditions
}

export function ConditionPill({ conditions }: ConditionPillProps) {
  return (
    <div className="flex flex-wrap gap-1 items-center">
      <Pill
        label={conditions.phase === 'day' ? '☀ DAY' : '☽ NIGHT'}
        color={conditions.phase === 'day' ? '#ffcc33' : '#aabbff'}
      />
      {conditions.storm && <Pill label="⛈ STORM" color="#ff8844" />}
      {conditions.temp === 'cold' && <Pill label="❄ COLD" color="#66e0ff" />}
      {conditions.temp === 'hot' && <Pill label="🔥 HEAT" color="#ff4d4d" />}
    </div>
  )
}

function Pill({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="font-pixel text-[0.42rem] px-2 py-0.5 border"
      style={{ color, borderColor: color + '88', backgroundColor: color + '18' }}
    >
      {label}
    </span>
  )
}
