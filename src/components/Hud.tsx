import { useEffect, useState } from 'react';
import { sound } from '../audio/sound';
import { useSoundEnabled } from '../hooks/useSound';
import { NPCS, NPC_ORDER, type NpcId } from '../game/npcs';
import { useTouchControls } from '../hooks/useTouchControls';
import { NpcPortrait } from './NpcPortrait';

interface HudProps {
  met: ReadonlySet<NpcId>;
  secretsFound: number;
  secretsTotal: number;
  onOpenSection: (id: NpcId) => void;
  onShowIntro: () => void;
  onShowReport: () => void;
  onShowSummary: () => void;
}

/** Blur after a mouse/touch click so Space/Enter go back to the game instead of re-pressing the button. */
const blurIfPointer = (e: React.MouseEvent<HTMLElement>) => {
  if (e.detail > 0) e.currentTarget.blur();
};

/** Top-left chip with progress; expands into controls and a "who to find" list. */
export function Hud({ met, secretsFound, secretsTotal, onOpenSection, onShowIntro, onShowReport, onShowSummary }: HudProps) {
  const touch = useTouchControls();
  const soundOn = useSoundEnabled();
  const allMet = met.size === NPC_ORDER.length;

  // M toggles sound from anywhere.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey || e.key.toLowerCase() !== 'm') return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      sound.toggle();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
  // Start open on roomy screens, folded away on phones so the map stays visible.
  const [open, setOpen] = useState(() => window.innerWidth > 768);

  return (
    <div className="hud">
      <div className="hud-bar">
        <button
          type="button"
          className="hud-chip"
          aria-expanded={open}
          aria-controls="hud-panel"
          onClick={(e) => {
            setOpen((o) => !o);
            blurIfPointer(e);
          }}
        >
          <span className="hud-chip-flake glyph" aria-hidden>❄</span>
          THE OUTPOST
          <span className="hud-pips" aria-label={`${met.size} of ${NPC_ORDER.length} locals met`}>
            {NPC_ORDER.map((id) => (
              <span key={id} className={`hud-pip ${met.has(id) ? 'is-met' : ''}`} />
            ))}
          </span>
          <span className="hud-chip-caret glyph" aria-hidden>▾</span>
        </button>
        <button
          type="button"
          className={`hud-sound ${soundOn ? 'is-on' : ''}`}
          aria-pressed={soundOn}
          title="Sound (M)"
          onClick={(e) => {
            sound.toggle();
            blurIfPointer(e);
          }}
        >
          <span className="glyph" aria-hidden>♪</span>
          <span className="hud-sound-label">SOUND</span> {soundOn ? 'ON' : 'OFF'}
        </button>
      </div>

      {open && (
        <div id="hud-panel" className="hud-panel px-panel">
          <section className="hud-section">
            <h2 className="hud-heading">CONTROLS</h2>
            {touch ? (
              <dl className="hud-controls">
                <dt><span className="key">◎</span></dt>
                <dd>Drag the joystick to walk</dd>
                <dt><span className="key">TALK</span></dt>
                <dd>Chat with a nearby local</dd>
              </dl>
            ) : (
              <dl className="hud-controls">
                <dt><span className="key">W</span><span className="key">A</span><span className="key">S</span><span className="key">D</span></dt>
                <dd>Walk (or arrow keys)</dd>
                <dt><span className="key">SHIFT</span></dt>
                <dd>Run</dd>
                <dt><span className="key">E</span></dt>
                <dd>Talk (or Space)</dd>
                <dt><span className="key">M</span></dt>
                <dd>Sound on / off</dd>
              </dl>
            )}
          </section>

          <section className="hud-section">
            <h2 className="hud-heading">FIND THE LOCALS</h2>
            <ul className="hud-npcs">
              {NPC_ORDER.map((id) => (
                <li key={id}>
                  <button
                    type="button"
                    className="hud-npc"
                    title={`Open ${NPCS[id].section}`}
                    onClick={(e) => {
                      blurIfPointer(e);
                      onOpenSection(id);
                    }}
                  >
                    <NpcPortrait id={id} size={32} decorative />
                    <span className="hud-npc-text">
                      <span className="hud-npc-section">{NPCS[id].section}</span>
                      <span className="hud-npc-name">{NPCS[id].name}</span>
                    </span>
                    <span className={`hud-npc-badge ${met.has(id) ? 'is-met' : ''}`}>{met.has(id) ? 'MET' : 'OPEN >'}</span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="hud-secrets">
              <span className="glyph" aria-hidden>◆</span> Project landmarks glow around the camp.
              <br />
              Secrets found: <strong>{secretsFound} / {secretsTotal}</strong>
            </p>
            <div className="hud-footer">
              <span>{allMet ? 'You met everyone!' : 'Walk up to them, or click to open.'}</span>
              <button
                type="button"
                className={`px-btn px-btn--sm ${allMet ? 'px-btn--primary' : 'px-btn--ghost'}`}
                onClick={(e) => {
                  blurIfPointer(e);
                  if (allMet) onShowReport();
                  else onShowIntro();
                }}
              >
                {allMet ? 'REPORT' : 'INTRO'}
              </button>
            </div>
            <button
              type="button"
              className="px-btn px-btn--sm hud-summary"
              onClick={(e) => {
                blurIfPointer(e);
                onShowSummary();
              }}
            >
              READ AS A PAGE &gt;
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
