import Phaser from 'phaser';
import type { NPCData } from '../types';
import { GAME_CONFIG } from '../../utils/gameConstants';

export interface InteractionZone {
  id: string;
  x: number;
  y: number;
  type: string;
  title: string;
}

export class InteractionManager {
  private scene: Phaser.Scene;
  private interactionZones: Phaser.GameObjects.Rectangle[] = [];
  private interactionLabels: Phaser.GameObjects.Text[] = [];
  private interactionCallback?: (type: string, data: any) => void;
  private zoneData: InteractionZone[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    // Interaction zones will be created from NPC data, not hardcoded
  }

  public initializeFromNPCData(npcData: NPCData[]) {
    // Clear existing zones and labels
    this.interactionZones.forEach(zone => zone.destroy());
    this.interactionLabels.forEach(label => label.destroy());
    this.interactionZones = [];
    this.interactionLabels = [];
    this.zoneData = [];

    // Create zones from NPC data
    npcData.forEach((npc) => {
      this.zoneData.push({
        id: npc.id,
        x: npc.x,
        y: npc.y,
        type: npc.type,
        title: npc.title
      });
    });

    this.createInteractionZones();
  }

  public setInteractionCallback(callback?: (type: string, data: any) => void) {
    this.interactionCallback = callback;
  }

  public updateInteractionCallback(callback?: (type: string, data: any) => void) {
    this.interactionCallback = callback;
  }

  private createInteractionZones() {
    // Group NPCs by Y position to avoid label overlap
    const npcsByRow = new Map<number, InteractionZone[]>();
    this.zoneData.forEach((data) => {
      const rowY = Math.round(data.y / 64) * 64; // Round to nearest tile row
      if (!npcsByRow.has(rowY)) {
        npcsByRow.set(rowY, []);
      }
      npcsByRow.get(rowY)!.push(data);
    });

    // Create zones and labels with smart positioning
    this.zoneData.forEach((data) => {
      const zone = this.scene.add.rectangle(
        data.x, 
        data.y, 
        GAME_CONFIG.INTERACTION.ZONE_SIZE, 
        GAME_CONFIG.INTERACTION.ZONE_SIZE, 
        0xffffff, 
        GAME_CONFIG.INTERACTION.ZONE_ALPHA
      );
      zone.setStrokeStyle(
        GAME_CONFIG.INTERACTION.ZONE_STROKE_WIDTH, 
        0xffffff, 
        GAME_CONFIG.INTERACTION.ZONE_STROKE_ALPHA
      );
      zone.setVisible(false); // Hide zones by default (they're just for collision/interaction)
      this.interactionZones.push(zone);
      
      // Calculate label position to avoid overlap
      // For NPCs on the same row, offset labels vertically
      const rowY = Math.round(data.y / 64) * 64;
      const rowNPCs = npcsByRow.get(rowY) || [];
      const npcIndexInRow = rowNPCs.findIndex(npc => npc.id === data.id);
      
      // Position labels above NPCs, with slight vertical offset for same-row NPCs
      const labelY = data.y - 50 - (npcIndexInRow * 20); // Offset by 20px for each NPC in same row
      
      // Add text labels with pixel font
      const label = this.scene.add.text(data.x, labelY, data.title, {
        // fontFamily: 'Press Start 2P',
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
      }).setOrigin(0.5).setDepth(10); // Higher depth to appear above everything
      
      this.interactionLabels.push(label);
    });
  }

  public checkInteractions(player: Phaser.Physics.Arcade.Sprite, npcData: NPCData[]) {
    const playerX = player.x;
    const playerY = player.y;
    
    npcData.forEach((npc) => {
      const distance = Phaser.Math.Distance.Between(playerX, playerY, npc.x, npc.y);
      
      if (distance < GAME_CONFIG.NPC.INTERACTION_DISTANCE) {
        try {
          if (this.interactionCallback) {
            this.interactionCallback(npc.type, {
              id: npc.id,
              title: npc.title,
              position: { x: npc.x, y: npc.y }
            });
          }
        } catch (error) {
          console.error('Error calling interactionCallback:', error);
        }
      }
    });
  }

  // Get interaction zone by NPC ID
  public getZoneById(id: string): Phaser.GameObjects.Rectangle | undefined {
    const zoneIndex = this.zoneData.findIndex(zone => zone.id === id);
    return zoneIndex >= 0 ? this.interactionZones[zoneIndex] : undefined;
  }

  // Get interaction zone data by NPC ID
  public getZoneDataById(id: string): InteractionZone | undefined {
    return this.zoneData.find(zone => zone.id === id);
  }

  // Get interaction zone by type
  public getZoneByType(type: string): Phaser.GameObjects.Rectangle | undefined {
    const zoneIndex = this.zoneData.findIndex(zone => zone.type === type);
    return zoneIndex >= 0 ? this.interactionZones[zoneIndex] : undefined;
  }

  // Get label by NPC ID
  public getLabelById(id: string): Phaser.GameObjects.Text | undefined {
    const zoneIndex = this.zoneData.findIndex(zone => zone.id === id);
    return zoneIndex >= 0 ? this.interactionLabels[zoneIndex] : undefined;
  }

  // Show/hide label by ID
  public setLabelVisible(id: string, visible: boolean) {
    const label = this.getLabelById(id);
    if (label) {
      label.setVisible(visible);
    }
  }

  // Show/hide all labels
  public setAllLabelsVisible(visible: boolean) {
    this.interactionLabels.forEach(label => label.setVisible(visible));
  }

  public getInteractionZones(): Phaser.GameObjects.Rectangle[] {
    return this.interactionZones;
  }

  public getInteractionLabels(): Phaser.GameObjects.Text[] {
    return this.interactionLabels;
  }

  public getZoneData(): InteractionZone[] {
    return this.zoneData;
  }
} 