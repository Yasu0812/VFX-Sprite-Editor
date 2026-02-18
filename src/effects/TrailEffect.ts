import type { TrailConfig } from '../types';

interface TrailPoint {
  x: number;
  y: number;
  alpha: number;
}

export class TrailEffect {
  private points: TrailPoint[] = [];
  private config: TrailConfig;

  constructor(config: TrailConfig) {
    this.config = config;
  }

  updateConfig(config: TrailConfig) {
    this.config = config;
  }

  addPoint(x: number, y: number) {
    this.points.push({ x, y, alpha: 1 });
    
    // Keep only the specified length
    if (this.points.length > this.config.length) {
      this.points.shift();
    }
  }

  update(deltaTime: number) {
    // Fade out trail points
    this.points = this.points
      .map(p => ({
        ...p,
        alpha: p.alpha - this.config.fadeSpeed * deltaTime
      }))
      .filter(p => p.alpha > 0);
  }

  draw(
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement,
    width: number,
    height: number
  ) {
    this.points.forEach(point => {
      ctx.save();
      ctx.globalAlpha = point.alpha * 0.5;
      ctx.drawImage(
        image,
        point.x - width / 2,
        point.y - height / 2,
        width,
        height
      );
      ctx.restore();
    });
  }

  clear() {
    this.points = [];
  }
}
