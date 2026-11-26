import { useCallback, useEffect, useState } from 'react'
import { GameCanvas } from './components/GameCanvas'
import { Hud } from './components/Hud'
import { DialogueBox, NpcDialogue, ProjectModal, SectionModal } from './components/ProfileModal'
import { FieldReport } from './components/FieldReport'
import { NpcPortrait } from './components/NpcPortrait'
import { SummaryPage } from './components/SummaryPage'
import { WelcomeCard } from './components/WelcomeCard'
import { CAREER } from './content/career'
import { SECRETS, secretById } from './content/secrets'
import type { SpotRef } from './game/bridge'
import { NPC_ORDER, isNpcId, type NpcId } from './game/npcs'
import './App.css'

type Modal =
  | { type: 'dialogue'; npc: NpcId }
  | { type: 'section'; npc: NpcId }
  | { type: 'project'; id: string }
  /** A secret or a career signpost. */
  | { type: 'note'; key: string; name: string; text: string; sprite?: string }
  | null

type View = 'game' | 'summary'

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

/** `?view=summary` opens the plain one-page version, so it can be linked to directly. */
const viewFromUrl = (): View => (new URLSearchParams(window.location.search).get('view') === 'summary' ? 'summary' : 'game')

function App() {
  const [view, setViewState] = useState<View>(viewFromUrl)
  const [modal, setModal] = useState<Modal>(null)
  const [introOpen, setIntroOpen] = useState(() => !introSeen())
  const [met, setMet] = useState<ReadonlySet<NpcId>>(() => new Set())
  const [found, setFound] = useState<ReadonlySet<string>>(() => new Set())
  // 'auto' until the visitor closes the report; after that it only opens from the HUD.
  const [report, setReport] = useState<'auto' | 'open' | 'closed'>('auto')

  const allMet = met.size === NPC_ORDER.length
  // Wait for any dialogue / section to close so the reward doesn't pop over the content.
  const reportOpen = view === 'game' && allMet && modal === null && !introOpen && report !== 'closed'

  useEffect(() => {
    const onPop = () => setViewState(viewFromUrl())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const setView = useCallback((next: View) => {
    const url = new URL(window.location.href)
    if (next === 'summary') url.searchParams.set('view', 'summary')
    else url.searchParams.delete('view')
    window.history.pushState(null, '', url)
    setViewState(next)
    setModal(null)
    if (next === 'summary') {
      setIntroOpen(false)
      rememberIntroSeen()
    }
  }, [])

  const markMet = useCallback((npc: NpcId) => {
    setMet((prev) => (prev.has(npc) ? prev : new Set(prev).add(npc)))
  }, [])

  const handleTalk = useCallback(
    ({ kind, id }: SpotRef) => {
      if (kind === 'npc' && isNpcId(id)) {
        markMet(id)
        setModal({ type: 'dialogue', npc: id })
      } else if (kind === 'project') {
        setModal({ type: 'project', id })
      } else if (kind === 'secret') {
        const secret = secretById(id)
        if (!secret) return
        setFound((prev) => (prev.has(id) ? prev : new Set(prev).add(id)))
        setModal({ type: 'note', key: `secret-${id}`, name: secret.title, text: secret.text, sprite: secret.sprite })
      } else if (kind === 'trail') {
        const stop = CAREER[Number(id)]
        if (!stop) return
        setModal({ type: 'note', key: `trail-${id}`, name: `${stop.when} · ${stop.place}`, text: `${stop.role}. ${stop.summary}` })
      }
    },
    [markMet],
  )

  const openSection = useCallback(
    (npc: NpcId) => {
      markMet(npc)
      setIntroOpen(false)
      rememberIntroSeen()
      setModal({ type: 'section', npc })
    },
    [markMet],
  )

  const startExploring = useCallback(() => {
    setIntroOpen(false)
    rememberIntroSeen()
  }, [])

  const showIntro = useCallback(() => setIntroOpen(true), [])
  const continueDialogue = useCallback(() => setModal((m) => (m?.type === 'dialogue' ? { type: 'section', npc: m.npc } : m)), [])
  const closeModal = useCallback(() => setModal(null), [])
  const openProject = useCallback((id: string) => setModal({ type: 'project', id }), [])
  const showReport = useCallback(() => setReport('open'), [])
  const closeReport = useCallback(() => setReport('closed'), [])
  const showSummary = useCallback(() => setView('summary'), [setView])
  const showGame = useCallback(() => setView('game'), [setView])

  if (view === 'summary') return <SummaryPage onPlay={showGame} />

  return (
    <div className="App">
      <GameCanvas onTalk={handleTalk} paused={modal !== null || introOpen || reportOpen} />
      <Hud
        met={met}
        secretsFound={found.size}
        secretsTotal={SECRETS.length}
        onOpenSection={openSection}
        onShowIntro={showIntro}
        onShowReport={showReport}
        onShowSummary={showSummary}
      />

      {introOpen && <WelcomeCard onStart={startExploring} onOpenSection={openSection} onShowSummary={showSummary} />}

      {modal?.type === 'dialogue' && (
        <NpcDialogue key={modal.npc} npc={modal.npc} onContinue={continueDialogue} onClose={closeModal} />
      )}
      {modal?.type === 'section' && <SectionModal npc={modal.npc} onClose={closeModal} onNavigate={openSection} />}
      {modal?.type === 'project' && <ProjectModal id={modal.id} onClose={closeModal} onNavigate={openProject} />}
      {modal?.type === 'note' && (
        <DialogueBox
          key={modal.key}
          name={modal.name}
          text={modal.text}
          portrait={
            modal.sprite ? (
              <NpcPortrait sprite={modal.sprite} label={modal.name} size={96} className="dialogue-portrait" decorative />
            ) : undefined
          }
          onClose={closeModal}
        />
      )}
      {reportOpen && (
        <FieldReport secretsFound={found.size} secretsTotal={SECRETS.length} onClose={closeReport} onShowSummary={showSummary} />
      )}
    </div>
  )
}

export default App
