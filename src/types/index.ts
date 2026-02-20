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

export interface FrameSelection {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TweenSettings {
  tweenFrames: number;
  scaleTo?: number;
  rotationTo?: number;
  alphaTo?: number;
}

export interface AnimationFrame {
  id: string;
  selection: FrameSelection;
  durationMs: number;
  scale: number;
  rotation: number;
  alpha: number;
  offsetX?: number;
  offsetY?: number;
  tween?: TweenSettings;
}

export interface PlaybackSettings {
  fps: number;
  loop: boolean;
  isPlaying: boolean;
  currentFrame: number;
}

export interface PlaybackState {
  frameIndex: number;
  tweenStep: number;
  tweenProgress: number;
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

export interface TrimData {
  trimOffsetX: number;
  trimOffsetY: number;
  trimWidth: number;
  trimHeight: number;
  margin: number;
  alphaThreshold: number;
}

export interface DisplayViewport {
  x: number;
  y: number;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
}
