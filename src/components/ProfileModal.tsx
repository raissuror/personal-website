import { useEffect, useRef, type ReactNode } from 'react';
import { getModalContent } from './profile-modal';
import { NPCS, NPC_ORDER, type NpcId } from '../game/npcs';
import { PROJECTS, projectById } from '../content/projects';
import { useTypewriter } from '../hooks/useTypewriter';
import { ProjectCard } from './ProjectCard';
import { NpcPortrait } from './NpcPortrait';
import { sound } from '../audio/sound';

/** Ignore auto-repeat, and let a focused button handle its own Enter/Space. */
const isButtonActivation = (e: KeyboardEvent) =>
  (e.key === 'Enter' || e.key === ' ') && e.target instanceof HTMLButtonElement;

// ------------------------------------------------------------------ dialogue

interface DialogueBoxProps {
  name: string;
  text: string;
  portrait?: ReactNode;
  /** Main action (E). Without one, the single button just closes. */
  action?: { label: string; onClick: () => void };
  onClose: () => void;
}

/** A line of text at the bottom of the screen, typed out. Mount with a `key` per speaker. */
export function DialogueBox({ name, text, portrait, action, onClose }: DialogueBoxProps) {
  const { shown, done, finish } = useTypewriter(text);
  const primary = action?.onClick ?? onClose;

  // Chime on open, then a blip every other letter while the line types out.
  const chimed = useRef(false);
  useEffect(() => {
    if (chimed.current) return;
    chimed.current = true;
    sound.chime();
  }, []);
  useEffect(() => {
    const last = shown[shown.length - 1];
    if (!done && shown.length % 2 === 0 && last && last !== ' ') sound.blip();
  }, [shown, done]);

  // First press finishes the line, the next one acts.
  const advance = () => (done ? primary() : finish());

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || isButtonActivation(e)) return;
      const key = e.key.toLowerCase();
      if (key === 'escape') {
        e.preventDefault();
        onClose();
      } else if (key === 'e' || key === ' ' || key === 'enter') {
        e.preventDefault();
        if (done) primary();
        else finish();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [done, finish, primary, onClose]);

  return (
    <div className="overlay dialogue-overlay" onClick={onClose}>
      <div
        className={`dialogue px-panel ${portrait ? '' : 'dialogue--no-portrait'}`}
        role="dialog"
        aria-label={`${name} says`}
        onClick={(e) => {
          e.stopPropagation();
          advance();
        }}
      >
        <span className="dialogue-name">{name.toUpperCase()}</span>
        {portrait}
        <div className="dialogue-body">
          <p className="dialogue-text" aria-label={text}>
            <span aria-hidden>{shown}</span>
            {done && <span className="dialogue-cursor glyph" aria-hidden>▼</span>}
          </p>
          <div className="dialogue-actions">
            {action && (
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
            )}
            <button
              type="button"
              className="px-btn px-btn--primary"
              onClick={(e) => {
                e.stopPropagation();
                primary();
              }}
            >
              <span className="key">E</span> {action ? <>{action.label.toUpperCase()} &gt;</> : 'OK'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Opening line of one of the four locals, leading into their section. */
export function NpcDialogue({ npc, onContinue, onClose }: { npc: NpcId; onContinue: () => void; onClose: () => void }) {
  const c = NPCS[npc];
  return (
    <DialogueBox
      name={c.name}
      text={c.teaser}
      portrait={<NpcPortrait id={npc} size={96} className="dialogue-portrait" decorative />}
      action={{ label: c.section, onClick: onContinue }}
      onClose={onClose}
    />
  );
}

// ------------------------------------------------------------- panels

interface PanelProps {
  title: string;
  kicker: string;
  icon: ReactNode;
  /** Changes when the content changes, to scroll back to the top. */
  contentKey: string;
  prev?: { label: string; go: () => void };
  next?: { label: string; go: () => void };
  onClose: () => void;
  children: ReactNode;
}

/** Big centred panel with a header, scrollable body and previous / next footer. */
function Panel({ title, kicker, icon, contentKey, prev, next, onClose, children }: PanelProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
    dialogRef.current?.focus({ preventScroll: true });
  }, [contentKey]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || isButtonActivation(e)) return;
      const key = e.key.toLowerCase();
      if (key === 'escape' || key === 'e') {
        e.preventDefault();
        onClose();
      } else if (key === 'arrowleft' && prev) {
        prev.go();
      } else if (key === 'arrowright' && next) {
        next.go();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, prev, next]);

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
          {icon}
          <div className="section-heading">
            <p className="section-kicker">{kicker}</p>
            <h2 id="section-title" className="section-title">{title}</h2>
          </div>
          <button type="button" className="section-close" aria-label="Close" onClick={onClose}>
            X
          </button>
        </header>

        <div ref={bodyRef} className="section-body">
          {children}
        </div>

        <footer className="section-footer">
          <button type="button" className="px-btn px-btn--ghost px-btn--sm" disabled={!prev} onClick={() => prev?.go()}>
            &lt; {prev?.label.toUpperCase() ?? ''}
          </button>
          <span className="section-hint">
            <span className="key">ESC</span> back to the camp
          </span>
          <button type="button" className="px-btn px-btn--ghost px-btn--sm" disabled={!next} onClick={() => next?.go()}>
            {next?.label.toUpperCase() ?? ''} &gt;
          </button>
        </footer>
      </div>
    </div>
  );
}

interface SectionModalProps {
  npc: NpcId;
  onClose: () => void;
  /** Switch to another section (previous / next). */
  onNavigate: (id: NpcId) => void;
}

/** The full portfolio section of one of the four locals. */
export function SectionModal({ npc, onClose, onNavigate }: SectionModalProps) {
  const character = NPCS[npc];
  const Content = getModalContent(npc);
  const index = NPC_ORDER.indexOf(npc);
  const prevId = NPC_ORDER[index - 1];
  const nextId = NPC_ORDER[index + 1];

  return (
    <Panel
      title={character.section}
      kicker={`with the ${character.name}`}
      icon={<NpcPortrait id={npc} size={64} decorative />}
      contentKey={npc}
      prev={prevId ? { label: NPCS[prevId].section, go: () => onNavigate(prevId) } : undefined}
      next={nextId ? { label: NPCS[nextId].section, go: () => onNavigate(nextId) } : undefined}
      onClose={onClose}
    >
      <Content />
    </Panel>
  );
}

interface ProjectModalProps {
  id: string;
  onClose: () => void;
  onNavigate: (id: string) => void;
}

/** One project, opened from its landmark in the camp. */
export function ProjectModal({ id, onClose, onNavigate }: ProjectModalProps) {
  const project = projectById(id);
  if (!project) return null;
  const index = PROJECTS.indexOf(project);
  const prev = PROJECTS[index - 1];
  const next = PROJECTS[index + 1];

  return (
    <Panel
      title={project.title}
      kicker={`project ${index + 1} of ${PROJECTS.length}`}
      icon={<span className="section-icon glyph" aria-hidden>◆</span>}
      contentKey={id}
      prev={prev ? { label: 'prev', go: () => onNavigate(prev.id) } : undefined}
      next={next ? { label: 'next', go: () => onNavigate(next.id) } : undefined}
      onClose={onClose}
    >
      <ProjectCard project={project} detailed />
    </Panel>
  );
}
