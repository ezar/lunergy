import { AnimatePresence, motion } from 'framer-motion'

interface ConditionHintBannerProps {
  hint: string | null
}

export function ConditionHintBanner({ hint }: ConditionHintBannerProps) {
  return (
    <AnimatePresence>
      {hint && (
        <motion.div
          key={hint}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="bg-cyan/10 border-b border-cyan/30 px-4 py-2 text-center">
            <p className="font-vt text-lg text-cyan">{hint}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
