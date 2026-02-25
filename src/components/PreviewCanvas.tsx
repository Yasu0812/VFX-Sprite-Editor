import { useCallback, useEffect, useMemo, useRef } from 'react';
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
  onFrameOffsetChange: (frameIndex: number, offsetX: number, offsetY: number) => void;
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
  onFrameOffsetChange,
}: PreviewCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dragStateRef = useRef<
    | {
      mode: 'pivot';
    }
    | {
      mode: 'offset';
      frameIndex: number;
      startOffsetX: number;
      startOffsetY: number;
      startCanvasX: number;
      startCanvasY: number;
    }
    | null
  >(null);

  const getCanvasPointer = (event: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
      rect,
    };
  };

  const isInputFocused = () => {
    const activeElement = document.activeElement;
    return (
      activeElement instanceof HTMLInputElement
      || activeElement instanceof HTMLTextAreaElement
      || activeElement instanceof HTMLSelectElement
      || (activeElement instanceof HTMLElement && activeElement.isContentEditable)
    );
  };

  const updatePivotFromPointer = useCallback((clientX: number, clientY: number, rect?: DOMRect) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const sourceRect = rect ?? canvas.getBoundingClientRect();
    onPivotChange({
      x: clamp01((clientX - sourceRect.left) / sourceRect.width),
      y: clamp01((clientY - sourceRect.top) / sourceRect.height),
    });
  }, [onPivotChange]);

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

    const onMouseDown = (event: MouseEvent) => {
      if (!sprite || !displayViewport || !composedFrame || isInputFocused()) return;

      const pointer = getCanvasPointer(event);
      if (!pointer) return;

      const currentFrameLayout = {
        centerX: canvas.width / 2,
        centerY: canvas.height / 2,
        drawW: composedFrame.selection.width * renderSettings.scale * composedFrame.scale,
        drawH: composedFrame.selection.height * renderSettings.scale * composedFrame.scale,
        frameOffsetX: composedFrame.offsetX ?? 0,
        frameOffsetY: composedFrame.offsetY ?? 0,
        rotationRad: (composedFrame.rotation * Math.PI) / 180,
        scale: composedFrame.scale,
      };
      const destinationX = -currentFrameLayout.drawW * pivot.x;
      const destinationY = -currentFrameLayout.drawH * pivot.y;

      if (event.shiftKey && renderSettings.showPivot) {
        dragStateRef.current = { mode: 'pivot' };
        updatePivotFromPointer(event.clientX, event.clientY, pointer.rect);
        return;
      }

      const frameCenterX = currentFrameLayout.centerX + currentFrameLayout.frameOffsetX;
      const frameCenterY = currentFrameLayout.centerY + currentFrameLayout.frameOffsetY;
      const localX = pointer.x - frameCenterX;
      const localY = pointer.y - frameCenterY;
      const cos = Math.cos(-currentFrameLayout.rotationRad);
      const sin = Math.sin(-currentFrameLayout.rotationRad);
      const rotatedX = localX * cos - localY * sin;
      const rotatedY = localX * sin + localY * cos;
      const scaledX = rotatedX / Math.max(0.0001, currentFrameLayout.scale);
      const scaledY = rotatedY / Math.max(0.0001, currentFrameLayout.scale);
      const frameLocalX = scaledX - destinationX;
      const frameLocalY = scaledY - destinationY;
      const isInsideFrame = frameLocalX >= 0 && frameLocalX <= currentFrameLayout.drawW && frameLocalY >= 0 && frameLocalY <= currentFrameLayout.drawH;

      if (!isInsideFrame) return;

      dragStateRef.current = {
        mode: 'offset',
        frameIndex: playhead.frameIndex,
        startOffsetX: composedFrame.offsetX ?? 0,
        startOffsetY: composedFrame.offsetY ?? 0,
        startCanvasX: pointer.x,
        startCanvasY: pointer.y,
      };
    };

    const onMouseMove = (event: MouseEvent) => {
      const dragState = dragStateRef.current;
      if (!dragState) return;

      if (dragState.mode === 'pivot') {
        updatePivotFromPointer(event.clientX, event.clientY);
        return;
      }

      const pointer = getCanvasPointer(event);
      if (!pointer) return;

      const deltaX = pointer.x - dragState.startCanvasX;
      const deltaY = pointer.y - dragState.startCanvasY;
      onFrameOffsetChange(dragState.frameIndex, Math.round(dragState.startOffsetX + deltaX), Math.round(dragState.startOffsetY + deltaY));
    };

    const onMouseUp = () => {
      dragStateRef.current = null;
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [composedFrame, displayViewport, onFrameOffsetChange, pivot.x, pivot.y, playhead.frameIndex, renderSettings.scale, renderSettings.showPivot, sprite, updatePivotFromPointer]);

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

    const frameLayout = drawFrame(composedFrame, 1);

    if (renderSettings.showPivot) {
      const frameOriginX = centerX + frameLayout.frameOffsetX + frameLayout.destinationX;
      const frameOriginY = centerY + frameLayout.frameOffsetY + frameLayout.destinationY;
      const pivotCanvasX = frameOriginX + frameLayout.drawW * pivot.x;
      const pivotCanvasY = frameOriginY + frameLayout.drawH * pivot.y;
      drawPivot(ctx, pivotCanvasX, pivotCanvasY);
    }
  }, [composedFrame, displayViewport, pivot.x, pivot.y, previousFrame, renderSettings, sprite]);

  return (
    <section className="panel">
      <h2>Animation Preview</h2>
      <div className="canvas-wrap">
        <canvas
          ref={canvasRef}
          className="preview-canvas preview-canvas-draggable"
          width={360}
          height={360}
        />
      </div>
    </section>
  );
};
