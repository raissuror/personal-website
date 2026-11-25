import { useEffect, useRef } from 'react';
import { getModalContent } from './profile-modal';
import { NPCS, NPC_ORDER, type NpcId } from '../game/npcs';
import { useTypewriter } from '../hooks/useTypewriter';
import { NpcPortrait } from './NpcPortrait';

/** Ignore auto-repeat, and let a focused button handle its own Enter/Space. */
const isButtonActivation = (e: KeyboardEvent) =>
  (e.key === 'Enter' || e.key === ' ') && e.target instanceof HTMLButtonElement;

// ------------------------------------------------------------------ dialogue

interface DialogueBoxProps {
  npc: NpcId;
  onContinue: () => void;
  onClose: () => void;
}

/** Step 1: the NPC's opening line at the bottom of the screen. Mount with `key={npc}`. */
export function DialogueBox({ npc, onContinue, onClose }: DialogueBoxProps) {
  const character = NPCS[npc];
  const { shown, done, finish } = useTypewriter(character.teaser);

  // First press finishes the line, the next one continues.
  const advance = () => (done ? onContinue() : finish());

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || isButtonActivation(e)) return;
      const key = e.key.toLowerCase();
      if (key === 'escape') {
        e.preventDefault();
        onClose();
      } else if (key === 'e' || key === ' ' || key === 'enter') {
        e.preventDefault();
        if (done) onContinue();
        else finish();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [done, finish, onContinue, onClose]);

  return (
    <div className="overlay dialogue-overlay" onClick={onClose}>
      <div
        className="dialogue px-panel"
        role="dialog"
        aria-label={`${character.name} says`}
        onClick={(e) => {
          e.stopPropagation();
          advance();
        }}
      >
        <span className="dialogue-name">{character.name.toUpperCase()}</span>
        <NpcPortrait id={npc} size={96} className="dialogue-portrait" decorative />
        <div className="dialogue-body">
          <p className="dialogue-text" aria-label={character.teaser}>
            <span aria-hidden>{shown}</span>
            {done && <span className="dialogue-cursor" aria-hidden>▼</span>}
          </p>
          <div className="dialogue-actions">
            <button
              type="button"
              className="px-btn px-btn--ghost"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
            >
              <span className="key">ESC</span> BYE
            </button>
            <button
              type="button"
              className="px-btn px-btn--primary"
              onClick={(e) => {
                e.stopPropagation();
                onContinue();
              }}
            >
              <span className="key">E</span> {character.section.toUpperCase()} &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------- full section

interface SectionModalProps {
  npc: NpcId;
  onClose: () => void;
  /** Switch to another section (previous / next). */
  onNavigate: (id: NpcId) => void;
}

/** Step 2: the full portfolio section, with previous / next navigation. */
export function SectionModal({ npc, onClose, onNavigate }: SectionModalProps) {
  const character = NPCS[npc];
  const Content = getModalContent(npc);
  const index = NPC_ORDER.indexOf(npc);
  const prev = NPC_ORDER[index - 1];
  const next = NPC_ORDER[index + 1];
  const bodyRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
    dialogRef.current?.focus({ preventScroll: true });
  }, [npc]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || isButtonActivation(e)) return;
      const key = e.key.toLowerCase();
      if (key === 'escape' || key === 'e') {
        e.preventDefault();
        onClose();
      } else if (key === 'arrowleft' && prev) {
        onNavigate(prev);
      } else if (key === 'arrowright' && next) {
        onNavigate(next);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, onNavigate, prev, next]);

  return (
    <div className="overlay" onClick={onClose}>
      <div
        ref={dialogRef}
        className="section px-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="section-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="section-header">
          <NpcPortrait id={npc} size={64} decorative />
          <div className="section-heading">
            <p className="section-kicker">with the {character.name}</p>
            <h2 id="section-title" className="section-title">{character.section}</h2>
          </div>
          <button type="button" className="section-close" aria-label="Close" onClick={onClose}>
            X
          </button>
        </header>

        <div ref={bodyRef} className="section-body">
          <Content />
        </div>

        <footer className="section-footer">
          <button
            type="button"
            className="px-btn px-btn--ghost px-btn--sm"
            disabled={!prev}
            onClick={() => prev && onNavigate(prev)}
          >
            &lt; {prev ? NPCS[prev].section.toUpperCase() : ''}
          </button>
          <span className="section-hint">
            <span className="key">ESC</span> back to the camp
          </span>
          <button
            type="button"
            className="px-btn px-btn--ghost px-btn--sm"
            disabled={!next}
            onClick={() => next && onNavigate(next)}
          >
            {next ? NPCS[next].section.toUpperCase() : ''} &gt;
          </button>
        </footer>
      </div>
    </div>
  );
}
