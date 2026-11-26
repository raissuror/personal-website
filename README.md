# 🎮 Interactive Profile Game

A Pokémon-style interactive portfolio website built with React, TypeScript, and Phaser 3. Navigate through a game world to explore different sections of the portfolio.

## ✨ Features

- **Walk-and-talk portfolio**: a snowy pixel-art camp; four locals each hold one section
- **Project landmarks**: each project has its own spot in the camp (glowing ◆ markers)
- **Secrets**: three hidden things to find, counted in the HUD and the finish card
- **Living camp**: falling snow, footprints, day / dusk / night from the visitor's clock, NPCs that notice you
- **Sound** (off by default): wind, campfire, footsteps, dialogue blips; all synthesized, no audio files
- **Summary page**: `?view=summary` shows everything on one scrollable, printable page, without loading the game
- **Fast first load**: Phaser is split into its own chunk and fetched while the intro card is showing
- **Link previews**: Open Graph / Twitter tags with `public/og-image.jpg`

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
- **Talk / look**: E, Space or Enter when next to something (the **TALK** button on mobile)
- **Close**: Escape, E, or click outside
- **Sound on / off**: M, or the ♪ button
- **F2**: show collision boxes and talk radii (handy after editing the map)
- **Preview lighting**: add `?time=day`, `?time=dusk` or `?time=night` to the URL

### Who to find (around the campfire)
- **Penguin**: About me
- **Polar Bear**: Skills
- **Reindeer**: Projects
- **Snowy Owl**: Contact

Projects: lighthouse (HearthHold), husky sled (Go-Life), notice board (this site), radio tower (React STT and TTS), weather station (Mask Recognition).

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Game Engine**: Phaser 3
- **Maps**: Tiled (JSON `.tmj` with external `.tsj` tilesets)
- **Styling**: Tailwind CSS
- **Build Tool**: Vite

## 📁 Project Structure

```
public/
├── assets/world/           # Everything the game world loads at runtime
│   ├── maps/outpost.tmj    # The Tiled map (edit this)
│   ├── tilesets/           # ground.tsj (16px atlas) + props.tsj (image collection)
│   ├── sprites/            # Player, NPC, animal and prop PNGs
│   └── animations.json     # Spritesheet frame size / count / fps per animation
├── assets/projects/        # Project preview images
├── og-image.jpg            # Link preview image (1200×630)
└── favicon.png
world.tiled-project         # Open this in Tiled
src/
├── App.tsx                 # Game vs summary view, modal state, met / found progress
├── audio/sound.ts          # Synthesized ambience and effects (Web Audio)
├── content/                # ✏️ Your content: projects, contacts, career, secrets
├── components/
│   ├── GameCanvas.tsx      # Lazy-loads Phaser, talk prompt, mobile controls
│   ├── Hud.tsx             # Top-left chip, controls, locals, secrets, sound toggle
│   ├── WelcomeCard.tsx     # First-visit intro
│   ├── ProfileModal.tsx    # Dialogue box, section panel, project panel
│   ├── FieldReport.tsx     # Shown after meeting all four locals
│   ├── SummaryPage.tsx     # One-page version (?view=summary)
│   ├── ProjectCard.tsx
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
| Projects | Points named after a project `id` in `src/content/projects.ts`; stand-here spot for that landmark |
| Secrets | Points named after a secret `id` in `src/content/secrets.ts` (`bottle` also draws the bottle) |
| Trail | Points in walking order; one signpost per entry in `src/content/career.ts` |

Moving a prop does **not** move its collision rectangle. Move both together. Only rectangle colliders are supported.

## 🎨 Customization

- **NPC text, names and sprites**: `src/game/npcs.ts`
- **Section content**: `src/components/profile-modal/*Content.tsx`
- **Projects** (text, tech, links, collaborators, image): `src/content/projects.ts`; images go in `public/assets/projects/`
- **Email and social links**: `src/content/contacts.ts`
- **Career trail**: `src/content/career.ts` (empty = no trail)
- **Secrets**: `src/content/secrets.ts`
- **Add a section**: add an entry to `NPCS` in `npcs.ts`, a content component in `profile-modal/index.ts`, and an `npc` point with that name on the map's `NPCs` layer.

## 🚀 Deployment

The site is a static build (`npm run build` → `dist/`), deployed on Cloudflare Pages.

**Link previews** need absolute URLs. Production builds read `SITE_URL` from `.env.production`
(currently `https://raissabilullah.my.id`); a `SITE_URL` set in the Pages build settings overrides
it. Dev builds fall back to Cloudflare's `CF_PAGES_URL` or relative paths.

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Features

1. **New Game Mechanics**: Extend the `WorldScene` class
2. **UI Components**: Create new React components in `components/`
3. **Profile Content**: Edit `src/content/` and `src/components/profile-modal/`

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
