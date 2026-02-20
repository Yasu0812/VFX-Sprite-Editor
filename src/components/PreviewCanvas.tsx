import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
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
  onPivotChange: (pivot: PivotPoint) => void;
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
  const [isDraggingPivot, setIsDraggingPivot] = useState(false);

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

  const updatePivotFromPointer = (event: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !composedFrame || !sprite || !displayViewport) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const frameOffsetX = composedFrame.offsetX ?? 0;
    const frameOffsetY = composedFrame.offsetY ?? 0;

    const baseDrawW = composedFrame.selection.width * renderSettings.scale;
    const baseDrawH = composedFrame.selection.height * renderSettings.scale;
    const finalDrawW = baseDrawW * composedFrame.scale;
    const finalDrawH = baseDrawH * composedFrame.scale;

    if (finalDrawW <= 0 || finalDrawH <= 0) return;

    const frameTopLeftX = canvas.width / 2 + frameOffsetX - finalDrawW / 2;
    const frameTopLeftY = canvas.height / 2 + frameOffsetY - finalDrawH / 2;

    onPivotChange({
      x: clamp01((mouseX - frameTopLeftX) / finalDrawW),
      y: clamp01((mouseY - frameTopLeftY) / finalDrawH),
    });
  };

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
    const frameOffsetX = composedFrame.offsetX ?? 0;
    const frameOffsetY = composedFrame.offsetY ?? 0;

    const baseDrawW = composedFrame.selection.width * renderSettings.scale;
    const baseDrawH = composedFrame.selection.height * renderSettings.scale;
    const finalDrawW = baseDrawW * composedFrame.scale;
    const finalDrawH = baseDrawH * composedFrame.scale;

    const frameTopLeftX = centerX + frameOffsetX - finalDrawW / 2;
    const frameTopLeftY = centerY + frameOffsetY - finalDrawH / 2;
    const pivotCanvasX = frameTopLeftX + finalDrawW * pivot.x;
    const pivotCanvasY = frameTopLeftY + finalDrawH * pivot.y;

    const source = composedFrame.selection;

    ctx.save();
    ctx.translate(pivotCanvasX, pivotCanvasY);
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
      -baseDrawW * pivot.x,
      -baseDrawH * pivot.y,
      baseDrawW,
      baseDrawH,
    );
    ctx.restore();

    if (renderSettings.showPivot) {
      drawPivot(ctx, pivotCanvasX, pivotCanvasY);
    }
  }, [composedFrame, displayViewport, pivot.x, pivot.y, renderSettings, sprite]);

  return (
    <section className="panel">
      <h2>Animation Preview</h2>
      <div className="canvas-wrap">
        <canvas
          ref={canvasRef}
          className="preview-canvas"
          width={360}
          height={360}
          onMouseDown={(event) => {
            setIsDraggingPivot(true);
            updatePivotFromPointer(event);
          }}
          onMouseMove={(event) => {
            if (!isDraggingPivot) return;
            updatePivotFromPointer(event);
          }}
          onMouseUp={() => setIsDraggingPivot(false)}
          onMouseLeave={() => setIsDraggingPivot(false)}
        />
      </div>
    </section>
  );
};
