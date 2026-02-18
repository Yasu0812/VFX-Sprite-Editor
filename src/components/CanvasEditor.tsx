import { useEffect, useRef } from 'react';
import type { Sprite, ParticleConfig, GlowConfig, TrailConfig } from '../types';
import { clearCanvas, drawSprite } from '../utils/canvas';
import { ParticleSystem } from '../effects/ParticleSystem';
import { applyGlowEffect } from '../effects/GlowEffect';
import { TrailEffect } from '../effects/TrailEffect';

interface CanvasEditorProps {
  sprite: Sprite | null;
  particleConfig: ParticleConfig;
  glowConfig: GlowConfig;
  trailConfig: TrailConfig;
  activeEffect: 'particle' | 'glow' | 'trail' | 'none';
}

export const CanvasEditor: React.FC<CanvasEditorProps> = ({
  sprite,
  particleConfig,
  glowConfig,
  trailConfig,
  activeEffect
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleSystemRef = useRef<ParticleSystem | null>(null);
  const trailEffectRef = useRef<TrailEffect | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize effects
    if (!particleSystemRef.current) {
      particleSystemRef.current = new ParticleSystem(
        particleConfig,
        canvas.width / 2,
        canvas.height / 2
      );
    }

    if (!trailEffectRef.current) {
      trailEffectRef.current = new TrailEffect(trailConfig);
    }

    // Animation loop
    const animate = () => {
      const now = Date.now();
      
      // Initialize lastTimeRef if not set
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = now;
      }
      
      const deltaTime = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      clearCanvas(ctx, canvas.width, canvas.height);

      // Draw trail effect (behind sprite)
      if (activeEffect === 'trail' && sprite && trailEffectRef.current) {
        trailEffectRef.current.update(deltaTime);
        trailEffectRef.current.draw(ctx, sprite.image, sprite.width, sprite.height);
      }

      // Draw sprite with effects
      if (sprite) {
        if (activeEffect === 'glow') {
          applyGlowEffect(
            ctx,
            sprite.image,
            sprite.x,
            sprite.y,
            sprite.width,
            sprite.height,
            glowConfig
          );
        } else {
          drawSprite(ctx, sprite.image, sprite.x, sprite.y, sprite.width, sprite.height);
        }
      }

      // Draw particle effect
      if (activeEffect === 'particle' && particleSystemRef.current) {
        particleSystemRef.current.update(deltaTime);
        particleSystemRef.current.draw(ctx);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [sprite, activeEffect, particleConfig, glowConfig, trailConfig]);

  // Update particle system config
  useEffect(() => {
    if (particleSystemRef.current) {
      particleSystemRef.current.updateConfig(particleConfig);
    }
  }, [particleConfig]);

  // Update trail effect config
  useEffect(() => {
    if (trailEffectRef.current) {
      trailEffectRef.current.updateConfig(trailConfig);
    }
  }, [trailConfig]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Update particle source
    if (activeEffect === 'particle' && particleSystemRef.current) {
      particleSystemRef.current.updateSource(x, y);
    }

    // Add trail point
    if (activeEffect === 'trail' && trailEffectRef.current && sprite) {
      trailEffectRef.current.addPoint(x, y);
    }
  };

  const handleClick = () => {
    if (activeEffect === 'particle' && particleSystemRef.current) {
      particleSystemRef.current.emit();
    }
  };

  return (
    <div style={{ border: '2px solid #333', display: 'inline-block' }}>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        style={{
          backgroundColor: '#1a1a1a',
          cursor: activeEffect === 'particle' ? 'crosshair' : 'default'
        }}
      />
    </div>
  );
};
