import { useEffect, useRef } from 'react';
import { NPCS, NPC_ORDER, type NpcId } from '../game/npcs';
import { useTouchControls } from '../hooks/useTouchControls';
import { NpcPortrait } from './NpcPortrait';

interface WelcomeCardProps {
  onStart: () => void;
  onOpenSection: (id: NpcId) => void;
}

/** First-visit card: who this is, how to play, and a shortcut for visitors who'd rather not walk. */
export function WelcomeCard({ onStart, onOpenSection }: WelcomeCardProps) {
  const touch = useTouchControls();
  const startRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    startRef.current?.focus({ preventScroll: true });
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();
      // Enter/Space on a focused button already click it; handle the rest here.
      if (key === 'escape' || (key === 'e' && !(e.target instanceof HTMLButtonElement))) {
        e.preventDefault();
        onStart();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onStart]);

  return (
    <div className="overlay">
      <div className="welcome px-panel" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
        <p className="eyebrow"><span className="glyph">❄</span> FIELD STATION 01</p>
        <h1 id="welcome-title" className="welcome-title">Welcome to the Outpost</h1>
        <p className="welcome-lede">
          I'm Rais, a product engineer. Explore the camp and chat with the locals to learn about my work.
        </p>

        <div className="welcome-cast" aria-hidden>
          {NPC_ORDER.map((id) => (
            <span key={id} className="welcome-cast-member">
              <NpcPortrait id={id} size={64} decorative />
              {NPCS[id].section.toUpperCase()}
            </span>
          ))}
        </div>

        <p className="welcome-controls">
          {touch ? (
            <>
              <span><span className="key">◎</span> Drag to walk</span>
              <span><span className="key">TALK</span> Chat</span>
            </>
          ) : (
            <>
              <span><span className="key">WASD</span> Walk</span>
              <span><span className="key">SHIFT</span> Run</span>
              <span><span className="key">E</span> Talk</span>
            </>
          )}
        </p>

        <button ref={startRef} type="button" className="px-btn px-btn--primary" onClick={onStart}>
          START EXPLORING &gt;
        </button>

        <div className="welcome-skip">
          No time to walk? Jump straight to:
          <div className="welcome-skip-links">
            {NPC_ORDER.map((id) => (
              <button key={id} type="button" className="px-btn px-btn--sm" onClick={() => onOpenSection(id)}>
                {NPCS[id].section.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
