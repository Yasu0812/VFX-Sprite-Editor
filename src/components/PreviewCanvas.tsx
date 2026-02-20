import { useEffect, useMemo, useRef } from 'react';
import type { AnimationFrame, DisplayViewport, PivotPoint, RenderSettings, SpriteAsset } from '../types';
import { drawCheckerBackground, drawPivot } from '../utils/canvasRender';

interface PreviewCanvasProps {
  sprite: SpriteAsset | null;
  frames: AnimationFrame[];
  playhead: {
    frameIndex: number;
    tweenStep: number;
    tweenProgress: number;
  };
  renderSettings: RenderSettings;
  pivot: PivotPoint;
  displayViewport: DisplayViewport | null;
}

const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

export const PreviewCanvas = ({
  sprite,
  frames,
  playhead,
  renderSettings,
  pivot,
  displayViewport,
}: PreviewCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const composedFrame = useMemo(() => {
    const base = frames[playhead.frameIndex];
    if (!base) return null;

    const tweenFrames = Math.max(0, base.tween?.tweenFrames ?? 0);
    if (tweenFrames === 0 || playhead.tweenStep === 0) {
      return {
        ...base,
        scale: base.scale,
        rotation: base.rotation,
        alpha: base.alpha,
      };
    }

    const next = frames[(playhead.frameIndex + 1) % frames.length] ?? base;
    const t = Math.min(1, (playhead.tweenStep + playhead.tweenProgress) / (tweenFrames + 1));

    return {
      ...base,
      scale: lerp(base.scale, base.tween?.scaleTo ?? next.scale, t),
      rotation: lerp(base.rotation, base.tween?.rotationTo ?? next.rotation, t),
      alpha: lerp(base.alpha, base.tween?.alphaTo ?? next.alpha, t),
    };
  }, [frames, playhead.frameIndex, playhead.tweenProgress, playhead.tweenStep]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    drawCheckerBackground(ctx, width, height);

    if (!sprite || !composedFrame || !displayViewport) return;

    const centerX = width / 2;
    const centerY = height / 2;
    const drawW = composedFrame.selection.width * renderSettings.scale * composedFrame.scale;
    const drawH = composedFrame.selection.height * renderSettings.scale * composedFrame.scale;

    const frameOffsetX = composedFrame.offsetX ?? 0;
    const frameOffsetY = composedFrame.offsetY ?? 0;

    const source = composedFrame.selection;
    const destinationX = -drawW * pivot.x;
    const destinationY = -drawH * pivot.y;

    ctx.save();
    ctx.translate(centerX + frameOffsetX, centerY + frameOffsetY);
    ctx.rotate((composedFrame.rotation * Math.PI) / 180);
    ctx.scale(composedFrame.scale, composedFrame.scale);
    ctx.globalAlpha = Math.max(0, Math.min(1, composedFrame.alpha * renderSettings.opacity));
    const blendModeMap = { normal: 'source-over', additive: 'lighter', screen: 'screen', multiply: 'multiply' } as const;
    ctx.globalCompositeOperation = blendModeMap[renderSettings.blendMode];
    ctx.drawImage(
      sprite.image,
      source.x + displayViewport.x,
      source.y + displayViewport.y,
      source.width,
      source.height,
      destinationX,
      destinationY,
      drawW,
      drawH,
    );
    ctx.restore();

    if (renderSettings.showPivot) {
      const frameOriginX = centerX + frameOffsetX + destinationX;
      const frameOriginY = centerY + frameOffsetY + destinationY;
      const pivotCanvasX = frameOriginX + drawW * pivot.x;
      const pivotCanvasY = frameOriginY + drawH * pivot.y;
      drawPivot(ctx, pivotCanvasX, pivotCanvasY);
    }
  }, [composedFrame, displayViewport, pivot.x, pivot.y, renderSettings, sprite]);

  return (
    <section className="panel">
      <h2>Animation Preview</h2>
      <div className="canvas-wrap">
        <canvas ref={canvasRef} className="preview-canvas" width={360} height={360} />
      </div>
    </section>
  );
};
