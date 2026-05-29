import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  r: number
  twinkleSpeed: number
  twinklePhase: number
  color: string
}

interface Planet {
  x: number
  y: number
  r: number
  color: string
  ringColor: string | null
}

interface ShootingStar {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
}

function makeStars(w: number, h: number, count: number): Star[] {
  const colors = ['#ffffff', '#aaccff', '#ffeedd', '#ccffff', '#ffddcc']
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 1.8 + 0.3,
    twinkleSpeed: Math.random() * 2 + 0.5,
    twinklePhase: Math.random() * Math.PI * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
  }))
}

function makePlanets(w: number, h: number): Planet[] {
  return [
    {
      x: w * 0.82,
      y: h * 0.14,
      r: 22,
      color: '#3a5a8a',
      ringColor: '#5a7aaa',
    },
    {
      x: w * 0.12,
      y: h * 0.22,
      r: 12,
      color: '#8a4a2a',
      ringColor: null,
    },
  ]
}

export function useBackground(canvasRef: React.RefObject<HTMLCanvasElement | null>): void {
  const starsRef = useRef<Star[]>([])
  const planetsRef = useRef<Planet[]>([])
  const shootingStarsRef = useRef<ShootingStar[]>([])
  const rafRef = useRef<number | null>(null)
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      starsRef.current = makeStars(canvas.width, canvas.height, 250)
      planetsRef.current = makePlanets(canvas.width, canvas.height)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const draw = (timestamp: number) => {
      const dt = 0.016
      timeRef.current += dt
      const t = timeRef.current

      const w = canvas.width
      const h = canvas.height

      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, 0, h)
      grad.addColorStop(0, '#05030f')
      grad.addColorStop(0.6, '#0a0a2a')
      grad.addColorStop(1, '#0e1a4a')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)

      // Draw nebula blobs
      ctx.save()
      ctx.globalAlpha = 0.06
      const ng = ctx.createRadialGradient(w * 0.3, h * 0.4, 0, w * 0.3, h * 0.4, w * 0.35)
      ng.addColorStop(0, '#6a4cff')
      ng.addColorStop(1, 'transparent')
      ctx.fillStyle = ng
      ctx.fillRect(0, 0, w, h)
      const ng2 = ctx.createRadialGradient(w * 0.75, h * 0.25, 0, w * 0.75, h * 0.25, w * 0.28)
      ng2.addColorStop(0, '#ff66aa')
      ng2.addColorStop(1, 'transparent')
      ctx.fillStyle = ng2
      ctx.fillRect(0, 0, w, h)
      ctx.restore()

      // Stars
      for (const star of starsRef.current) {
        const twinkle = 0.5 + 0.5 * Math.sin(t * star.twinkleSpeed + star.twinklePhase)
        ctx.globalAlpha = 0.4 + 0.6 * twinkle
        ctx.fillStyle = star.color
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      // Planets
      for (const planet of planetsRef.current) {
        ctx.save()
        // Glow
        const pg = ctx.createRadialGradient(
          planet.x, planet.y, 0,
          planet.x, planet.y, planet.r * 2.5,
        )
        pg.addColorStop(0, planet.color + '44')
        pg.addColorStop(1, 'transparent')
        ctx.fillStyle = pg
        ctx.beginPath()
        ctx.arc(planet.x, planet.y, planet.r * 2.5, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = planet.color
        ctx.beginPath()
        ctx.arc(planet.x, planet.y, planet.r, 0, Math.PI * 2)
        ctx.fill()

        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.15)'
        ctx.beginPath()
        ctx.arc(planet.x - planet.r * 0.3, planet.y - planet.r * 0.3, planet.r * 0.5, 0, Math.PI * 2)
        ctx.fill()

        // Ring
        if (planet.ringColor) {
          ctx.strokeStyle = planet.ringColor
          ctx.lineWidth = 3
          ctx.globalAlpha = 0.5
          ctx.beginPath()
          ctx.ellipse(planet.x, planet.y, planet.r * 1.9, planet.r * 0.45, -0.3, 0, Math.PI * 2)
          ctx.stroke()
        }
        ctx.restore()
      }

      // Shooting stars
      if (Math.random() < 0.004) {
        shootingStarsRef.current.push({
          x: Math.random() * w,
          y: Math.random() * h * 0.4,
          vx: (Math.random() * 3 + 2) * (Math.random() < 0.5 ? 1 : -1),
          vy: Math.random() * 2 + 1,
          life: 0,
          maxLife: 40 + Math.random() * 20,
        })
      }

      shootingStarsRef.current = shootingStarsRef.current.filter(ss => {
        ss.x += ss.vx
        ss.y += ss.vy
        ss.life++
        const alpha = 1 - ss.life / ss.maxLife
        ctx.strokeStyle = `rgba(255,255,255,${alpha})`
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(ss.x, ss.y)
        ctx.lineTo(ss.x - ss.vx * 8, ss.y - ss.vy * 8)
        ctx.stroke()
        return ss.life < ss.maxLife
      })

      // Lunar surface silhouette
      ctx.fillStyle = '#0a0a1a'
      ctx.beginPath()
      ctx.moveTo(0, h)
      ctx.lineTo(0, h * 0.88)
      // crater bumps
      for (let x = 0; x <= w; x += w / 16) {
        const bumpH = h * 0.88 - Math.sin((x / w) * Math.PI * 3) * h * 0.025
        ctx.lineTo(x, bumpH)
      }
      ctx.lineTo(w, h * 0.88)
      ctx.lineTo(w, h)
      ctx.closePath()
      ctx.fill()

      void timestamp
      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      ro.disconnect()
    }
  }, [canvasRef])
}
