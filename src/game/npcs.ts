/**
 * Portfolio NPCs. Each one is placed in Tiled as a point object on the `NPCs`
 * layer (type `npc`) whose name matches a key below. The point is the NPC's feet.
 */
export type NpcId = 'about' | 'skills' | 'projects' | 'contact';

export interface NpcInfo {
  name: string;
  section: string;
  /** Animation key from public/assets/world/animations.json (4-frame 32×32 strip). */
  sprite: string;
  teaser: string;
}

export const NPCS: Record<NpcId, NpcInfo> = {
  about: {
    name: 'Penguin',
    section: 'About me',
    sprite: 'north-pole-penguin-idle-front',
    teaser: "Welcome to the outpost! Warm up by the fire and I'll tell you about the person who built this place.",
  },
  skills: {
    name: 'Polar Bear',
    section: 'Skills',
    sprite: 'north-pole-polar-bear-idle-front',
    teaser: "Strong paws, strong stack. Want to see the skills I've been guarding?",
  },
  projects: {
    name: 'Reindeer',
    section: 'Projects',
    sprite: 'north-pole-reindeer-idle-left',
    teaser: "I've hauled every project across this tundra. Come see what's been built!",
  },
  contact: {
    name: 'Snowy Owl',
    section: 'Contact',
    sprite: 'north-pole-snowy-owl-perched-front',
    teaser: "Hoo's looking to get in touch? I deliver messages faster than any sled.",
  },
};

/** Display order for menus and section navigation. */
export const NPC_ORDER = Object.keys(NPCS) as NpcId[];

export const isNpcId = (id: string): id is NpcId => id in NPCS;

export const WORLD_BASE = `${import.meta.env.BASE_URL}assets/world/`;

/** Portrait strip URL for React UI (relative, so it works with Vite's `base: './'`). */
export const npcPortraitUrl = (id: NpcId) => `${WORLD_BASE}sprites/${NPCS[id].sprite}.png`;
