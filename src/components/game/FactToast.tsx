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
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4"
        >
          <div
            className="border bg-space-950/95 px-4 py-3 backdrop-blur"
            style={{ borderColor: src.color + '88' }}
          >
            <p
              className="font-pixel text-[0.42rem] mb-1.5"
              style={{ color: src.color }}
            >
              {src.icon} {src.name} — DID YOU KNOW?
            </p>
            <p className="font-vt text-sm text-white/80 leading-snug">{factText}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
