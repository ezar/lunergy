import { motion } from 'framer-motion'
import { StarCanvas } from '../ui/StarCanvas'
import { PixelButton } from '../ui/PixelButton'
import { Panel } from '../ui/Panel'
import { useGameStore } from '../../store/useGameStore'
import { useAudio } from '../../hooks/useAudio'
import { formatTime, padScore } from '../../lib/utils'
import { GAME_OVER_MESSAGES } from '../../lib/constants'

export function GameOverScreen() {
  const result = useGameStore(s => s.result)
  const highScore = useGameStore(s => s.highScore)
  const startGame = useGameStore(s => s.startGame)
  const goTo = useGameStore(s => s.goTo)
  const { playSound } = useAudio()

  if (!result) return null

  const msgIdx = Math.min(
    Math.floor(result.time / 30),
    GAME_OVER_MESSAGES.length - 1,
  )
  const message = GAME_OVER_MESSAGES[msgIdx]
  const isNewHigh = result.score >= highScore

  const handleRetry = () => {
    playSound('start')
    startGame()
  }

  const handleMenu = () => {
    playSound('click')
    goTo('title')
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-space-950 overflow-hidden">
      <StarCanvas className="opacity-30" />

      <div className="relative z-10 flex flex-col items-center gap-6 max-w-md w-full px-6">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="font-pixel text-lg text-pixel-red mb-1">BASE OFFLINE</h2>
          <p className="font-vt text-base text-white/50">Power failure — mission ended</p>
        </motion.div>

        {/* Stats panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="w-full"
        >
          <Panel className="p-5" glow="#ffcc33">
            <div className="space-y-4">
              <Stat label="TIME SURVIVED" value={formatTime(result.time)} color="#66e0ff" />
              <Stat label="FINAL SCORE" value={padScore(result.score)} color="#ffcc33" big />
              <Stat
                label="BEST SCORE"
                value={padScore(highScore)}
                color={isNewHigh ? '#33ff88' : '#888'}
              />
              {isNewHigh && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="font-pixel text-[0.45rem] text-pixel-green text-center animate-blink"
                >
                  ★ NEW HIGH SCORE! ★
                </motion.p>
              )}
            </div>
          </Panel>
        </motion.div>

        {/* Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="font-vt text-base text-white/60 text-center leading-snug"
        >
          {message}
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex gap-3"
        >
          <PixelButton onClick={handleMenu} variant="ghost">
            MENU
          </PixelButton>
          <PixelButton onClick={handleRetry} variant="gold">
            RETRY
          </PixelButton>
        </motion.div>
      </div>
    </div>
  )
}

function Stat({ label, value, color, big = false }: {
  label: string
  value: string
  color: string
  big?: boolean
}) {
  return (
    <div className="flex justify-between items-baseline">
      <span className="font-pixel text-[0.42rem] text-white/40">{label}</span>
      <span
        className={big ? 'font-pixel text-base' : 'font-vt text-xl'}
        style={{ color }}
      >
        {value}
      </span>
    </div>
  )
}
