import { motion } from 'framer-motion'

interface TutorialOverlayProps {
  visible: boolean
}

export function TutorialOverlay({ visible }: TutorialOverlayProps) {
  if (!visible) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 pointer-events-none flex flex-col"
    >
      {/* Top instruction banner — draws eye down to the cards */}
      <div className="bg-space-950/90 border-b-2 border-gold/60 px-6 py-5 text-center">
        <p className="font-pixel text-sm text-gold animate-blink mb-2">
          YOUR BASE IS LOSING POWER!
        </p>
        <p className="font-vt text-xl text-white/80">
          Tap any card below to turn on a power source.
        </p>
      </div>

      {/* Transparent middle — lets cards show through and be clickable */}
      <div className="flex-1 flex flex-col items-center justify-end pb-6 gap-3">
        {/* Animated arrow pointing at cards */}
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
          className="text-4xl"
        >
          👇
        </motion.div>
        <p className="font-pixel text-[0.6rem] text-gold/70">TAP A CARD</p>
      </div>
    </motion.div>
  )
}
