import Phaser from 'phaser';
import type { NPCData } from '../types';
import { GAME_CONFIG } from '../../utils/gameConstants';

interface NPCInstance {
  sprite: Phaser.GameObjects.Sprite;
  data: NPCData;
}

export class NPCManager {
  private scene: Phaser.Scene;
  private npcs: Map<string, NPCInstance> = new Map();
  private npcData: NPCData[] = [];

  constructor(scene: Phaser.Scene, tilemap?: Phaser.Tilemaps.Tilemap) {
    this.scene = scene;
    if (tilemap) {
      this.extractNPCsFromMap(tilemap);
    } else {
      // Fallback to hardcoded positions if no tilemap provided
      this.npcData = [
        { 
          id: 'npc-about',
          type: 'about', 
          title: 'About Me', 
          x: GAME_CONFIG.NPC.POSITIONS.ABOUT.x, 
          y: GAME_CONFIG.NPC.POSITIONS.ABOUT.y, 
          color: GAME_CONFIG.NPC.POSITIONS.ABOUT.color,
          sprite: 'wizard'
        },
        { 
          id: 'npc-skills',
          type: 'skills', 
          title: 'Skills', 
          x: GAME_CONFIG.NPC.POSITIONS.SKILLS.x, 
          y: GAME_CONFIG.NPC.POSITIONS.SKILLS.y, 
          color: GAME_CONFIG.NPC.POSITIONS.SKILLS.color,
          sprite: 'knight'
        },
        { 
          id: 'npc-projects',
          type: 'projects', 
          title: 'Projects', 
          x: GAME_CONFIG.NPC.POSITIONS.PROJECTS.x, 
          y: GAME_CONFIG.NPC.POSITIONS.PROJECTS.y, 
          color: GAME_CONFIG.NPC.POSITIONS.PROJECTS.color,
          sprite: 'rogue'
        },
        { 
          id: 'npc-contact',
          type: 'contact', 
          title: 'Contact', 
          x: GAME_CONFIG.NPC.POSITIONS.CONTACT.x, 
          y: GAME_CONFIG.NPC.POSITIONS.CONTACT.y, 
          color: GAME_CONFIG.NPC.POSITIONS.CONTACT.color,
          sprite: 'skeleton'
        }
      ];
    }
    this.createNPCs();
  }

  private extractNPCsFromMap(tilemap: Phaser.Tilemaps.Tilemap) {
    // Try to get object layer first (for Tiled objects)
    const objectLayer = tilemap.getObjectLayer('Object');
    
    if (objectLayer && objectLayer.objects) {
      // Extract NPCs from object layer
      const npcColors = [
        GAME_CONFIG.NPC.POSITIONS.ABOUT.color,
        GAME_CONFIG.NPC.POSITIONS.SKILLS.color,
        GAME_CONFIG.NPC.POSITIONS.PROJECTS.color,
        GAME_CONFIG.NPC.POSITIONS.CONTACT.color
      ];
      
      const npcTitles: { [key: string]: string } = {
        'about': 'About Me',
        'skills': 'Skills',
        'projects': 'Projects',
        'contact': 'Contact'
      };

      const displayTileSize = GAME_CONFIG.TILES.FRAME_WIDTH; // 64px
      const sourceTileSize = 16; // Tiled uses 16x16 tiles
      const scale = displayTileSize / sourceTileSize;

      // Find all NPC objects
      const npcObjects = objectLayer.objects.filter((obj: any) => 
        obj.type === 'npc' && obj.properties
      );

      npcObjects.forEach((obj: any) => {
        // Extract properties
        const idProp = obj.properties.find((p: any) => p.name === 'id');
        const spriteProp = obj.properties.find((p: any) => p.name === 'sprite');
        const npcId = idProp ? idProp.value : null;
        const spriteType = spriteProp ? spriteProp.value : 'wizard'; // Default to wizard
        
        if (!npcId) {
          console.warn('NPC object found without id property:', obj);
          return;
        }

        // Calculate world position (accounting for scale)
        // Tiled objects have origin at top-left, but Phaser sprites are centered
        // So we need to add half the object's width/height to center it
        const objectWidth = (obj.width || 16) * scale;
        const objectHeight = (obj.height || 16) * scale;
        const worldX = obj.x * scale + objectWidth / 2;
        const worldY = obj.y * scale + objectHeight / 2;

        // Get color based on NPC type
        const color = npcColors.find((_, index) => {
          const types = ['about', 'skills', 'projects', 'contact'];
          return types[index] === npcId;
        }) || GAME_CONFIG.NPC.POSITIONS.ABOUT.color;

        this.npcData.push({
          id: `npc-${npcId}`,
          type: npcId,
          title: npcTitles[npcId] || npcId,
          x: worldX,
          y: worldY,
          color: color,
          sprite: spriteType
        });

        console.log(`NPC (npc-${npcId}): ${npcId} with sprite '${spriteType}' at (${worldX}, ${worldY})`);
      });

      console.log(`Extracted ${this.npcData.length} NPCs from Object layer`);
      return;
    }

    // Fallback: Try tile layer (for backward compatibility)
    const objectsLayer = tilemap.getLayer('Objects');
    if (objectsLayer && objectsLayer.tilemapLayer) {
      console.warn('Object layer not found, trying Objects tile layer...');
      const displayTileSize = GAME_CONFIG.TILES.FRAME_WIDTH; // 64px

      const npcTypes = ['about', 'skills', 'projects', 'contact'];
      const npcIds = ['npc-about', 'npc-skills', 'npc-projects', 'npc-contact'];
      const npcColors = [
        GAME_CONFIG.NPC.POSITIONS.ABOUT.color,
        GAME_CONFIG.NPC.POSITIONS.SKILLS.color,
        GAME_CONFIG.NPC.POSITIONS.PROJECTS.color,
        GAME_CONFIG.NPC.POSITIONS.CONTACT.color
      ];
      const npcTitles = ['About Me', 'Skills', 'Projects', 'Contact'];

      const npcTileStart = 5701;
      const npcTileEnd = 5716;

      const layerData = objectsLayer.data;
      if (!layerData) {
        console.warn('Objects layer has no data, using default NPC positions');
        return;
      }

      const foundNPCs: Array<{ x: number; y: number; tileIndex: number }> = [];

      for (let y = 0; y < layerData.length; y++) {
        const row = layerData[y];
        if (!row) continue;

        for (let x = 0; x < row.length; x++) {
          const tile = row[x];
          if (!tile || !tile.index) continue;

          const tileIndex = tile.index;
          if (tileIndex >= npcTileStart && tileIndex <= npcTileEnd) {
            const worldX = (x + 0.5) * displayTileSize;
            const worldY = (y + 0.5) * displayTileSize;
            foundNPCs.push({ x: worldX, y: worldY, tileIndex });
          }
        }
      }

      foundNPCs.sort((a, b) => {
        if (Math.abs(a.y - b.y) < 10) {
          return a.x - b.x;
        }
        return a.y - b.y;
      });

      foundNPCs.forEach((npc, index) => {
        if (index < npcTypes.length) {
          // Map NPC types to sprite types (fallback)
          const spriteMap: { [key: string]: string } = {
            'about': 'wizard',
            'skills': 'knight',
            'projects': 'rogue',
            'contact': 'skeleton'
          };
          
          this.npcData.push({
            id: npcIds[index],
            type: npcTypes[index],
            title: npcTitles[index],
            x: npc.x,
            y: npc.y,
            color: npcColors[index],
            sprite: spriteMap[npcTypes[index]] || 'wizard'
          });
        }
      });

      console.log(`Extracted ${this.npcData.length} NPCs from Objects tile layer`);
      return;
    }

    console.warn('No Object layer or Objects tile layer found, using default NPC positions');
  }

  private createNPCs() {
    this.npcData.forEach((data) => {
      // Determine sprite key based on sprite type
      const spriteKey = data.sprite ? `npc-${data.sprite}-idle` : 'npc-wizard-idle';
      
      // Create NPC sprite
      const npc = this.scene.add.sprite(data.x, data.y, spriteKey);
      // Set origin to center (default, but explicit for clarity)
      npc.setOrigin(0.5, 0.5);
      // Scale NPCs to match player size (128px) - NPC sprites are 32x32 frames
      npc.setDisplaySize(GAME_CONFIG.PLAYER.DISPLAY_SIZE, GAME_CONFIG.PLAYER.DISPLAY_SIZE);
      npc.setDepth(5); // Same depth as player (between Buildings_Low and Roofs)
      
      // Create idle animation if it doesn't exist
      const animKey = `${spriteKey}-anim`;
      if (!this.scene.anims.exists(animKey)) {
        this.scene.anims.create({
          key: animKey,
          frames: this.scene.anims.generateFrameNumbers(spriteKey, { start: 0, end: 3 }),
          frameRate: 4, // Slow idle animation
          repeat: -1 // Loop forever
        });
      }
      
      // Play idle animation
      npc.play(animKey);
      
      // Store NPC instance with its data
      this.npcs.set(data.id, {
        sprite: npc,
        data: data
      });
    });
  }

  // Get all NPCs as an array (for backward compatibility)
  public getNPCs(): Phaser.GameObjects.Sprite[] {
    return Array.from(this.npcs.values()).map(instance => instance.sprite);
  }

  // Get all NPC data (for backward compatibility)
  public getNPCData(): NPCData[] {
    return this.npcData;
  }

  // Get individual NPC by ID
  public getNPCById(id: string): Phaser.GameObjects.Sprite | undefined {
    return this.npcs.get(id)?.sprite;
  }

  // Get individual NPC data by ID
  public getNPCDataById(id: string): NPCData | undefined {
    return this.npcData.find(npc => npc.id === id);
  }

  // Get NPC by type
  public getNPCByType(type: string): Phaser.GameObjects.Sprite | undefined {
    const npcData = this.npcData.find(npc => npc.type === type);
    return npcData ? this.npcs.get(npcData.id)?.sprite : undefined;
  }

  // Get NPC data by type
  public getNPCDataByType(type: string): NPCData | undefined {
    return this.npcData.find(npc => npc.type === type);
  }

  // Get individual NPC instance (sprite + data)
  public getNPCInstance(id: string): NPCInstance | undefined {
    return this.npcs.get(id);
  }

  // Get all NPC instances
  public getAllNPCInstances(): NPCInstance[] {
    return Array.from(this.npcs.values());
  }

  // Legacy methods for backward compatibility
  public getNPCByIndex(index: number): Phaser.GameObjects.Sprite | undefined {
    const npcArray = Array.from(this.npcs.values());
    return npcArray[index]?.sprite;
  }

  public getNPCDataByIndex(index: number): NPCData | undefined {
    return this.npcData[index];
  }
} 