// Game Configuration Constants
// Centralized settings for easy modification

export const GAME_CONFIG = {
  // Player Configuration
  PLAYER: {
    // Sprite settings
    DISPLAY_SIZE: 128,
    DISPLAY_WIDTH: 128,
    DISPLAY_HEIGHT: 128,
    
    // Hitbox settings
    HITBOX_WIDTH: 16,
    HITBOX_HEIGHT: 30,
    HITBOX_OFFSET_X: 24,
    HITBOX_OFFSET_Y: 24,
    
    // Movement settings
    SPEED: 200,
    
    // Animation settings
    WALK_FRAME_RATE: 8,
    IDLE_FRAME_RATE: 1,
  },

  // World Configuration
  WORLD: {
    WIDTH: 2560,  // 40 tiles * 64 pixels (from Tiled map)
    HEIGHT: 2560, // 40 tiles * 64 pixels (from Tiled map)
    TILE_SIZE: 64,
  },

  // Camera Configuration
  CAMERA: {
    BOUNDS_X: 0,
    BOUNDS_Y: 0,
    BOUNDS_WIDTH: 2560, // Match map width
    BOUNDS_HEIGHT: 2560, // Match map height
    ZOOM: 1.0, // 1.0 = normal, 0.5 = zoomed out, 2.0 = zoomed in
    MIN_ZOOM: 0.5,
    MAX_ZOOM: 3.0,
    ZOOM_STEP: 0.1,
  },

  // NPC Configuration
  NPC: {
    DISPLAY_SIZE: 32,
    INTERACTION_DISTANCE: 80,
    POSITIONS: {
      ABOUT: { x: 640, y: 480, color: 0xe74c3c },     // Near the church (left side)
      SKILLS: { x: 800, y: 608, color: 0xf39c12 },    // Near the fountain (center)
      PROJECTS: { x: 960, y: 480, color: 0x9b59b6 },  // Near the tower (right side)
      CONTACT: { x: 1120, y: 480, color: 0x1abc9c },  // Near the workshop (far right)
    },
  },

  // Interaction Zones
  INTERACTION: {
    ZONE_SIZE: 80,
    ZONE_ALPHA: 0.1,
    ZONE_STROKE_WIDTH: 2,
    ZONE_STROKE_ALPHA: 0.3,
  },

  // Debug Configuration
  DEBUG: {
    SHOW_PLAYER_HITBOX: false,
    SHOW_SPRITE_FRAME_BORDER: false,
    SHOW_WORLD_PHYSICS: false,
    HITBOX_BORDER_COLOR: 0x00ff00, // Green
    SPRITE_FRAME_BORDER_COLOR: 0xff0000, // Red
    SPRITE_FRAME_BORDER_WIDTH: 2,
  },

  // Asset Paths
  ASSETS: {
    SPRITES: {
      PLAYER_DOWN: 'assets/sprites/player_down.png',
      PLAYER_LEFT: 'assets/sprites/player_left.png',
      PLAYER_RIGHT: 'assets/sprites/player_right.png',
      PLAYER_UP: 'assets/sprites/player_up.png',
      PLAYER_IDLE: 'assets/sprites/player_idle.png',
      NPC: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    },
    TILESETS: {
      FLOORS: 'assets/tilesets/Floors_Tiles.png',
      WATER: 'assets/tilesets/Water_tiles.png',
      WALLS: 'assets/tilesets/Wall_Tiles.png',
      WALL_VARIATIONS: 'assets/tilesets/Wall_Variations.png',
      DUNGEON: 'assets/tilesets/Dungeon_Tiles.png',
    },
    PROPS: {
      TREES: {
        MODEL_01_SIZE_02: 'assets/props/trees/Model_01_Size_02.png',
        MODEL_01_SIZE_03: 'assets/props/trees/Model_01_Size_03.png',
        MODEL_01_SIZE_04: 'assets/props/trees/Model_01_Size_04.png',
        MODEL_02_SIZE_02: 'assets/props/trees/Model_02_Size_02.png',
        MODEL_02_SIZE_03: 'assets/props/trees/Model_02_Size_03.png',
        MODEL_02_SIZE_04: 'assets/props/trees/Model_02_Size_04.png',
        MODEL_03_SIZE_02: 'assets/props/trees/Model_03_Size_02.png',
        MODEL_03_SIZE_03: 'assets/props/trees/Model_03_Size_03.png',
        MODEL_03_SIZE_04: 'assets/props/trees/Model_03_Size_04.png',
      },
      ROCKS: 'assets/props/Rocks.png',
      VEGETATION: 'assets/props/Vegetation.png',
      FURNITURE: 'assets/props/Furniture.png',
      FARM: 'assets/props/Farm.png',
    },
    STRUCTURES: {
      BUILDINGS: {
        FLOORS: 'assets/structures/Buildings_Floors.png',
        WALLS: 'assets/structures/Buildings_Walls.png',
        ROOFS: 'assets/structures/Buildings_Roofs.png',
        PROPS: 'assets/structures/Buildings_Props.png',
        SHADOWS: 'assets/structures/Buildings_Shadows.png',
      },
      STATIONS: {
        WORKBENCH: 'assets/structures/Workbench.png',
        ANVIL: 'assets/structures/Anvil.png',
        BONFIRE: 'assets/structures/Bonfire.png',
        COOKING_STATION: 'assets/structures/Cooking_Station.png',
      },
    },
  },

  // Tile Configuration
  TILES: {
    FRAME_WIDTH: 64,
    FRAME_HEIGHT: 64,
    TYPES: {
      0: { name: 'water', color: 0x1e3a8a, walkable: false },        // Deep blue ocean
      1: { name: 'shallow_water', color: 0x3b82f6, walkable: false }, // Light blue shoreline
      2: { name: 'sand', color: 0xfbbf24, walkable: true },          // Sandy beach
      3: { name: 'grass_center', color: 0x22c55e, walkable: true },         // Green grass center (surrounded by grass)
      4: { name: 'stone_path', color: 0x6b7280, walkable: true },    // Grey stone plaza
      5: { name: 'fountain', color: 0x60a5fa, walkable: false },     // Blue fountain
      6: { name: 'bridge', color: 0x92400e, walkable: true },        // Brown wooden bridge
      7: { name: 'tree', color: 0x16a34a, walkable: false },         // Green deciduous tree
      8: { name: 'palm_tree', color: 0x15803d, walkable: false },    // Darker green palm tree
      9: { name: 'rock', color: 0x9ca3af, walkable: false },         // Grey rocks
      10: { name: 'church', color: 0xdc2626, walkable: false },      // Red church building
      11: { name: 'brick_building', color: 0x7c2d12, walkable: false }, // Brown brick building
      12: { name: 'tower', color: 0x6b7280, walkable: false },       // Grey stone tower
      13: { name: 'workshop_east', color: 0x1d4ed8, walkable: false }, // Blue workshop building
      14: { name: 'workshop_west', color: 0x92400e, walkable: false }, // Brown carpentry stall
      15: { name: 'well', color: 0x92400e, walkable: false },        // Brown wooden well
      16: { name: 'fence', color: 0x92400e, walkable: false },       // Brown wooden fence
      17: { name: 'crate', color: 0x92400e, walkable: false },       // Brown crate
      18: { name: 'barrel', color: 0x92400e, walkable: false },      // Brown barrel
      19: { name: 'boat', color: 0xdc2626, walkable: false },        // Red boat
      20: { name: 'flower', color: 0xec4899, walkable: true },       // Pink flower
      // Grass edge variants
      21: { name: 'grass_top', color: 0x22c55e, walkable: true },    // Grass top edge (touching sand/water above)
      22: { name: 'grass_bottom', color: 0x22c55e, walkable: true },  // Grass bottom edge (touching sand/water below)
      23: { name: 'grass_left', color: 0x22c55e, walkable: true },   // Grass left edge (touching sand/water left)
      24: { name: 'grass_right', color: 0x22c55e, walkable: true },  // Grass right edge (touching sand/water right)
      // Grass corner variants
      25: { name: 'grass_top_left', color: 0x22c55e, walkable: true },    // Grass top-left corner
      26: { name: 'grass_top_right', color: 0x22c55e, walkable: true },   // Grass top-right corner
      27: { name: 'grass_bottom_left', color: 0x22c55e, walkable: true }, // Grass bottom-left corner
      28: { name: 'grass_bottom_right', color: 0x22c55e, walkable: true }, // Grass bottom-right corner
    },
  },

  // Input Configuration
  INPUT: {
    KEYS: {
      UP: 'W',
      DOWN: 'S',
      LEFT: 'A',
      RIGHT: 'D',
      INTERACT: 'SPACE',
      ENTER: 'ENTER',
      ZOOM_IN: 'EQUAL', // + key
      ZOOM_OUT: 'MINUS', // - key
      RESET_ZOOM: 'ZERO', // 0 key
    },
  },
} as const;

// Type definitions for better TypeScript support
export type GameConfig = typeof GAME_CONFIG;
export type PlayerConfig = typeof GAME_CONFIG.PLAYER;
export type WorldConfig = typeof GAME_CONFIG.WORLD;
export type NPCConfig = typeof GAME_CONFIG.NPC;
export type DebugConfig = typeof GAME_CONFIG.DEBUG;