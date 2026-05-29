import { AnimatePresence, motion } from 'framer-motion'

interface EventBannerProps {
  label: string | null
}

export function EventBanner({ label }: EventBannerProps) {
  return (
    <AnimatePresence>
      {label && (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="text-center py-1"
        >
          <span className="font-pixel text-[0.6rem] text-cyan animate-blink-slow px-3 py-1 border border-cyan/40 bg-cyan/10">
            ⚡ {label}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
