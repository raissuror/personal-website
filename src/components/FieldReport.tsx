import { useEffect, useRef } from 'react';
import { sound } from '../audio/sound';
import { NPCS, NPC_ORDER } from '../game/npcs';
import { CONTACTS } from '../content/contacts';
import { NpcPortrait } from './NpcPortrait';

interface FieldReportProps {
  secretsFound: number;
  secretsTotal: number;
  onClose: () => void;
  onShowSummary: () => void;
}

/** Reward card shown once the visitor has met every local. */
export function FieldReport({ secretsFound, secretsTotal, onClose, onShowSummary }: FieldReportProps) {
  const primaryRef = useRef<HTMLAnchorElement>(null);
  const played = useRef(false);
  const [email, ...socials] = CONTACTS;

  useEffect(() => {
    primaryRef.current?.focus({ preventScroll: true });
    // Guard against StrictMode's double effect run in development.
    if (!played.current) {
      played.current = true;
      sound.fanfare();
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();
      if (key === 'escape' || (key === 'e' && !(e.target instanceof HTMLElement && e.target.closest('a, button')))) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="welcome report px-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-title"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="report-stamp" aria-hidden>COMPLETE</span>
        <p className="eyebrow"><span className="glyph">❄</span> FIELD REPORT</p>
        <h2 id="report-title" className="welcome-title">You met all the locals!</h2>
        <p className="welcome-lede">
          Thanks for exploring the Outpost. If you liked what you saw, I'd love to hear from you.
        </p>

        <ul className="welcome-cast report-cast">
          {NPC_ORDER.map((id, i) => (
            <li key={id} className="welcome-cast-member" style={{ animationDelay: `${120 + i * 110}ms` }}>
              <NpcPortrait id={id} size={64} decorative />
              <span>{NPCS[id].section.toUpperCase()}</span>
              <span className="report-check">MET</span>
            </li>
          ))}
        </ul>

        <div className="report-actions">
          <a ref={primaryRef} href={email.url} className="px-btn px-btn--primary">
            EMAIL ME &gt;
          </a>
          {socials.map((c) => (
            <a key={c.platform} href={c.url} target="_blank" rel="noopener noreferrer" className="px-btn">
              {c.platform} <span className="glyph" aria-hidden>↗</span>
            </a>
          ))}
        </div>

        <p className="report-secrets">
          {secretsFound === secretsTotal
            ? `You even found all ${secretsTotal} secrets. Impressive!`
            : `Secrets found: ${secretsFound} of ${secretsTotal}. A few things are still hiding around the camp.`}
        </p>

        <div className="report-footer">
          <button type="button" className="px-btn px-btn--ghost px-btn--sm" onClick={onClose}>
            KEEP EXPLORING
          </button>
          <button type="button" className="px-btn px-btn--ghost px-btn--sm" onClick={onShowSummary}>
            READ AS A PAGE
          </button>
        </div>
      </div>
    </div>
  );
}
