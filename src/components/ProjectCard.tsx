import { projectImageUrl, projectScreenshots, type Project } from '../content/projects';

interface ProjectCardProps {
  project: Project;
  /** Larger layout with the full image, used in the project modal. */
  detailed?: boolean;
}

/** Project with image (or pixel placeholder), tech badges, collaborators and links. */
export function ProjectCard({ project: p, detailed = false }: ProjectCardProps) {
  const image = projectImageUrl(p);
  const shots = detailed ? projectScreenshots(p) : [];
  return (
    <article className={`project-card ${detailed ? 'project-card--detailed' : ''}`}>
      <div className="project-card-media" aria-hidden={!image}>
        {image ? (
          <img src={image} alt={`${p.title} preview`} loading="lazy" />
        ) : (
          <span className="project-card-placeholder">{p.title.slice(0, 2).toUpperCase()}</span>
        )}
      </div>
      <div className="project-card-body">
        <h3 className="project-card-title">{p.title}</h3>
        <p className="project-card-tagline">{p.tagline}</p>
        <p className="project-card-desc">{p.description}</p>
        <ul className="project-card-tech" aria-label="Built with">
          {p.tech.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        {shots.length > 0 && (
          <ul className="project-card-shots" aria-label="Screenshots">
            {shots.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  <img src={s.url} alt={`${p.title}: ${s.caption}`} loading="lazy" />
                </a>
                <span>{s.caption}</span>
              </li>
            ))}
          </ul>
        )}
        {p.collaborators?.length ? (
          <p className="project-card-collab">
            Built together with{' '}
            {p.collaborators.map((c, i) => (
              <span key={c.name}>
                {i > 0 && (i === p.collaborators!.length - 1 ? ' and ' : ', ')}
                {c.url ? (
                  <a href={c.url} target="_blank" rel="noopener noreferrer">
                    {c.name}
                  </a>
                ) : (
                  <strong>{c.name}</strong>
                )}
              </span>
            ))}
          </p>
        ) : null}
        <div className="project-card-links">
          {p.links.map((l) => (
            <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="game-modal-link">
              {l.label} <span className="glyph" aria-hidden>↗</span>
            </a>
          ))}
        </div>
      </div>
    </article>
  );
}
