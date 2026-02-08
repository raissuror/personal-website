import { useState } from 'react'
import { GameCanvas } from './components/GameCanvas'
import { GameUI } from './components/GameUI'
import { ProfileModal } from './components/ProfileModal'
import './App.css'

function App() {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: string;
    title: string;
    step: 'dialogue' | 'full';
  }>({
    isOpen: false,
    type: '',
    title: '',
    step: 'dialogue'
  })

  const handleInteraction = (type: string, data: any) => {
    setModalState({
      isOpen: true,
      type,
      title: data.title,
      step: 'dialogue'
    })
  }

  const handleContinueToFullModal = () => {
    setModalState(prev => ({
      ...prev,
      step: 'full'
    }))
  }

  const closeModal = () => {
    setModalState({
      isOpen: false,
      type: '',
      title: '',
      step: 'dialogue'
    })
  }

  return (
    <div className="App">
      <GameCanvas onInteraction={handleInteraction} />
      <GameUI />
      <ProfileModal
        isOpen={modalState.isOpen}
        step={modalState.step}
        onClose={closeModal}
        onContinue={handleContinueToFullModal}
        type={modalState.type}
        title={modalState.title}
      />
    </div>
  )
}

export default App
