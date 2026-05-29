
interface MoonBaseProps {
  energy: number
}

export function MoonBase({ energy }: MoonBaseProps) {
  const isCritical = energy < 30
  const isDanger = energy < 60

  const domeColor = isCritical
    ? '#ff4d4d'
    : isDanger
    ? '#ffcc33'
    : '#66e0ff'

  const glowColor = isCritical ? '#ff4d4d' : isDanger ? '#ffcc3388' : '#66e0ff44'

  return (
    <div
      className={`flex flex-col items-center py-2 ${isCritical ? 'animate-shake' : ''}`}
      aria-label="Moon Base"
    >
      <div
        className="relative"
        style={{ filter: `drop-shadow(0 0 12px ${glowColor})` }}
      >
        {/* Pixel art moon base — CSS grid */}
        <div className="flex flex-col items-center gap-0">
          {/* Antenna */}
          <div className="flex gap-1 mb-0.5">
            <div className="w-px h-3" style={{ backgroundColor: domeColor }} />
            <div
              className="w-1 h-1 rounded-full"
              style={{ backgroundColor: domeColor, marginTop: '-2px' }}
            />
            <div className="w-px h-3" style={{ backgroundColor: domeColor }} />
          </div>

          {/* Dome top */}
          <div className="flex">
            {[0, 1, 2, 3, 4].map(i => (
              <div
                key={i}
                className={`w-3 h-3 ${i === 0 || i === 4 ? 'opacity-0' : i === 2 ? 'opacity-100' : 'opacity-90'}`}
                style={{
                  backgroundColor: domeColor,
                  borderRadius: i === 2 ? '50% 50% 0 0' : '0',
                }}
              />
            ))}
          </div>

          {/* Dome body */}
          <div className="flex">
            {[1, 1, 1, 1, 1, 1, 1].map((_, i) => (
              <div
                key={i}
                className="w-3 h-3"
                style={{
                  backgroundColor: domeColor,
                  opacity: i === 0 || i === 6 ? 0.3 : 0.85,
                }}
              />
            ))}
          </div>

          {/* Window row */}
          <div className="flex">
            {[1, 1, 1, 1, 1, 1, 1].map((_, i) => (
              <div
                key={i}
                className="w-3 h-3"
                style={{
                  backgroundColor:
                    i === 2 || i === 4
                      ? isCritical
                        ? '#ff000088'
                        : '#aaddff88'
                      : domeColor,
                  opacity: i === 0 || i === 6 ? 0.3 : 1,
                  border: (i === 2 || i === 4) ? '1px solid rgba(255,255,255,0.4)' : 'none',
                }}
              />
            ))}
          </div>

          {/* Base platform */}
          <div className="flex">
            {[0, 1, 1, 1, 1, 1, 1, 1, 0].map((v, i) => (
              <div
                key={i}
                className="w-3 h-2"
                style={{
                  backgroundColor: v ? '#334466' : 'transparent',
                  opacity: 0.9,
                }}
              />
            ))}
          </div>

          {/* Landing legs */}
          <div className="flex gap-6">
            <div className="w-1 h-2 bg-white/30" />
            <div className="w-1 h-2 bg-white/30" />
          </div>
        </div>

        {/* Power indicator light */}
        <div
          className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${isCritical ? 'animate-blink' : ''}`}
          style={{
            backgroundColor: isCritical ? '#ff4d4d' : isDanger ? '#ffcc33' : '#33ff88',
            boxShadow: `0 0 6px ${isCritical ? '#ff4d4d' : isDanger ? '#ffcc33' : '#33ff88'}`,
          }}
        />
      </div>
    </div>
  )
}
