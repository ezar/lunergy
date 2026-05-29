import type { LogEvent } from '../../types'
import { formatTime } from '../../lib/utils'

interface EventLogProps {
  events: LogEvent[]
}

export function EventLog({ events }: EventLogProps) {
  return (
    <div className="bg-space-950/70 border border-white/10 p-2 h-full overflow-hidden">
      <p className="font-pixel text-[0.42rem] text-white/40 mb-2 border-b border-white/10 pb-1">
        EVENT LOG
      </p>
      <div className="space-y-1 overflow-y-auto max-h-[calc(100%-2rem)]">
        {events.map((ev, i) => (
          <div key={i} className="flex gap-1.5 items-start">
            <span className="font-vt text-xs text-white/30 shrink-0">
              {formatTime(ev.t)}
            </span>
            <span
              className="font-vt text-xs leading-tight"
              style={{ color: ev.color }}
            >
              {ev.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
