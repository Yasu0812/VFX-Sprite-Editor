import { useState } from 'react'
import './App.css'
import { CanvasEditor } from './components/CanvasEditor'
import { ControlPanel } from './components/ControlPanel'
import { SpriteLoader } from './components/SpriteLoader'
import type { Sprite, ParticleConfig, GlowConfig, TrailConfig } from './types'

function App() {
  const [sprite, setSprite] = useState<Sprite | null>(null);
  const [activeEffect, setActiveEffect] = useState<'particle' | 'glow' | 'trail' | 'none'>('none');
  
  const [particleConfig, setParticleConfig] = useState<ParticleConfig>({
    count: 10,
    speed: 100,
    size: 5,
    color: '#ff6b6b',
    lifetime: 2
  });
  
  const [glowConfig, setGlowConfig] = useState<GlowConfig>({
    color: '#00ffff',
    blur: 20,
    intensity: 0.5
  });
  
  const [trailConfig, setTrailConfig] = useState<TrailConfig>({
    length: 20,
    fadeSpeed: 0.5,
    width: 2
  });

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#1a1a1a', 
      padding: '20px',
      color: '#fff'
    }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ margin: 0, fontSize: '2.5em', color: '#fff' }}>
          ✨ VFX Sprite Editor
        </h1>
        <p style={{ color: '#aaa', marginTop: '10px' }}>
          Load a sprite and apply particle, glow, or trail effects
        </p>
      </header>

      <div style={{ 
        display: 'flex', 
        gap: '20px', 
        maxWidth: '1200px', 
        margin: '0 auto',
        flexWrap: 'wrap'
      }}>
        {/* Left Panel - Controls */}
        <div style={{ flex: '0 0 300px' }}>
          <SpriteLoader onSpriteLoad={setSprite} />
          <ControlPanel
            particleConfig={particleConfig}
            glowConfig={glowConfig}
            trailConfig={trailConfig}
            activeEffect={activeEffect}
            onParticleConfigChange={setParticleConfig}
            onGlowConfigChange={setGlowConfig}
            onTrailConfigChange={setTrailConfig}
            onEffectChange={setActiveEffect}
          />
        </div>

        {/* Right Panel - Canvas */}
        <div style={{ flex: '1', minWidth: '800px' }}>
          <CanvasEditor
            sprite={sprite}
            particleConfig={particleConfig}
            glowConfig={glowConfig}
            trailConfig={trailConfig}
            activeEffect={activeEffect}
          />
          {!sprite && (
            <div style={{
              marginTop: '20px',
              padding: '20px',
              backgroundColor: '#2a2a2a',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <p style={{ color: '#aaa', margin: 0 }}>
                👆 Load a sprite image to get started
              </p>
            </div>
          )}
        </div>
      </div>

      <footer style={{ 
        textAlign: 'center', 
        marginTop: '40px', 
        color: '#666',
        fontSize: '14px'
      }}>
        <p>Built with React, TypeScript, and HTML5 Canvas</p>
      </footer>
    </div>
  )
}

export default App
