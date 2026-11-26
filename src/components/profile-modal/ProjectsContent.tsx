import React from 'react';
import { PROJECTS } from '../../content/projects';
import { ProjectCard } from '../ProjectCard';

export const ProjectsContent: React.FC = () => (
  <div className="game-modal-body">
    <p className="game-modal-paragraph">
      A few things I've built. In the camp, look for the glowing markers: each project has its own landmark.
    </p>
    <div className="project-list">
      {PROJECTS.map((p) => (
        <ProjectCard key={p.id} project={p} />
      ))}
    </div>
  </div>
);
