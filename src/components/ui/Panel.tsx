import React from 'react'

interface PanelProps {
  children: React.ReactNode
  className?: string
  glow?: string
}

export function Panel({ children, className = '', glow }: PanelProps) {
  const glowStyle = glow ? { boxShadow: `0 0 16px ${glow}44, inset 0 0 20px ${glow}11` } : {}
  return (
    <div
      className={`bg-space-900/80 border border-white/10 backdrop-blur-sm ${className}`}
      style={glowStyle}
    >
      {children}
    </div>
  )
}
