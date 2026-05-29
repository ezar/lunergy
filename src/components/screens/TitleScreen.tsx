import { motion } from 'framer-motion'
import { StarCanvas } from '../ui/StarCanvas'
import { PixelButton } from '../ui/PixelButton'
import { useGameStore } from '../../store/useGameStore'
import { useAudio } from '../../hooks/useAudio'

export function TitleScreen() {
  const goTo = useGameStore(s => s.goTo)
  const highScore = useGameStore(s => s.highScore)
  const { playSound } = useAudio()

  const handleStart = () => {
    playSound('start')
    goTo('briefing')
  }

  const handleHowTo = () => {
    playSound('click')
    goTo('briefing')
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-space-950">
      <StarCanvas />

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center"
        >
          <h1 className="font-pixel text-4xl text-gold animate-pulse-glow tracking-widest mb-2">
            LUNERGY
          </h1>
          <p className="font-vt text-xl text-white/60 tracking-widest">
            MOON BASE ENERGY SURVIVAL
          </p>
        </motion.div>

        {/* Moon graphic */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative"
        >
          <div
            className="w-24 h-24 rounded-full bg-gradient-to-br from-white/80 to-white/20"
            style={{
              boxShadow: '0 0 40px rgba(255,255,255,0.2), 0 0 80px rgba(200,220,255,0.1)',
            }}
          >
            {/* Crater details */}
            <div className="absolute top-4 left-5 w-4 h-4 rounded-full bg-white/10 border border-white/20" />
            <div className="absolute bottom-6 right-4 w-6 h-6 rounded-full bg-white/10 border border-white/15" />
            <div className="absolute top-8 right-7 w-2.5 h-2.5 rounded-full bg-white/10 border border-white/20" />
          </div>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col gap-3 items-center"
        >
          <PixelButton onClick={handleStart} variant="gold">
            START MISSION
          </PixelButton>
          <PixelButton onClick={handleHowTo} variant="cyan">
            HOW TO PLAY
          </PixelButton>
        </motion.div>

        {/* High score */}
        {highScore > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="font-pixel text-[0.45rem] text-gold/70"
          >
            BEST: {String(Math.floor(highScore)).padStart(6, '0')}
          </motion.div>
        )}

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="font-vt text-sm text-white/30 max-w-xs text-center"
        >
          Manage solar, fusion, helium-3, and methane power to keep your lunar base alive.
        </motion.p>
      </div>
    </div>
  )
}
