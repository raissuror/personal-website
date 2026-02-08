import Phaser from 'phaser';
import { Player, NPCManager } from '../characters';
import { InteractionManager } from '../interactions';
import { GAME_CONFIG } from '../../utils/gameConstants';

// Map and tilesets from src/assets/PixelCrawlerAssets (Vite resolves these URLs)
import mapFixUrl from '../../assets/mapFix.json?url';
import floorsTilesUrl from '../../assets/PixelCrawlerAssets/Environment/Tilesets/Floors_Tiles.png';
import waterTilesUrl from '../../assets/PixelCrawlerAssets/Environment/Tilesets/Water_tiles.png';
import wallsUrl from '../../assets/PixelCrawlerAssets/Environment/Structures/Buildings/Walls.png';
import roofsUrl from '../../assets/PixelCrawlerAssets/Environment/Structures/Buildings/Roofs.png';
import propsUrl from '../../assets/PixelCrawlerAssets/Environment/Structures/Buildings/Props.png';
import bonfire02Url from '../../assets/PixelCrawlerAssets/Environment/Structures/Stations/Bonfire/Bonfire_02-Sheet.png';
import size05Url from '../../assets/PixelCrawlerAssets/Environment/Props/Static/Trees/Model_01/Size_05.png';
import size02Url from '../../assets/PixelCrawlerAssets/Environment/Props/Static/Trees/Model_01/Size_02.png';
import rocksUrl from '../../assets/PixelCrawlerAssets/Environment/Props/Static/Rocks.png';
import idleSheetUrl from '../../assets/PixelCrawlerAssets/Entities/Npc\'s/Knight/Idle/Idle-Sheet.png';

/** Virtual input from mobile controls (joystick). -1 to 1 per axis. */
export interface VirtualInput {
  x: number;
  y: number;
}

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private npcManager!: NPCManager;
  private interactionManager!: InteractionManager;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: any;
  private tilemap!: Phaser.Tilemaps.Tilemap;
  private _pendingCallback?: (type: string, data: any) => void;

  /** Mobile: virtual joystick velocity (-1..1). Takes precedence over keyboard when non-zero. */
  private virtualVelocity: VirtualInput = { x: 0, y: 0 };
  /** Mobile: interact button pressed this frame (consumed after one update). */
  private virtualInteractJustDown = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  setInteractionCallback(callback?: (type: string, data: any) => void) {
    if (this.interactionManager) {
      this.interactionManager.setInteractionCallback(callback);
    } else {
      // Store the callback to be set when the manager is ready
      this._pendingCallback = callback;
    }
  }

  // Method to update the callback without recreating the scene
  updateInteractionCallback(callback?: (type: string, data: any) => void) {
    if (this.interactionManager) {
      this.interactionManager.updateInteractionCallback(callback);
    } else {
      // Store the callback to be set when the manager is ready
      this._pendingCallback = callback;
    }
  }

  /** Set virtual movement from mobile joystick. x, y in -1..1. */
  setVirtualVelocity(x: number, y: number) {
    this.virtualVelocity.x = Math.max(-1, Math.min(1, x));
    this.virtualVelocity.y = Math.max(-1, Math.min(1, y));
  }

  /** Trigger one interact (mobile button). Consumed after next update. */
  triggerVirtualInteract() {
    this.virtualInteractJustDown = true;
  }

  preload() {
    // Load player PNG sprites for each direction
    // Each PNG is 256x64 (4 frames horizontally, 1 row, 64x64 pixel frames)
    this.load.spritesheet('player_down', GAME_CONFIG.ASSETS.SPRITES.PLAYER_DOWN, { 
      frameWidth: GAME_CONFIG.TILES.FRAME_WIDTH, 
      frameHeight: GAME_CONFIG.TILES.FRAME_HEIGHT 
    });
    this.load.spritesheet('player_left', GAME_CONFIG.ASSETS.SPRITES.PLAYER_LEFT, { 
      frameWidth: GAME_CONFIG.TILES.FRAME_WIDTH, 
      frameHeight: GAME_CONFIG.TILES.FRAME_HEIGHT 
    });
    this.load.spritesheet('player_right', GAME_CONFIG.ASSETS.SPRITES.PLAYER_RIGHT, { 
      frameWidth: GAME_CONFIG.TILES.FRAME_WIDTH, 
      frameHeight: GAME_CONFIG.TILES.FRAME_HEIGHT 
    });
    this.load.spritesheet('player_up', GAME_CONFIG.ASSETS.SPRITES.PLAYER_UP, { 
      frameWidth: GAME_CONFIG.TILES.FRAME_WIDTH, 
      frameHeight: GAME_CONFIG.TILES.FRAME_HEIGHT 
    });

    // Load idle sprite (if you want to use it separately)
    this.load.spritesheet('player_idle', GAME_CONFIG.ASSETS.SPRITES.PLAYER_IDLE, { 
      frameWidth: GAME_CONFIG.TILES.FRAME_WIDTH, 
      frameHeight: GAME_CONFIG.TILES.FRAME_HEIGHT 
    });

    // Load NPC idle spritesheets
    // Each NPC idle spritesheet is 128x32 (4 frames horizontally, 1 row, 32x32 pixel frames)
    this.load.spritesheet('npc-wizard-idle', 'assets/npcs/wizard-idle.png', {
      frameWidth: 32,
      frameHeight: 32
    });
    this.load.spritesheet('npc-knight-idle', 'assets/npcs/knight-idle.png', {
      frameWidth: 32,
      frameHeight: 32
    });
    this.load.spritesheet('npc-rogue-idle', 'assets/npcs/rogue-idle.png', {
      frameWidth: 32,
      frameHeight: 32
    });
    this.load.spritesheet('npc-skeleton-idle', 'assets/npcs/skeleton-idle.png', {
      frameWidth: 32,
      frameHeight: 32
    });

    // Load Tiled map and tilesets from src/assets/PixelCrawlerAssets (Vite-resolved URLs)
    this.load.tilemapTiledJSON('map', mapFixUrl);

    this.load.image('Floors_Tiles', floorsTilesUrl);
    this.load.image('Water_tiles', waterTilesUrl);
    // Bonfire_02-Sheet only: 64x16, 4 frames horizontal (public/assets/tilesets)
    this.load.image('Walls', wallsUrl);
    this.load.image('Roofs', roofsUrl);
    this.load.image('Props', propsUrl);
    this.load.image('Size_05', size05Url);
    this.load.image('Size_02', size02Url);
    this.load.image('Rocks', rocksUrl);
    this.load.image('Idle-Sheet', idleSheetUrl);
    this.load.image('Bonfire_02-Sheet', bonfire02Url);
  } 

  create() {
    // Load the Tiled map
    this.createTilemap();
    
    // Create player in the center of the scene
    // Map is 40x40 tiles at 16px = 640x640, scaled to 64px = 2560x2560
    const mapWidth = 40 * GAME_CONFIG.TILES.FRAME_WIDTH; // 40 tiles * 64px
    const mapHeight = 40 * GAME_CONFIG.TILES.FRAME_WIDTH; // 40 tiles * 64px
    this.player = new Player(this, mapWidth / 2, mapHeight / 2);
    
    // Now set up collision after player is created
    this.setupCollision();
    
    // Create map boundaries based on actual map size
    this.createMapBoundaries(mapWidth, mapHeight);
    
    // Create NPCs from Objects layer in the map
    this.npcManager = new NPCManager(this, this.tilemap);
    
    // Create interaction manager
    this.interactionManager = new InteractionManager(this);
    
    // Initialize interaction zones from NPC data
    this.interactionManager.initializeFromNPCData(this.npcManager.getNPCData());
    
    // Set any pending callback that was set before the manager was ready
    if (this._pendingCallback) {
      this.interactionManager.setInteractionCallback(this._pendingCallback);
      this._pendingCallback = undefined;
    }
    
    // Setup input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasdKeys = this.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      interact: Phaser.Input.Keyboard.KeyCodes.SPACE,
      enter: Phaser.Input.Keyboard.KeyCodes.ENTER,
      zoomIn: Phaser.Input.Keyboard.KeyCodes.PLUS,
      zoomOut: Phaser.Input.Keyboard.KeyCodes.MINUS,
      resetZoom: Phaser.Input.Keyboard.KeyCodes.ZERO
    });
    
    // Setup camera with map bounds
    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
    this.cameras.main.startFollow(this.player.getSprite(), true);
    
    // Set initial zoom level
    this.cameras.main.setZoom(GAME_CONFIG.CAMERA.ZOOM);
  }

  private createTilemap() {
    const sourceTileSize = 16; // Tiled map uses 16x16 tiles
    const displayTileSize = GAME_CONFIG.TILES.FRAME_WIDTH; // Display at 64x64
    
    // Load the Tiled map JSON
    const map = this.make.tilemap({ key: 'map' });
    
    if (!map) {
      console.error('Failed to load map');
      return;
    }
    
    // Add tilesets using addTilesetImage - maps tileset names from map_fix.json to loaded image keys
    // This works for both embedded tilesets and external tilesets
    // Verify each image exists before adding
    const tilesetMappings = [
      { name: 'Floors_Tiles', key: 'Floors_Tiles' },
      { name: 'Water_tiles', key: 'Water_tiles' },
      { name: 'Bonfire_02-Sheet', key: 'Bonfire_02-Sheet' },
      { name: 'Walls', key: 'Walls' },
      { name: 'Roofs', key: 'Roofs' },
      { name: 'Props', key: 'Props' },
      { name: 'Size_05', key: 'Size_05' },
      { name: 'Size_02', key: 'Size_02' },
      { name: 'Rocks', key: 'Rocks' },
      { name: 'Idle-Sheet', key: 'Idle-Sheet' },
    ];
    
    for (const mapping of tilesetMappings) {
      if (this.textures.exists(mapping.key)) {
        const result = map.addTilesetImage(mapping.name, mapping.key);
        if (!result) {
          console.warn(`Failed to add tileset image for '${mapping.name}'`);
        }
      } else {
        console.warn(`Tileset image '${mapping.key}' not found, skipping tileset '${mapping.name}'`);
      }
    }
    
    // Map has two tilesets named "Props" (firstgid 4051 and 5711); addTilesetImage only updates the first.
    // Assign Props texture to all tilesets named "Props" so Buildings_Low and Building_Up layers render.
    if (this.textures.exists('Props')) {
      const propsTexture = this.textures.get('Props');
      map.tilesets.forEach((ts: Phaser.Tilemaps.Tileset) => {
        if (ts.name === 'Props') ts.setImage(propsTexture);
      });
    }
    
    // Verify all tilesets have images before creating layers
    const tilesetsWithImages = map.tilesets.filter(ts => {
      if (!ts.image) {
        console.warn(`Tileset '${ts.name}' (firstgid: ${ts.firstgid}) has no image, skipping`);
        return false;
      }
      return true;
    });
    
    console.log(`Loaded ${tilesetsWithImages.length} tilesets with valid images out of ${map.tilesets.length} total tilesets`);
    
    if (tilesetsWithImages.length === 0) {
      console.error('No tilesets with valid images found!');
      return;
    }
    
    // Helper function to safely create a layer
    const createLayerSafely = (layerName: string, depth: number) => {
      try {
        const layer = map.createLayer(layerName, tilesetsWithImages, 0, 0);
        if (layer) {
          layer.setDepth(depth);
          layer.setScale(displayTileSize / sourceTileSize);
          return layer;
        }
      } catch (error) {
        console.error(`Error creating layer '${layerName}':`, error);
        return null;
      }
      return null;
    };
    
    // Create layers in the correct order according to depth
    // Layer order: Ground, Ground_Detail, Water, Collision, Buildings_Low, Player (dynamic), Roofs, Objects
    
    // 1. Ground layer (base terrain) - Depth 0
    createLayerSafely('Ground', 0);
    
    // 2. Ground Detail layer - Depth 1
    createLayerSafely('Ground Detail', 1);
    
    // 3. Water layer (if exists) - Depth 2
    try {
      createLayerSafely('Water', 2);
    } catch (error) {
      // Water layer might not exist, that's okay
    }
    
    // 4. Collision layer (visible for debugging) - Depth 3
    let collisionLayer: Phaser.Tilemaps.TilemapLayer | null = null;
    try {
      // Try to create collision layer with all tilesets (it might use any tileset)
      collisionLayer = map.createLayer('Collision', tilesetsWithImages, 0, 0);
      if (collisionLayer) {
        collisionLayer.setDepth(3);
        collisionLayer.setScale(displayTileSize / sourceTileSize);
        collisionLayer.setVisible(true); // Show collision layer for debugging
        collisionLayer.setAlpha(1.0); // Full opacity to show original colors
        // Set collision using the correct method
        collisionLayer.setCollisionByExclusion([-1]);
        console.log('Collision layer created, visible, and collision set up');
      } else {
        console.warn('Collision layer creation returned null');
      }
    } catch (error) {
      console.warn('Could not create Collision layer:', error);
    }
    
    // 5. Buildings_Low layer - Depth 4 (walls, bonfire base, etc.)
    const buildingsLowLayer = createLayerSafely('Buildings_Low', 4);
    if (buildingsLowLayer) {
      buildingsLowLayer.setCollisionByExclusion([-1]);
      console.log('Buildings_Low layer created and collision set up');
    } else {
      console.warn('Buildings_Low layer failed to create');
    }
    
    // 6. Building_Up layer - Depth 5 (roof props, bonfire flames, etc.)
    createLayerSafely('Building_Up', 5);
    
    // Player will be created at depth 5 (dynamic sprite)
    
    // 7. Roofs layer - Depth 6
    createLayerSafely('Roofs', 6);
    
    // 8. Objects layer (above player) - Depth 7
    createLayerSafely('Objects', 7);
    
    // Store map reference
    this.tilemap = map;
  }

  private setupCollision() {
    if (this.tilemap && this.player) {
      // Get the collision layer from the Tiled map
      const collisionLayer = this.tilemap.getLayer('Collision');
      if (collisionLayer && collisionLayer.tilemapLayer) {
        this.physics.add.collider(this.player.getSprite(), collisionLayer.tilemapLayer);
        console.log('Player collision with Collision layer added');
      } else {
        console.warn('Collision layer not available for player collision');
      }
      
      // Add collision for Buildings_Low layer
      const buildingsLowLayer = this.tilemap.getLayer('Buildings_Low');
      if (buildingsLowLayer && buildingsLowLayer.tilemapLayer) {
        this.physics.add.collider(this.player.getSprite(), buildingsLowLayer.tilemapLayer);
        console.log('Player collision with Buildings_Low layer added');
      } else {
        console.warn('Buildings_Low layer not available for player collision');
      }
      
      // Add collision for Buildings_Low layer
      const ObjectsLayer = this.tilemap.getLayer('Objects');
      if (ObjectsLayer && ObjectsLayer.tilemapLayer) {
        this.physics.add.collider(this.player.getSprite(), ObjectsLayer.tilemapLayer);
        console.log('Player collision with Objects layer added');
      } else {
        console.warn('Objects layer not available for player collision');
      }
    }
  }


  private createMapBoundaries(mapWidth: number, mapHeight: number) {
    this.physics.world.setBounds(0, 0, mapWidth, mapHeight);
    this.player.setCollideWorldBounds(true);
    
    // Enable/disable world debug based on config
    if (GAME_CONFIG.DEBUG.SHOW_WORLD_PHYSICS) {
      this.physics.world.createDebugGraphic();
    }
  }

  update() {
    if (!this.player) return;

    // Compute velocity: mobile joystick (if any) or keyboard
    const useVirtual = this.virtualVelocity.x !== 0 || this.virtualVelocity.y !== 0;
    let velocityX = 0;
    let velocityY = 0;
    if (useVirtual) {
      velocityX = this.virtualVelocity.x * GAME_CONFIG.PLAYER.SPEED;
      velocityY = this.virtualVelocity.y * GAME_CONFIG.PLAYER.SPEED;
    } else {
      if (this.cursors.left.isDown || this.wasdKeys.left.isDown) velocityX = -GAME_CONFIG.PLAYER.SPEED;
      else if (this.cursors.right.isDown || this.wasdKeys.right.isDown) velocityX = GAME_CONFIG.PLAYER.SPEED;
      if (this.cursors.up.isDown || this.wasdKeys.up.isDown) velocityY = -GAME_CONFIG.PLAYER.SPEED;
      else if (this.cursors.down.isDown || this.wasdKeys.down.isDown) velocityY = GAME_CONFIG.PLAYER.SPEED;
    }
    this.player.updateWithVelocity(velocityX, velocityY);

    // Handle zoom controls
    this.handleZoomControls();

    // Handle interactions (keyboard or mobile button)
    const interactPressed =
      Phaser.Input.Keyboard.JustDown(this.wasdKeys.interact) ||
      Phaser.Input.Keyboard.JustDown(this.wasdKeys.enter) ||
      this.virtualInteractJustDown;
    if (this.virtualInteractJustDown) this.virtualInteractJustDown = false;
    if (interactPressed) this.checkInteractions();
  }

  private checkInteractions() {
    this.interactionManager.checkInteractions(
      this.player.getSprite(), 
      this.npcManager.getNPCData()
    );
  }

  private handleZoomControls() {
    const camera = this.cameras.main;
    const currentZoom = camera.zoom;
    
    // Zoom in
    if (Phaser.Input.Keyboard.JustDown(this.wasdKeys.zoomIn)) {
      const newZoom = Math.min(currentZoom + GAME_CONFIG.CAMERA.ZOOM_STEP, GAME_CONFIG.CAMERA.MAX_ZOOM);
      camera.setZoom(newZoom);
      console.log(`Zoom: ${newZoom.toFixed(1)}x`);
    }
    
    // Zoom out
    if (Phaser.Input.Keyboard.JustDown(this.wasdKeys.zoomOut)) {
      const newZoom = Math.max(currentZoom - GAME_CONFIG.CAMERA.ZOOM_STEP, GAME_CONFIG.CAMERA.MIN_ZOOM);
      camera.setZoom(newZoom);
      console.log(`Zoom: ${newZoom.toFixed(1)}x`);
    }
    
    // Reset zoom
    if (Phaser.Input.Keyboard.JustDown(this.wasdKeys.resetZoom)) {
      camera.setZoom(GAME_CONFIG.CAMERA.ZOOM);
      console.log(`Zoom reset to: ${GAME_CONFIG.CAMERA.ZOOM}x`);
    }
  }
} 