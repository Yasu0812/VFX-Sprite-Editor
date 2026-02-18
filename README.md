# VFX Sprite Editor

A lightweight, browser-based sprite editor with real-time visual effects (VFX) capabilities. Built with React, TypeScript, and HTML5 Canvas.

## Features

- 🎨 **Particle System**: Create customizable particle effects with control over count, speed, size, color, and lifetime
- ✨ **Glow Effect**: Add glowing effects to sprites with adjustable color, blur, and intensity
- 🌊 **Trail Effect**: Generate motion trails with configurable length and fade speed
- 📁 **Easy Sprite Loading**: Load any image file to use as a sprite
- 🎮 **Interactive Canvas**: Real-time preview with mouse interaction
- 🔧 **Modular Architecture**: Clean, maintainable code structure

## Tech Stack

- **React** (Functional Components & Hooks)
- **TypeScript**
- **HTML5 Canvas** (No heavy external VFX libraries)
- **Vite** (Fast build tool)
- No backend required - runs entirely in the browser

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage

1. **Load a Sprite**: Click the "Load Sprite Image" button and select an image file
2. **Select an Effect**: Choose from Particle, Glow, or Trail effects
3. **Adjust Settings**: Use the sliders to customize the effect parameters
4. **Interact**:
   - **Particle Effect**: Click on the canvas to emit particles, move mouse to change spawn point
   - **Glow Effect**: Automatically applied to your sprite
   - **Trail Effect**: Move your mouse over the canvas to create trails

## Project Structure

```
src/
├── components/           # React components
│   ├── CanvasEditor.tsx # Main canvas component
│   ├── ControlPanel.tsx # Effect controls UI
│   └── SpriteLoader.tsx # Image loading component
├── effects/             # VFX effect implementations
│   ├── ParticleSystem.ts
│   ├── GlowEffect.ts
│   └── TrailEffect.ts
├── types/               # TypeScript type definitions
│   └── index.ts
├── utils/               # Utility functions
│   └── canvas.ts
├── App.tsx             # Main application component
└── main.tsx            # Application entry point
```

## Features in Detail

### Particle System
- Configurable particle count (1-50)
- Adjustable speed (10-200)
- Variable particle size (1-20)
- Custom particle color
- Lifetime control (0.5-5 seconds)

### Glow Effect
- Custom glow color
- Blur intensity (5-50)
- Overall intensity (0.1-1.0)
- Real-time preview

### Trail Effect
- Trail length configuration (5-50 points)
- Fade speed adjustment (0.1-2.0)
- Mouse-based trail generation

## Development

```bash
# Run linter
npm run lint

# Build TypeScript
npm run build
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
