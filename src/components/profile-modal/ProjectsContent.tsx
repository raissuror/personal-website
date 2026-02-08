import React from 'react';

/** Replace with your GitHub username */
const GITHUB_USERNAME = 'raissuror';

const PROJECTS = [
  {
    title: 'Go-Life',
    repo: 'go-life',
    desc: 'Go-Planner — a full-stack app inspired by super-apps like Gojek, with personalized recommendations and budget management. Split into two main modules.',
  },
  {
    title: 'Mask Recognition',
    repo: 'Mask-Recognition',
    desc: 'Mask detection for COVID-19 compliance: checks whether the user is wearing a face mask (computer vision use case).',
  },
  {
    title: 'Personal Website',
    repo: 'personal-website',
    desc: 'Personal portfolio and profile website.',
  },
  {
    title: 'React STT and TTS',
    repo: 'react-stt-and-tts',
    desc: 'Speech-to-Text and Text-to-Speech demo built with React.',
  },
];

export const ProjectsContent: React.FC = () => (
  <div className="game-modal-body">
    {PROJECTS.map((p) => (
      <div key={p.repo} className="game-modal-project">
        <h3 className="game-modal-project-title">
          <a
            href={`https://github.com/${GITHUB_USERNAME}/${p.repo}`}
            target="_blank"
            rel="noopener noreferrer"
            className="game-modal-project-link"
          >
            {p.title}
          </a>
        </h3>
        <p className="game-modal-project-desc">{p.desc}</p>
      </div>
    ))}
  </div>
);
