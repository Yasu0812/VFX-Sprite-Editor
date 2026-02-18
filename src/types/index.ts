export type BlendMode = 'normal' | 'screen' | 'additive' | 'multiply';

export interface SpriteAsset {
  image: HTMLImageElement;
  name: string;
  width: number;
  height: number;
}

export interface GridSettings {
  frameWidth: number;
  frameHeight: number;
  columns: number;
  rows: number;
}

export interface PlaybackSettings {
  fps: number;
  loop: boolean;
  isPlaying: boolean;
  currentFrame: number;
}

export interface RenderSettings {
  blendMode: BlendMode;
  opacity: number;
  scale: number;
  onionSkin: boolean;
}

export interface PivotPoint {
  x: number;
  y: number;
}

export interface ExportConfig {
  frameWidth: number;
  frameHeight: number;
  cols: number;
  rows: number;
  fps: number;
  loop: boolean;
  pivotX: number;
  pivotY: number;
  blendMode: BlendMode;
  opacity: number;
  scale: number;
}
