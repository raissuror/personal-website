# Player Character Sprites

This directory should contain your custom PNG sprite files for the player character.

## Required Files

You need to create **4 PNG files**, one for each movement direction:

1. **`player_down.png`** - Character facing down
2. **`player_left.png`** - Character facing left  
3. **`player_right.png`** - Character facing right
4. **`player_up.png`** - Character facing up

## PNG Structure Requirements

Each PNG file is structured as a **horizontal spritesheet** with **4 frames**:

```
[Frame 0] [Frame 1] [Frame 2] [Frame 3]
  Idle      Step 1    Step 2    Step 3
```

### Frame Details:
- **Frame 0**: Idle/standing pose
- **Frame 1**: First walking step
- **Frame 2**: Second walking step  
- **Frame 3**: Third walking step

### Technical Specifications:
- **Frame Width**: 64 pixels
- **Frame Height**: 64 pixels
- **Total PNG Width**: 256 pixels (64 × 4 frames)
- **Total PNG Height**: 64 pixels (1 row)
- **Format**: PNG with transparency support
- **Color Depth**: 8-bit RGBA (as detected)

## Example Layout

```
┌─────────────────────────────────────────────────────────┐
│ [Idle]  [Step1] [Step2] [Step3]                        │
│  32px    32px    32px    32px                          │
│                                                         │
│  Total: 128px × 32px                                   │
└─────────────────────────────────────────────────────────┘
```

## Animation Behavior

- **Idle Animation**: Uses Frame 0 (static)
- **Walking Animation**: Cycles through Frames 0-3 at 8 FPS
- **Direction Changes**: Automatically switches to appropriate sprite sheet

## Tips for Creating Sprites

1. **Consistent Sizing**: Keep all frames the same size (32×32)
2. **Centered Content**: Center your character within each frame
3. **Smooth Transitions**: Make walking frames flow naturally
4. **Transparency**: Use transparent backgrounds for better integration
5. **Color Consistency**: Maintain consistent colors across all directions

## File Placement

Place your PNG files directly in this directory:
```
src/assets/sprites/
├── player_down.png
├── player_left.png
├── player_right.png
├── player_up.png
└── README.md
```

The game will automatically load these sprites and create smooth animations for your character! 