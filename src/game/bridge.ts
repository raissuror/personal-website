/**
 * The React ↔ Phaser contract. React writes registry values and listens to game events;
 * both exist as soon as `new Phaser.Game()` returns, so there is no timing race.
 */
export const GameEvent = {
  /** Scene finished creating the world. */
  READY: 'world-ready',
  /** Nearest interactable in range changed. Payload: SpotRef | null. */
  NEARBY: 'spot-nearby',
  /** Player interacted with something. Payload: SpotRef. */
  TALK: 'spot-talk',
  /** Mobile interact button pressed. */
  VIRTUAL_INTERACT: 'virtual-interact',
} as const;

export const RegistryKey = {
  /** WorldData from loadWorld(). */
  WORLD: 'world',
  /** boolean: freeze the player and release the keyboard (e.g. while a modal is open). */
  PAUSED: 'paused',
  /** { x, y } in -1..1 from the mobile joystick. */
  VIRTUAL_MOVE: 'virtualMove',
} as const;

/** Things you can walk up to: the four locals, project landmarks, hidden secrets, trail signposts. */
export type SpotKind = 'npc' | 'project' | 'secret' | 'trail';

export interface SpotRef {
  kind: SpotKind;
  /** NpcId, project id, secret id, or the trail stop index as a string. */
  id: string;
}
