import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore } from './store/useGameStore'
import { TitleScreen } from './components/screens/TitleScreen'
import { BriefingScreen } from './components/screens/BriefingScreen'
import { GameScreen } from './components/screens/GameScreen'
import { GameOverScreen } from './components/screens/GameOverScreen'

const screenVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export default function App() {
  const screen = useGameStore(s => s.screen)

  return (
    <div className="w-screen h-screen overflow-hidden bg-space-950">
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          variants={screenVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3 }}
          className="w-full h-full"
        >
          {screen === 'title' && <TitleScreen />}
          {screen === 'briefing' && <BriefingScreen />}
          {screen === 'game' && <GameScreen />}
          {screen === 'gameover' && <GameOverScreen />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
