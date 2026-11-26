import { NPC_ORDER, NPCS } from '../game/npcs';
import { CONTACTS } from '../content/contacts';
import { CAREER } from '../content/career';
import { PROJECTS } from '../content/projects';
import { AboutContent, ContactContent, SkillsContent } from './profile-modal';
import { NpcPortrait } from './NpcPortrait';
import { ProjectCard } from './ProjectCard';

interface SummaryPageProps {
  onPlay: () => void;
}

/** Everything on one scrollable page, for visitors who'd rather read than play. */
export function SummaryPage({ onPlay }: SummaryPageProps) {
  const [email, ...socials] = CONTACTS;
  const portrait = (id: (typeof NPC_ORDER)[number]) => <NpcPortrait id={id} size={64} decorative />;

  return (
    <div className="summary">
      <header className="summary-hero">
        <div className="summary-wrap">
          <p className="eyebrow"><span className="glyph">❄</span> THE OUTPOST · SUMMARY</p>
          <h1 className="summary-title">Rais</h1>
          <p className="summary-role">Product engineer · WMS &amp; operations technology</p>
          <p className="summary-lede">
            4+ years building web applications that run real business operations. Currently at Biteship, shipping
            warehouse and fulfillment tools used by 500+ operators.
          </p>
          <div className="summary-actions">
            <a href={email.url} className="px-btn px-btn--primary">EMAIL ME &gt;</a>
            {socials.map((c) => (
              <a key={c.platform} href={c.url} target="_blank" rel="noopener noreferrer" className="px-btn">
                {c.platform} <span className="glyph" aria-hidden>↗</span>
              </a>
            ))}
            <button type="button" className="px-btn px-btn--ghost summary-play" onClick={onPlay}>
              PLAY THE GAME INSTEAD
            </button>
          </div>
          <nav className="summary-nav" aria-label="Sections">
            {NPC_ORDER.map((id) => (
              <a key={id} href={`#summary-${id}`}>{NPCS[id].section}</a>
            ))}
            {CAREER.length > 0 && <a href="#summary-career">Career</a>}
          </nav>
        </div>
      </header>

      <main className="summary-wrap summary-main">
        <SummarySection id="about" title="About me" icon={portrait('about')}>
          <AboutContent />
        </SummarySection>

        {CAREER.length > 0 && (
          <SummarySection id="career" title="Career">
            <ol className="summary-timeline">
              {CAREER.slice().reverse().map((c) => (
                <li key={`${c.when}-${c.role}`}>
                  <span className="summary-timeline-when">{c.when}</span>
                  <div>
                    <h3>{c.role} <span>· {c.place}</span></h3>
                    <p>{c.summary}</p>
                  </div>
                </li>
              ))}
            </ol>
          </SummarySection>
        )}

        <SummarySection id="skills" title="Skills" icon={portrait('skills')}>
          <SkillsContent />
        </SummarySection>

        <SummarySection id="projects" title="Projects" icon={portrait('projects')}>
          <div className="project-list project-list--grid">
            {PROJECTS.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </SummarySection>

        <SummarySection id="contact" title="Contact" icon={portrait('contact')}>
          <ContactContent />
        </SummarySection>

        <footer className="summary-footer">
          <p>Got a minute? The same portfolio is also a little game.</p>
          <button type="button" className="px-btn px-btn--primary" onClick={onPlay}>
            EXPLORE THE OUTPOST &gt;
          </button>
        </footer>
      </main>
    </div>
  );
}

function SummarySection({ id, title, icon, children }: { id: string; title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section id={`summary-${id}`} className="summary-section px-panel" aria-labelledby={`summary-${id}-title`}>
      <header className="summary-section-header">
        {icon}
        <h2 id={`summary-${id}-title`}>{title}</h2>
      </header>
      <div className="summary-section-body">{children}</div>
    </section>
  );
}
