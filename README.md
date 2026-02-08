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
git clone <your-repo-url>
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
- **Movement**: Use arrow keys or WASD to move your character
- **Interact**: Press Space or Enter when near an NPC to open their profile section

### Game Elements
- **Blue Character**: Your player character
- **Red NPC**: About Me section
- **Yellow NPC**: Skills & Technologies
- **Purple NPC**: Projects showcase
- **Teal NPC**: Contact information

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Game Engine**: Phaser 3
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Package Manager**: npm

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── GameCanvas.tsx   # Phaser game integration
│   ├── GameUI.tsx       # Game instructions overlay
│   └── ProfileModal.tsx # Profile content modal
├── game/
│   └── scenes/
│       └── GameScene.tsx # Main game scene
├── assets/              # Game assets (sprites, sounds)
└── App.tsx              # Main application component
```

## 🎨 Customization

### Adding New Profile Sections

1. Update the `createNPCs()` method in `GameScene.tsx`
2. Add new content in the `getContent()` method in `ProfileModal.tsx`
3. Update the NPC data array in `createInteractionZones()`

### Styling

The project uses Tailwind CSS with custom game-themed colors:
- `game-bg`: Background color
- `game-ui`: UI elements
- `game-accent`: Accent color for highlights

### Assets

Replace placeholder sprites in the `assets/` directory:
- `sprites/`: Character and NPC sprites
- `tilesets/`: World tiles and decorations
- `sounds/`: Background music and sound effects

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
