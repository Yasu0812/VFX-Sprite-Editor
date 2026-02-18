import { useEffect, useRef } from 'react';
import type { GridSettings, PivotPoint, RenderSettings, SpriteAsset } from '../types';
import { drawCheckerBackground, drawFrame } from '../utils/canvasRender';

interface PreviewCanvasProps {
  sprite: SpriteAsset | null;
  grid: GridSettings;
  currentFrame: number;
  totalFrames: number;
  renderSettings: RenderSettings;
  pivot: PivotPoint;
}

export const PreviewCanvas = ({
  sprite,
  grid,
  currentFrame,
  totalFrames,
  renderSettings,
  pivot,
}: PreviewCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    drawCheckerBackground(ctx, width, height);

    if (!sprite || totalFrames <= 0) return;

    const drawW = grid.frameWidth * renderSettings.scale;
    const drawH = grid.frameHeight * renderSettings.scale;
    const centerX = width / 2;
    const centerY = height / 2;
    const x = centerX - drawW * pivot.x;
    const y = centerY - drawH * pivot.y;

    if (renderSettings.onionSkin && currentFrame === totalFrames - 1) {
      drawFrame(ctx, sprite.image, 0, grid, { x, y, width: drawW, height: drawH }, {
        opacity: 0.2,
        blendMode: 'normal',
      });
    }

    drawFrame(
      ctx,
      sprite.image,
      currentFrame,
      grid,
      { x, y, width: drawW, height: drawH },
      { opacity: renderSettings.opacity, blendMode: renderSettings.blendMode },
    );

    ctx.strokeStyle = '#ff7e7e';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX - 10, centerY);
    ctx.lineTo(centerX + 10, centerY);
    ctx.moveTo(centerX, centerY - 10);
    ctx.lineTo(centerX, centerY + 10);
    ctx.stroke();
  }, [currentFrame, grid, pivot, renderSettings, sprite, totalFrames]);

  return (
    <section className="panel">
      <h2>Animation Preview</h2>
      <div className="canvas-wrap">
        <canvas ref={canvasRef} className="preview-canvas" width={360} height={360} />
      </div>
    </section>
  );
};
