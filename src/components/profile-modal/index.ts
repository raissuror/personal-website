import React from 'react';
import { AboutContent } from './AboutContent';
import { SkillsContent } from './SkillsContent';
import { ProjectsContent } from './ProjectsContent';
import { ContactContent } from './ContactContent';
import { DefaultContent } from './DefaultContent';

export type ModalContentType = 'about' | 'skills' | 'projects' | 'contact';

const CONTENT_MAP: Record<string, React.FC> = {
  about: AboutContent,
  skills: SkillsContent,
  projects: ProjectsContent,
  contact: ContactContent,
};

export function getModalContent(type: string): React.FC {
  return CONTENT_MAP[type] ?? DefaultContent;
}

export { AboutContent, SkillsContent, ProjectsContent, ContactContent, DefaultContent };
