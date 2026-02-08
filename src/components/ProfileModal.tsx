import React from 'react';
import { getModalContent } from './profile-modal';

interface ProfileModalProps {
  isOpen: boolean;
  step: 'dialogue' | 'full';
  onClose: () => void;
  onContinue: () => void;
  type: string;
  title: string;
}

const CHARACTER_DATA: Record<string, { name: string; sprite: string; teaser: string }> = {
  about: {
    name: 'Wizard',
    sprite: 'wizard',
    teaser: "What a beautiful day! Come, let me tell you about myself.",
  },
  skills: {
    name: 'Knight',
    sprite: 'knight',
    teaser: "I've trained long and hard. Ask me about my skills!",
  },
  projects: {
    name: 'Rogue',
    sprite: 'rogue',
    teaser: "I've been around. Want to see what I've built?",
  },
  contact: {
    name: 'Skeleton',
    sprite: 'skeleton',
    teaser: "Looking for me? Here's how to reach out!",
  },
};

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, step, onClose, onContinue, type }) => {
  if (!isOpen) {
    return null;
  }

  const character = CHARACTER_DATA[type] ?? {
    name: 'Unknown',
    sprite: 'wizard',
    teaser: 'This section is under construction!',
  };
  const ModalContent = getModalContent(type);

  // Step 1: In-game dialogue at bottom (portrait left, short message right)
  if (step === 'dialogue') {
    return (
      <div className="modal-overlay modal-overlay-dialogue" onClick={onClose}>
        <div className="game-dialog-box game-dialog-inline" onClick={(e) => e.stopPropagation()}>
          <div className="game-dialog-inline-portrait">
            <img
              src={`/assets/npcs/${character.sprite}-idle.png`}
              alt={character.name}
              className="game-character-sprite"
            />
          </div>
          <div className="game-dialog-inline-body">
            <div className="game-dialog-inline-message">
              {character.teaser}
            </div>
            <button onClick={onContinue} className="game-dialog-continue">
              [Press to continue]
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Full modal (centered, full message, close)
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="game-dialog-box" onClick={(e) => e.stopPropagation()}>
        <div className="game-dialog-content">
          <div className="game-dialog-message">
            <ModalContent />
          </div>
          <div className="game-dialog-footer">
            <button onClick={onClose} className="game-dialog-close">
              [Press to close]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 