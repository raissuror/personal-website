/**
 * The React ↔ Phaser contract. React writes registry values and listens to game events;
 * both exist as soon as `new Phaser.Game()` returns, so there is no timing race.
 */
export const GameEvent = {
  /** Scene finished creating the world. */
  READY: 'world-ready',
  /** Nearest NPC in talking range changed. Payload: NpcId | null. */
  NEARBY: 'npc-nearby',
  /** Player talked to an NPC. Payload: NpcId. */
  TALK: 'npc-talk',
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
