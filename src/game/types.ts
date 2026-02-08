export interface NPCData {
  id: string;
  type: string;
  title: string;
  x: number;
  y: number;
  color: number;
  sprite?: string; // NPC sprite type (wizard, knight, rogue, skeleton)
} 