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
  onPivotChange: (next: PivotPoint) => void;
}

const lerp = (from: number, to: number, t: number) => from + (to - from) * t;
const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

export const PreviewCanvas = ({
  sprite,
  frames,
  playhead,
  renderSettings,
  pivot,
  displayViewport,
  onPivotChange,
}: PreviewCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const draggingPivotRef = useRef(false);

  const updatePivotFromPointer = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    onPivotChange({
      x: clamp01((clientX - rect.left) / rect.width),
      y: clamp01((clientY - rect.top) / rect.height),
    });
  };

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

  const previousFrame = useMemo(() => {
    if (!renderSettings.onionSkin) return null;
    if (playhead.frameIndex <= 0) return null;
    return frames[playhead.frameIndex - 1] ?? null;
  }, [frames, playhead.frameIndex, renderSettings.onionSkin]);

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
    const blendModeMap = { normal: 'source-over', additive: 'lighter', screen: 'screen', multiply: 'multiply' } as const;

    const drawFrame = (frame: AnimationFrame, alphaMultiplier: number) => {
      const drawW = frame.selection.width * renderSettings.scale * frame.scale;
      const drawH = frame.selection.height * renderSettings.scale * frame.scale;
      const frameOffsetX = frame.offsetX ?? 0;
      const frameOffsetY = frame.offsetY ?? 0;
      const destinationX = -drawW * pivot.x;
      const destinationY = -drawH * pivot.y;

      ctx.save();
      ctx.translate(centerX + frameOffsetX, centerY + frameOffsetY);
      ctx.rotate((frame.rotation * Math.PI) / 180);
      ctx.scale(frame.scale, frame.scale);
      ctx.globalAlpha = Math.max(0, Math.min(1, frame.alpha * renderSettings.opacity * alphaMultiplier));
      ctx.globalCompositeOperation = blendModeMap[renderSettings.blendMode];
      ctx.drawImage(
        sprite.image,
        frame.selection.x + displayViewport.x,
        frame.selection.y + displayViewport.y,
        frame.selection.width,
        frame.selection.height,
        destinationX,
        destinationY,
        drawW,
        drawH,
      );
      ctx.restore();

      return { frameOffsetX, frameOffsetY, destinationX, destinationY, drawW, drawH };
    };

    if (previousFrame) {
      drawFrame(previousFrame, 0.3);
    }

    const currentFrameLayout = drawFrame(composedFrame, 1);

    if (renderSettings.showPivot) {
      const frameOriginX = centerX + currentFrameLayout.frameOffsetX + currentFrameLayout.destinationX;
      const frameOriginY = centerY + currentFrameLayout.frameOffsetY + currentFrameLayout.destinationY;
      const pivotCanvasX = frameOriginX + currentFrameLayout.drawW * pivot.x;
      const pivotCanvasY = frameOriginY + currentFrameLayout.drawH * pivot.y;
      drawPivot(ctx, pivotCanvasX, pivotCanvasY);
    }
  }, [composedFrame, displayViewport, pivot.x, pivot.y, previousFrame, renderSettings, sprite]);

  return (
    <section className="panel">
      <h2>Animation Preview</h2>
      <div className="canvas-wrap">
        <canvas
          ref={canvasRef}
          className="preview-canvas"
          width={360}
          height={360}
          onPointerDown={(event) => {
            if (!renderSettings.showPivot) return;
            draggingPivotRef.current = true;
            event.currentTarget.setPointerCapture(event.pointerId);
            updatePivotFromPointer(event.clientX, event.clientY);
          }}
          onPointerMove={(event) => {
            if (!draggingPivotRef.current) return;
            updatePivotFromPointer(event.clientX, event.clientY);
          }}
          onPointerUp={(event) => {
            draggingPivotRef.current = false;
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              event.currentTarget.releasePointerCapture(event.pointerId);
            }
          }}
          onPointerCancel={(event) => {
            draggingPivotRef.current = false;
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              event.currentTarget.releasePointerCapture(event.pointerId);
            }
          }}
        />
      </div>
    </section>
  );
};
