import React from 'react'
import { motion } from 'framer-motion'

interface PixelButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  children: React.ReactNode
  variant?: 'gold' | 'cyan' | 'red' | 'green' | 'ghost'
  disabled?: boolean
  small?: boolean
  className?: string
}

const variantClasses: Record<string, string> = {
  gold: 'border-gold text-gold hover:bg-gold hover:text-space-950 shadow-[0_0_10px_#ffcc3388]',
  cyan: 'border-cyan text-cyan hover:bg-cyan hover:text-space-950 shadow-[0_0_10px_#66e0ff44]',
  red: 'border-pixel-red text-pixel-red hover:bg-pixel-red hover:text-white shadow-[0_0_10px_#ff4d4d44]',
  green: 'border-pixel-green text-pixel-green hover:bg-pixel-green hover:text-space-950 shadow-[0_0_10px_#33ff8844]',
  ghost: 'border-white/20 text-white/60 hover:border-white/50 hover:text-white',
}

export function PixelButton({
  onClick,
  children,
  variant = 'gold',
  disabled = false,
  small = false,
  className = '',
}: PixelButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.04 }}
      whileTap={disabled ? {} : { scale: 0.96 }}
      className={[
        'border-2 font-pixel transition-all duration-150 tracking-wide',
        small ? 'px-3 py-1.5 text-[0.45rem]' : 'px-6 py-3 text-[0.6rem]',
        disabled
          ? 'border-white/10 text-white/20 cursor-not-allowed'
          : variantClasses[variant],
        className,
      ].join(' ')}
    >
      {children}
    </motion.button>
  )
}
