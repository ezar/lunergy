import { useRef } from 'react'
import { useBackground } from '../../hooks/useBackground'

interface StarCanvasProps {
  className?: string
}

export function StarCanvas({ className = '' }: StarCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  useBackground(canvasRef)

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ imageRendering: 'pixelated' }}
    />
  )
}
