/**
 * Portfolio projects. Used by the Reindeer's section, the project spots placed around the camp
 * (Tiled object layer "Projects", object name = project id) and the summary page.
 *
 * `image` is relative to public/assets/projects/. Projects without one get a pixel placeholder.
 */

export interface ProjectLink {
  label: string;
  url: string;
}

export interface Collaborator {
  name: string;
  /** LinkedIn or other profile URL; shown as a link when set. */
  url?: string;
}

export interface Project {
  id: string;
  title: string;
  /** One line under the title. */
  tagline: string;
  description: string;
  tech: string[];
  links: ProjectLink[];
  image?: string;
  /** Extra screenshots (relative to public/assets/projects/), shown in the project modal. */
  screenshots?: { file: string; caption: string }[];
  collaborators?: Collaborator[];
}

const github = (repo: string): ProjectLink => ({ label: 'GitHub', url: `https://github.com/raissuror/${repo}` });

export const PROJECTS: Project[] = [
  {
    id: 'hearthhold',
    title: 'HearthHold',
    tagline: 'Browser MMO strategy game · collaboration',
    description:
      'A cozy 3D voxel castle-strategy MMO that runs in the browser. Players build a walled town, work resource fields and march armies across a shared world map with other players and AI lords. Free to play, with no pay-to-win.',
    tech: ['TypeScript', 'React', 'Three.js', 'Node.js', 'WebSocket', 'Zustand'],
    links: [{ label: 'Play it', url: 'https://playhearthhold.com/' }],
    image: 'hearthhold.webp',
    collaborators: [{ name: 'Haris Putratama', url: 'https://www.linkedin.com/in/haris-putratama-03b373187/' }],
  },
  {
    id: 'go-life',
    title: 'Go-Life',
    tagline: 'Super-app style planner',
    description:
      'Go-Planner: a full-stack app inspired by super-apps like Gojek, with personalized recommendations and budget management. Split into two main modules.',
    tech: ['JavaScript', 'Python'],
    links: [github('go-life')],
    image: 'go-life.webp',
    screenshots: [
      { file: 'go-life-home.webp', caption: 'Home' },
      { file: 'go-life-budget.webp', caption: 'Budget planner' },
    ],
  },
  {
    id: 'mask-recognition',
    title: 'Mask Recognition',
    tagline: 'Computer vision',
    description:
      'Mask detection for COVID-19 compliance: checks whether a person is wearing a face mask, from a trained model to a small web front end.',
    tech: ['Python', 'Jupyter', 'Computer vision'],
    links: [github('Mask-Recognition')],
  },
  {
    id: 'personal-website',
    title: 'The Outpost',
    tagline: "This website, you're standing in it",
    description:
      'A walk-and-talk portfolio: a pixel-art camp built in Tiled and rendered with Phaser, with the interface in React.',
    tech: ['TypeScript', 'React', 'Phaser', 'Tiled'],
    links: [github('personal-website')],
    image: 'the-outpost.webp',
  },
  {
    id: 'react-stt-and-tts',
    title: 'React STT and TTS',
    tagline: 'Speech in the browser',
    description: 'A Speech-to-Text and Text-to-Speech demo built with React.',
    tech: ['JavaScript', 'React'],
    links: [github('react-stt-and-tts')],
  },
];

export const projectById = (id: string) => PROJECTS.find((p) => p.id === id);

const assetUrl = (file: string) => `${import.meta.env.BASE_URL}assets/projects/${file}`;

export const projectImageUrl = (p: Project) => (p.image ? assetUrl(p.image) : undefined);

export const projectScreenshots = (p: Project) =>
  (p.screenshots ?? []).map((s) => ({ url: assetUrl(s.file), caption: s.caption }));
