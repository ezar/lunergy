import { AnimatePresence, motion } from 'framer-motion'
import type { SourceId } from '../../types'
import { SOURCES } from '../../lib/constants'

interface FactToastProps {
  factSource: SourceId | null
  factText: string | null
}

export function FactToast({ factSource, factText }: FactToastProps) {
  const src = factSource ? SOURCES.find(s => s.id === factSource) : null

  return (
    <AnimatePresence>
      {factText && src && (
        <motion.div
          key={factText}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
        >
          <div
            className="border-2 bg-space-950/97 px-6 py-4 backdrop-blur"
            style={{ borderColor: src.color + 'cc' }}
          >
            <p
              className="font-pixel text-sm mb-3"
              style={{ color: src.color }}
            >
              {src.icon} {src.name} — DID YOU KNOW?
            </p>
            <p className="font-vt text-xl text-white/90 leading-snug">{factText}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
