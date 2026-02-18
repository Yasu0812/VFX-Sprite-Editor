import type { BlendMode, GridSettings } from '../types';

const blendModeMap: Record<BlendMode, GlobalCompositeOperation> = {
  normal: 'source-over',
  screen: 'screen',
  additive: 'lighter',
  multiply: 'multiply',
};

export const getFrameRect = (frameIndex: number, grid: GridSettings) => {
  const col = frameIndex % grid.columns;
  const row = Math.floor(frameIndex / grid.columns);
  return {
    sx: col * grid.frameWidth,
    sy: row * grid.frameHeight,
    sw: grid.frameWidth,
    sh: grid.frameHeight,
  };
};

export const drawCheckerBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  const tile = 16;
  ctx.fillStyle = '#23262f';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#1a1c22';

  for (let y = 0; y < height; y += tile) {
    for (let x = (y / tile) % 2 === 0 ? tile : 0; x < width; x += tile * 2) {
      ctx.fillRect(x, y, tile, tile);
    }
  }
};

export const drawFrame = (
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  frameIndex: number,
  grid: GridSettings,
  target: { x: number; y: number; width: number; height: number },
  options: { opacity: number; blendMode: BlendMode },
) => {
  const { sx, sy, sw, sh } = getFrameRect(frameIndex, grid);
  ctx.save();
  ctx.globalAlpha = options.opacity;
  ctx.globalCompositeOperation = blendModeMap[options.blendMode];
  ctx.drawImage(image, sx, sy, sw, sh, target.x, target.y, target.width, target.height);
  ctx.restore();
};

export const clampFrame = (frame: number, totalFrames: number) => {
  if (totalFrames <= 0) return 0;
  return Math.max(0, Math.min(frame, totalFrames - 1));
};
