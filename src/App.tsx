import { useCallback, useState } from 'react'
import { GameCanvas } from './components/GameCanvas'
import { Hud } from './components/Hud'
import { DialogueBox, SectionModal } from './components/ProfileModal'
import { WelcomeCard } from './components/WelcomeCard'
import type { NpcId } from './game/npcs'
import './App.css'

type ModalState = { npc: NpcId; step: 'dialogue' | 'full' } | null

const INTRO_SEEN_KEY = 'outpost:intro-seen'

const introSeen = () => {
  try {
    return localStorage.getItem(INTRO_SEEN_KEY) === '1'
  } catch {
    return false
  }
}

const rememberIntroSeen = () => {
  try {
    localStorage.setItem(INTRO_SEEN_KEY, '1')
  } catch {
    // Private mode / blocked storage: the intro will just show again next visit.
  }
}

function App() {
  const [modal, setModal] = useState<ModalState>(null)
  const [introOpen, setIntroOpen] = useState(() => !introSeen())
  const [met, setMet] = useState<ReadonlySet<NpcId>>(() => new Set())

  const markMet = useCallback((npc: NpcId) => {
    setMet((prev) => (prev.has(npc) ? prev : new Set(prev).add(npc)))
  }, [])

  const handleTalk = useCallback(
    (npc: NpcId) => {
      markMet(npc)
      setModal({ npc, step: 'dialogue' })
    },
    [markMet],
  )

  const openSection = useCallback(
    (npc: NpcId) => {
      markMet(npc)
      setIntroOpen(false)
      rememberIntroSeen()
      setModal({ npc, step: 'full' })
    },
    [markMet],
  )

  const startExploring = useCallback(() => {
    setIntroOpen(false)
    rememberIntroSeen()
  }, [])

  const showIntro = useCallback(() => setIntroOpen(true), [])
  const continueDialogue = useCallback(() => setModal((m) => (m ? { ...m, step: 'full' } : m)), [])
  const closeModal = useCallback(() => setModal(null), [])

  return (
    <div className="App">
      <GameCanvas onTalk={handleTalk} paused={modal !== null || introOpen} />
      <Hud met={met} onOpenSection={openSection} onShowIntro={showIntro} />

      {introOpen && <WelcomeCard onStart={startExploring} onOpenSection={openSection} />}

      {modal?.step === 'dialogue' && (
        <DialogueBox key={modal.npc} npc={modal.npc} onContinue={continueDialogue} onClose={closeModal} />
      )}
      {modal?.step === 'full' && <SectionModal npc={modal.npc} onClose={closeModal} onNavigate={openSection} />}
    </div>
  )
}

export default App
