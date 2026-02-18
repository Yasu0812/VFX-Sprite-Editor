export interface Sprite {
  image: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
}

export interface VFXEffect {
  type: 'particle' | 'glow' | 'trail';
  enabled: boolean;
  intensity: number;
}

export interface ParticleConfig {
  count: number;
  speed: number;
  size: number;
  color: string;
  lifetime: number;
}

export interface GlowConfig {
  color: string;
  blur: number;
  intensity: number;
}

export interface TrailConfig {
  length: number;
  fadeSpeed: number;
  width: number;
}

export interface EditorState {
  sprite: Sprite | null;
  effects: {
    particle: ParticleConfig;
    glow: GlowConfig;
    trail: TrailConfig;
  };
  activeEffect: 'particle' | 'glow' | 'trail' | 'none';
}
