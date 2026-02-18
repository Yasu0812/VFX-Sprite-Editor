import type { ParticleConfig, GlowConfig, TrailConfig } from '../types';

interface ControlPanelProps {
  particleConfig: ParticleConfig;
  glowConfig: GlowConfig;
  trailConfig: TrailConfig;
  activeEffect: 'particle' | 'glow' | 'trail' | 'none';
  onParticleConfigChange: (config: ParticleConfig) => void;
  onGlowConfigChange: (config: GlowConfig) => void;
  onTrailConfigChange: (config: TrailConfig) => void;
  onEffectChange: (effect: 'particle' | 'glow' | 'trail' | 'none') => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  particleConfig,
  glowConfig,
  trailConfig,
  activeEffect,
  onParticleConfigChange,
  onGlowConfigChange,
  onTrailConfigChange,
  onEffectChange
}) => {
  return (
    <div style={{ padding: '20px', backgroundColor: '#2a2a2a', borderRadius: '8px' }}>
      <h3 style={{ marginTop: 0, color: '#fff' }}>VFX Controls</h3>
      
      {/* Effect Selection */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#fff', fontWeight: 'bold' }}>
          Active Effect:
        </label>
        <select
          value={activeEffect}
          onChange={(e) => onEffectChange(e.target.value as 'particle' | 'glow' | 'trail' | 'none')}
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #444',
            backgroundColor: '#333',
            color: '#fff'
          }}
        >
          <option value="none">None</option>
          <option value="particle">Particle System</option>
          <option value="glow">Glow Effect</option>
          <option value="trail">Trail Effect</option>
        </select>
      </div>

      {/* Particle Controls */}
      {activeEffect === 'particle' && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#333', borderRadius: '4px' }}>
          <h4 style={{ marginTop: 0, color: '#fff' }}>Particle Settings</h4>
          
          <label style={{ display: 'block', marginBottom: '4px', color: '#ccc' }}>
            Count: {particleConfig.count}
          </label>
          <input
            type="range"
            min="1"
            max="50"
            value={particleConfig.count}
            onChange={(e) => onParticleConfigChange({ ...particleConfig, count: Number(e.target.value) })}
            style={{ width: '100%', marginBottom: '12px' }}
          />

          <label style={{ display: 'block', marginBottom: '4px', color: '#ccc' }}>
            Speed: {particleConfig.speed.toFixed(1)}
          </label>
          <input
            type="range"
            min="10"
            max="200"
            value={particleConfig.speed}
            onChange={(e) => onParticleConfigChange({ ...particleConfig, speed: Number(e.target.value) })}
            style={{ width: '100%', marginBottom: '12px' }}
          />

          <label style={{ display: 'block', marginBottom: '4px', color: '#ccc' }}>
            Size: {particleConfig.size}
          </label>
          <input
            type="range"
            min="1"
            max="20"
            value={particleConfig.size}
            onChange={(e) => onParticleConfigChange({ ...particleConfig, size: Number(e.target.value) })}
            style={{ width: '100%', marginBottom: '12px' }}
          />

          <label style={{ display: 'block', marginBottom: '4px', color: '#ccc' }}>
            Lifetime: {particleConfig.lifetime.toFixed(1)}s
          </label>
          <input
            type="range"
            min="0.5"
            max="5"
            step="0.1"
            value={particleConfig.lifetime}
            onChange={(e) => onParticleConfigChange({ ...particleConfig, lifetime: Number(e.target.value) })}
            style={{ width: '100%', marginBottom: '12px' }}
          />

          <label style={{ display: 'block', marginBottom: '4px', color: '#ccc' }}>
            Color:
          </label>
          <input
            type="color"
            value={particleConfig.color}
            onChange={(e) => onParticleConfigChange({ ...particleConfig, color: e.target.value })}
            style={{ width: '100%', height: '40px', marginBottom: '12px', cursor: 'pointer' }}
          />
        </div>
      )}

      {/* Glow Controls */}
      {activeEffect === 'glow' && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#333', borderRadius: '4px' }}>
          <h4 style={{ marginTop: 0, color: '#fff' }}>Glow Settings</h4>
          
          <label style={{ display: 'block', marginBottom: '4px', color: '#ccc' }}>
            Blur: {glowConfig.blur}
          </label>
          <input
            type="range"
            min="5"
            max="50"
            value={glowConfig.blur}
            onChange={(e) => onGlowConfigChange({ ...glowConfig, blur: Number(e.target.value) })}
            style={{ width: '100%', marginBottom: '12px' }}
          />

          <label style={{ display: 'block', marginBottom: '4px', color: '#ccc' }}>
            Intensity: {glowConfig.intensity.toFixed(2)}
          </label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={glowConfig.intensity}
            onChange={(e) => onGlowConfigChange({ ...glowConfig, intensity: Number(e.target.value) })}
            style={{ width: '100%', marginBottom: '12px' }}
          />

          <label style={{ display: 'block', marginBottom: '4px', color: '#ccc' }}>
            Color:
          </label>
          <input
            type="color"
            value={glowConfig.color}
            onChange={(e) => onGlowConfigChange({ ...glowConfig, color: e.target.value })}
            style={{ width: '100%', height: '40px', marginBottom: '12px', cursor: 'pointer' }}
          />
        </div>
      )}

      {/* Trail Controls */}
      {activeEffect === 'trail' && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#333', borderRadius: '4px' }}>
          <h4 style={{ marginTop: 0, color: '#fff' }}>Trail Settings</h4>
          
          <label style={{ display: 'block', marginBottom: '4px', color: '#ccc' }}>
            Length: {trailConfig.length}
          </label>
          <input
            type="range"
            min="5"
            max="50"
            value={trailConfig.length}
            onChange={(e) => onTrailConfigChange({ ...trailConfig, length: Number(e.target.value) })}
            style={{ width: '100%', marginBottom: '12px' }}
          />

          <label style={{ display: 'block', marginBottom: '4px', color: '#ccc' }}>
            Fade Speed: {trailConfig.fadeSpeed.toFixed(2)}
          </label>
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.1"
            value={trailConfig.fadeSpeed}
            onChange={(e) => onTrailConfigChange({ ...trailConfig, fadeSpeed: Number(e.target.value) })}
            style={{ width: '100%', marginBottom: '12px' }}
          />
        </div>
      )}

      {/* Instructions */}
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#333', borderRadius: '4px' }}>
        <p style={{ margin: 0, color: '#aaa', fontSize: '12px' }}>
          {activeEffect === 'particle' && '💡 Click on canvas to emit particles. Move mouse to change spawn point.'}
          {activeEffect === 'glow' && '💡 The glow effect is applied to your sprite automatically.'}
          {activeEffect === 'trail' && '💡 Move your mouse over the canvas to create a trail.'}
          {activeEffect === 'none' && '💡 Select an effect to start editing.'}
        </p>
      </div>
    </div>
  );
};
