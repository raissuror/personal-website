# 🎮 Interactive Profile Game

A Pokémon-style interactive portfolio website built with React, TypeScript, and Phaser 3. Navigate through a game world to explore different sections of the portfolio.

## ✨ Features

- **Interactive Game World**: Explore a tile-based world with your character
- **NPC Interactions**: Talk to different NPCs to learn about skills, projects, and contact info
- **Responsive Design**: Works on both desktop and mobile devices
- **Modern UI**: Clean, pixel-art inspired interface with Tailwind CSS
- **Smooth Controls**: WASD or arrow keys for movement, Space/Enter for interactions

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/raissuror/personal-website.git
cd profile-website-game
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🎯 How to Play

### Controls
- **Move**: WASD or arrow keys (joystick on mobile)
- **Run**: hold Shift (push the joystick to the edge on mobile)
- **Talk**: E, Space or Enter when next to an NPC (the **E** button on mobile)
- **Close a section**: Escape, E, or click outside
- **F2**: show collision boxes and talk radii (handy after editing the map)

### Who to find (around the campfire)
- **Penguin**: About me
- **Polar Bear**: Skills
- **Reindeer**: Projects
- **Snowy Owl**: Contact

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Game Engine**: Phaser 3
- **Maps**: Tiled (JSON `.tmj` with external `.tsj` tilesets)
- **Styling**: Tailwind CSS
- **Build Tool**: Vite

## 📁 Project Structure

```
public/assets/world/        # Everything the game world loads at runtime
├── maps/outpost.tmj        # The Tiled map (edit this)
├── tilesets/               # ground.tsj (16px atlas) + props.tsj (image collection)
├── sprites/                # Player, NPC, animal and prop PNGs
└── animations.json         # Spritesheet frame size / count / fps per animation
world.tiled-project         # Open this in Tiled
src/
├── App.tsx                 # Modal state; pauses the game while a section is open
├── components/
│   ├── GameCanvas.tsx      # Creates the Phaser game, talk prompt, mobile controls
│   ├── GameUI.tsx          # Controls + "who to find" overlay
│   ├── ProfileModal.tsx    # Dialogue step → full section
│   └── profile-modal/      # About / Skills / Projects / Contact content
└── game/
    ├── npcs.ts             # NPC names, sections, sprites and teaser lines
    ├── world.ts            # Loads the .tmj and its external tilesets
    ├── bridge.ts           # React ↔ Phaser events and registry keys
    └── WorldScene.ts       # The Phaser scene
```

## 🗺️ Editing the map in Tiled

Open `world.tiled-project` in Tiled, then `public/assets/world/maps/outpost.tmj`. Save as JSON and refresh the browser.

| Layer | Purpose |
| --- | --- |
| Ground | 16px tile layer |
| Scenery | Prop tile objects (bottom-left anchor). Add an `animation` property to play an entry from `animations.json` |
| Spawns | Point named `player` (the player's feet) |
| Collision | Rectangles the player can't walk through (hidden in Tiled by default) |
| NPCs | Points of type `npc` named `about`, `skills`, `projects` or `contact` (the NPC's feet) |

Moving a prop does **not** move its collision rectangle. Move both together. Only rectangle colliders are supported.

## 🎨 Customization

- **NPC text, names and sprites**: `src/game/npcs.ts`
- **Section content**: `src/components/profile-modal/*Content.tsx`
- **Add a section**: add an entry to `NPCS` in `npcs.ts`, a content component in `profile-modal/index.ts`, and an `npc` point with that name on the map's `NPCs` layer.

## 🚀 Deployment

### Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

### Netlify

1. Build the project:
```bash
npm run build
```

2. Upload the `dist/` folder to Netlify

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Features

1. **New Game Mechanics**: Extend the `GameScene` class
2. **UI Components**: Create new React components in `components/`
3. **Profile Content**: Update the modal content in `ProfileModal.tsx`

## 📝 License

MIT License - feel free to use this project for your own portfolio!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

If you have any questions or need help, feel free to open an issue on GitHub.

---

**Happy coding! 🎮✨**
