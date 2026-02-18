import { useEffect, useRef } from 'react';
import type { GridSettings, PivotPoint, SpriteAsset } from '../types';

interface GridOverlayProps {
  sprite: SpriteAsset | null;
  grid: GridSettings;
  pivot: PivotPoint;
  onPivotChange: (pivot: PivotPoint) => void;
}

export const GridOverlay = ({ sprite, grid, pivot, onPivotChange }: GridOverlayProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#151821';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!sprite) return;

    canvas.width = sprite.width;
    canvas.height = sprite.height;

    ctx.drawImage(sprite.image, 0, 0);

    ctx.strokeStyle = 'rgba(122, 173, 255, 0.55)';
    ctx.lineWidth = 1;

    for (let x = grid.frameWidth; x < sprite.width; x += grid.frameWidth) {
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, sprite.height);
      ctx.stroke();
    }

    for (let y = grid.frameHeight; y < sprite.height; y += grid.frameHeight) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(sprite.width, y + 0.5);
      ctx.stroke();
    }

    const pivotX = pivot.x * sprite.width;
    const pivotY = pivot.y * sprite.height;

    ctx.strokeStyle = '#ff7e7e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pivotX - 8, pivotY);
    ctx.lineTo(pivotX + 8, pivotY);
    ctx.moveTo(pivotX, pivotY - 8);
    ctx.lineTo(pivotX, pivotY + 8);
    ctx.stroke();
  }, [grid.frameHeight, grid.frameWidth, pivot.x, pivot.y, sprite]);

  return (
    <section className="panel">
      <h2>Sprite Sheet + Grid Overlay</h2>
      <div className="canvas-wrap">
        <canvas
          ref={canvasRef}
          className="editor-canvas"
          width={sprite?.width ?? 512}
          height={sprite?.height ?? 512}
          onClick={(event) => {
            if (!sprite) return;
            const rect = event.currentTarget.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width;
            const y = (event.clientY - rect.top) / rect.height;
            onPivotChange({
              x: Math.max(0, Math.min(1, x)),
              y: Math.max(0, Math.min(1, y)),
            });
          }}
        />
      </div>
    </section>
  );
};
