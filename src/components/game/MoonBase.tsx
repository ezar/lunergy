
interface MoonBaseProps {
  energy: number
}

export function MoonBase({ energy }: MoonBaseProps) {
  const isCritical = energy < 30
  const isDanger = energy < 60

  const domeColor = isCritical ? '#ff4d4d' : isDanger ? '#ffcc33' : '#66e0ff'
  const glowColor = isCritical ? '#ff4d4d' : isDanger ? '#ffcc3388' : '#66e0ff44'

  const px = 5 // pixel size in px

  return (
    <div
      className={`flex flex-col items-center py-3 ${isCritical ? 'animate-shake' : ''}`}
      aria-label="Moon Base"
    >
      <div className="relative" style={{ filter: `drop-shadow(0 0 16px ${glowColor})` }}>
        <div className="flex flex-col items-center gap-0">

          {/* Antenna */}
          <div className="flex gap-1.5 mb-1">
            <div style={{ width: px / 2, height: px * 4, backgroundColor: domeColor }} />
            <div style={{ width: px * 1.5, height: px * 1.5, borderRadius: '50%', backgroundColor: domeColor, marginTop: -px }} />
            <div style={{ width: px / 2, height: px * 4, backgroundColor: domeColor }} />
          </div>

          {/* Dome cap */}
          <div className="flex">
            {[0, 1, 2, 3, 4, 5, 6].map(i => (
              <div
                key={i}
                style={{
                  width: px * 1.5,
                  height: px * 1.5,
                  backgroundColor: [0, 1, 5, 6].includes(i) ? 'transparent' : domeColor,
                  borderRadius: i === 3 ? '50% 50% 0 0' : '0',
                  opacity: i === 2 || i === 4 ? 0.7 : 1,
                }}
              />
            ))}
          </div>

          {/* Dome body rows */}
          {[1, 2].map(row => (
            <div key={row} className="flex">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div
                  key={i}
                  style={{
                    width: px * 1.5,
                    height: px * 1.5,
                    backgroundColor: domeColor,
                    opacity: i === 0 || i === 8 ? 0.25 : 0.9,
                  }}
                />
              ))}
            </div>
          ))}

          {/* Window row */}
          <div className="flex">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => {
              const isWindow = i === 2 || i === 5
              return (
                <div
                  key={i}
                  style={{
                    width: px * 1.5,
                    height: px * 2,
                    backgroundColor: isWindow
                      ? isCritical ? '#ff000099' : '#aaddffaa'
                      : domeColor,
                    opacity: i === 0 || i === 8 ? 0.25 : 1,
                    border: isWindow ? '1px solid rgba(255,255,255,0.5)' : 'none',
                  }}
                />
              )
            })}
          </div>

          {/* Base platform */}
          <div className="flex">
            {[0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0].map((v, i) => (
              <div
                key={i}
                style={{
                  width: px * 1.5,
                  height: px,
                  backgroundColor: v ? '#334466' : 'transparent',
                  opacity: 0.9,
                }}
              />
            ))}
          </div>

          {/* Landing legs */}
          <div className="flex gap-10">
            <div style={{ width: px / 2, height: px * 3, backgroundColor: 'rgba(255,255,255,0.3)' }} />
            <div style={{ width: px / 2, height: px * 3, backgroundColor: 'rgba(255,255,255,0.3)' }} />
          </div>

          {/* Feet */}
          <div className="flex gap-8">
            <div style={{ width: px * 2, height: px / 2, backgroundColor: 'rgba(255,255,255,0.25)' }} />
            <div style={{ width: px * 2, height: px / 2, backgroundColor: 'rgba(255,255,255,0.25)' }} />
          </div>
        </div>

        {/* Status light */}
        <div
          className={`absolute -top-1 -right-2 rounded-full ${isCritical ? 'animate-blink' : ''}`}
          style={{
            width: px * 1.5,
            height: px * 1.5,
            backgroundColor: isCritical ? '#ff4d4d' : isDanger ? '#ffcc33' : '#33ff88',
            boxShadow: `0 0 8px ${isCritical ? '#ff4d4d' : isDanger ? '#ffcc33' : '#33ff88'}`,
          }}
        />
      </div>

      {/* Status label */}
      <p
        className={`font-pixel text-xs mt-3 ${isCritical ? 'text-pixel-red animate-blink' : isDanger ? 'text-gold' : 'text-pixel-green'}`}
      >
        {isCritical ? '⚠ CRITICAL' : isDanger ? '⚡ LOW POWER' : '✓ NOMINAL'}
      </p>
    </div>
  )
}
