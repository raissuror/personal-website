/**
 * Hidden things to find around the camp (Tiled object layer "Secrets", object name = id).
 * They have no label; the talk prompt only appears when you're right next to one.
 */
export interface Secret {
  id: string;
  title: string;
  text: string;
  /** Sprite (animation key) used as the portrait, if any. */
  sprite?: string;
}

export const SECRETS: Secret[] = [
  {
    id: 'fox',
    title: 'Arctic Fox',
    sprite: 'north-pole-arctic-fox-idle-left',
    text: "Psst, I'm not on the guest list. Fun fact: this whole outpost was mapped in Tiled, brought to life with Phaser, and wired up with React.",
  },
  {
    id: 'ice-hole',
    title: 'Fishing Hole',
    text: 'You dip a line into the ice and pull out a tiny pixel fish. Nothing to do with the CV, but nice catch!',
  },
  {
    id: 'bottle',
    title: 'Message in a Bottle',
    text: "\"Thanks for exploring every corner. Curious people are my favourite kind of people. Say hi!\" (Rais)",
  },
];

export const secretById = (id: string) => SECRETS.find((s) => s.id === id);
