import type { GlowConfig } from '../types';

export const applyGlowEffect = (
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  config: GlowConfig
) => {
  ctx.save();
  
  // Apply glow effect using shadow
  ctx.shadowColor = config.color;
  ctx.shadowBlur = config.blur;
  ctx.globalAlpha = config.intensity;
  
  // Draw multiple times for stronger glow
  for (let i = 0; i < 3; i++) {
    ctx.drawImage(image, x, y, width, height);
  }
  
  ctx.restore();
  
  // Draw the original sprite on top
  ctx.drawImage(image, x, y, width, height);
};
