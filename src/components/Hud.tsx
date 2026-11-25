import { useState } from 'react';
import { NPCS, NPC_ORDER, type NpcId } from '../game/npcs';
import { useTouchControls } from '../hooks/useTouchControls';
import { NpcPortrait } from './NpcPortrait';

interface HudProps {
  met: ReadonlySet<NpcId>;
  onOpenSection: (id: NpcId) => void;
  onShowIntro: () => void;
}

/** Blur after a mouse/touch click so Space/Enter go back to the game instead of re-pressing the button. */
const blurIfPointer = (e: React.MouseEvent<HTMLElement>) => {
  if (e.detail > 0) e.currentTarget.blur();
};

/** Top-left chip with progress; expands into controls and a "who to find" list. */
export function Hud({ met, onOpenSection, onShowIntro }: HudProps) {
  const touch = useTouchControls();
  // Start open on roomy screens, folded away on phones so the map stays visible.
  const [open, setOpen] = useState(() => window.innerWidth > 768);

  return (
    <div className="hud">
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
            <div className="hud-footer">
              <span>Walk up to them, or click to open.</span>
              <button
                type="button"
                className="px-btn px-btn--ghost px-btn--sm"
                onClick={(e) => {
                  blurIfPointer(e);
                  onShowIntro();
                }}
              >
                INTRO
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
