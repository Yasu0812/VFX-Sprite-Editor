import type { Particle, ParticleConfig } from '../types';

export class ParticleSystem {
  private particles: Particle[] = [];
  private config: ParticleConfig;
  private sourceX: number;
  private sourceY: number;

  constructor(config: ParticleConfig, x: number, y: number) {
    this.config = config;
    this.sourceX = x;
    this.sourceY = y;
  }

  updateSource(x: number, y: number) {
    this.sourceX = x;
    this.sourceY = y;
  }

  updateConfig(config: ParticleConfig) {
    this.config = config;
  }

  emit() {
    for (let i = 0; i < this.config.count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = this.config.speed * (0.5 + Math.random() * 0.5);
      
      this.particles.push({
        x: this.sourceX,
        y: this.sourceY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: this.config.lifetime,
        maxLife: this.config.lifetime,
        size: this.config.size * (0.5 + Math.random() * 0.5),
        color: this.config.color,
        alpha: 1
      });
    }
  }

  update(deltaTime: number) {
    this.particles = this.particles.filter(p => {
      p.x += p.vx * deltaTime;
      p.y += p.vy * deltaTime;
      p.life -= deltaTime;
      p.alpha = p.life / p.maxLife;
      return p.life > 0;
    });
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  clear() {
    this.particles = [];
  }
}
