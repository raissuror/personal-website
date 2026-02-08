# Game Constants Configuration

This file contains all the configurable game settings in one place for easy modification.

## 📁 File Location
`src/utils/gameConstants.ts`

## 🎮 How to Use

### **Player Settings**
```typescript
GAME_CONFIG.PLAYER.DISPLAY_SIZE = 128;        // Character size
GAME_CONFIG.PLAYER.HITBOX_WIDTH = 16;         // Collision width
GAME_CONFIG.PLAYER.HITBOX_HEIGHT = 30;        // Collision height
GAME_CONFIG.PLAYER.SPEED = 200;               // Movement speed
```

### **Debug Settings**
```typescript
GAME_CONFIG.DEBUG.SHOW_PLAYER_HITBOX = true;           // Show green hitbox
GAME_CONFIG.DEBUG.SHOW_SPRITE_FRAME_BORDER = true;     // Show red frame border
GAME_CONFIG.DEBUG.SHOW_WORLD_PHYSICS = true;           // Show world collision
```

### **NPC Positions**
```typescript
GAME_CONFIG.NPC.POSITIONS.ABOUT = { x: 300, y: 300, color: 0xe74c3c };
GAME_CONFIG.NPC.POSITIONS.SKILLS = { x: 900, y: 500, color: 0xf39c12 };
// ... etc
```

### **World Settings**
```typescript
GAME_CONFIG.WORLD.WIDTH = 1600;               // Map width
GAME_CONFIG.WORLD.HEIGHT = 1200;              // Map height
GAME_CONFIG.TILES.FRAME_WIDTH = 64;           // Tile size
```

## 🔧 Quick Adjustments

### **Change Character Size**
```typescript
GAME_CONFIG.PLAYER.DISPLAY_SIZE = 64;  // Smaller character
GAME_CONFIG.PLAYER.DISPLAY_SIZE = 256; // Larger character
```

### **Adjust Hitbox**
```typescript
GAME_CONFIG.PLAYER.HITBOX_WIDTH = 20;   // Wider hitbox
GAME_CONFIG.PLAYER.HITBOX_HEIGHT = 40;  // Taller hitbox
GAME_CONFIG.PLAYER.HITBOX_OFFSET_X = 0; // Move left/right
GAME_CONFIG.PLAYER.HITBOX_OFFSET_Y = 30; // Move up/down
```

### **Toggle Debug Mode**
```typescript
GAME_CONFIG.DEBUG.SHOW_PLAYER_HITBOX = false;        // Hide hitbox
GAME_CONFIG.DEBUG.SHOW_SPRITE_FRAME_BORDER = false;  // Hide frame border
GAME_CONFIG.DEBUG.SHOW_WORLD_PHYSICS = false;        // Hide world debug
```

### **Change Movement Speed**
```typescript
GAME_CONFIG.PLAYER.SPEED = 150;  // Slower movement
GAME_CONFIG.PLAYER.SPEED = 300;  // Faster movement
```

### **Adjust Zoom Settings**
```typescript
GAME_CONFIG.CAMERA.ZOOM = 1.5;        // Default zoom level
GAME_CONFIG.CAMERA.MIN_ZOOM = 0.3;    // Minimum zoom (more zoomed out)
GAME_CONFIG.CAMERA.MAX_ZOOM = 4.0;    // Maximum zoom (more zoomed in)
GAME_CONFIG.CAMERA.ZOOM_STEP = 0.2;   // How much to zoom per keypress
```

### **Move NPCs**
```typescript
GAME_CONFIG.NPC.POSITIONS.ABOUT.x = 400;  // Move About NPC
GAME_CONFIG.NPC.POSITIONS.ABOUT.y = 200;  // Move About NPC
```

## 🎯 Benefits

✅ **One File to Rule Them All** - All settings in one place  
✅ **Easy Tweaking** - No need to hunt through multiple files  
✅ **Type Safety** - TypeScript ensures you use correct values  
✅ **Documentation** - Clear comments explain each setting  
✅ **Consistency** - Same values used everywhere automatically  

## 🎮 Zoom Controls

**Keyboard Controls:**
- **+ (Plus) Key**: Zoom in
- **- (Minus) Key**: Zoom out  
- **0 (Zero) Key**: Reset zoom to default

**Zoom Levels:**
- **0.5x**: Very zoomed out (see more of the world)
- **1.0x**: Normal zoom (default)
- **2.0x**: Zoomed in (see details better)
- **3.0x**: Very zoomed in (maximum)

## 🚀 Pro Tips

1. **Start with debug settings** to see what you're changing
2. **Adjust hitbox first** to get collision detection right
3. **Then adjust display size** for visual appearance
4. **Use zoom controls** to find the perfect view
5. **Use small increments** when fine-tuning positions
6. **Save frequently** and test changes immediately

Happy tweaking! 🎮✨
