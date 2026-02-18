import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import type { AnimationFrame, FrameSelection, GridSettings, PivotPoint, SpriteAsset } from '../types';

interface GridOverlayProps {
  sprite: SpriteAsset | null;
  grid: GridSettings;
  pivot: PivotPoint;
  frames: AnimationFrame[];
  activeFrameIndex: number;
  editingFrameIndex?: number | null;
  onPivotChange: (pivot: PivotPoint) => void;
  onAddFrame: (selection: FrameSelection) => void;
  onEditFrameSelection?: (frameIndex: number, selection: FrameSelection) => void;
  onSelectionApplied?: () => void;
}

interface DragState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

const normalizeSelection = (drag: DragState, sprite: SpriteAsset): FrameSelection => {
  const x = Math.max(0, Math.min(drag.startX, drag.currentX));
  const y = Math.max(0, Math.min(drag.startY, drag.currentY));
  const right = Math.min(sprite.width, Math.max(drag.startX, drag.currentX));
  const bottom = Math.min(sprite.height, Math.max(drag.startY, drag.currentY));

  return {
    x: Math.floor(x),
    y: Math.floor(y),
    width: Math.max(1, Math.floor(right - x)),
    height: Math.max(1, Math.floor(bottom - y)),
  };
};

export const GridOverlay = ({
  sprite,
  grid,
  pivot,
  frames,
  activeFrameIndex,
  editingFrameIndex = null,
  onPivotChange,
  onAddFrame,
  onEditFrameSelection,
  onSelectionApplied,
}: GridOverlayProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [selection, setSelection] = useState<FrameSelection | null>(null);

  const activeFrameSelection = useMemo(() => {
    if (!frames.length) return null;
    const frame = frames[Math.max(0, Math.min(activeFrameIndex, frames.length - 1))];
    return frame?.selection ?? null;
  }, [activeFrameIndex, frames]);

  const editingFrameSelection = useMemo(() => {
    if (editingFrameIndex === null || editingFrameIndex === undefined) return null;
    const frame = frames[editingFrameIndex];
    return frame?.selection ?? null;
  }, [editingFrameIndex, frames]);

  const liveSelection = useMemo(() => {
    if (!sprite) return null;
    if (!drag) {
      return editingFrameSelection ?? selection ?? activeFrameSelection;
    }
    return normalizeSelection(drag, sprite);
  }, [activeFrameSelection, drag, editingFrameSelection, selection, sprite]);

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

    if (liveSelection) {
      ctx.fillStyle = 'rgba(255, 205, 92, 0.2)';
      ctx.fillRect(liveSelection.x, liveSelection.y, liveSelection.width, liveSelection.height);
      ctx.strokeStyle = '#ffcd5c';
      ctx.lineWidth = 2;
      ctx.strokeRect(liveSelection.x + 0.5, liveSelection.y + 0.5, liveSelection.width, liveSelection.height);
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
  }, [grid.frameHeight, grid.frameWidth, liveSelection, pivot.x, pivot.y, sprite]);

  const toCanvasPoint = (event: MouseEvent<HTMLCanvasElement>) => {
    if (!sprite) return null;
    const rect = event.currentTarget.getBoundingClientRect();
    const scaleX = sprite.width / rect.width;
    const scaleY = sprite.height / rect.height;
    return {
      x: Math.max(0, Math.min(sprite.width, (event.clientX - rect.left) * scaleX)),
      y: Math.max(0, Math.min(sprite.height, (event.clientY - rect.top) * scaleY)),
    };
  };

  const isEditing = editingFrameIndex !== null && editingFrameIndex !== undefined;

  return (
    <section className="panel">
      <h2>Sprite Sheet + Grid Overlay</h2>

      <div className="canvas-wrap">
        <canvas
          ref={canvasRef}
          className="editor-canvas"
          width={sprite?.width ?? 512}
          height={sprite?.height ?? 512}
          onMouseDown={(event) => {
            const point = toCanvasPoint(event);
            if (!point) return;
            setDrag({ startX: point.x, startY: point.y, currentX: point.x, currentY: point.y });
          }}
          onMouseMove={(event) => {
            const point = toCanvasPoint(event);
            if (!point || !drag) return;
            setDrag({ ...drag, currentX: point.x, currentY: point.y });
          }}
          onMouseUp={(event) => {
            const point = toCanvasPoint(event);
            if (!point || !drag || !sprite) return;
            const finalDrag = { ...drag, currentX: point.x, currentY: point.y };
            const nextSelection = normalizeSelection(finalDrag, sprite);
            setSelection(nextSelection);
            setDrag(null);

            if (isEditing && editingFrameIndex !== null && onEditFrameSelection) {
              onEditFrameSelection(editingFrameIndex, nextSelection);
              onSelectionApplied?.();
            }

            const rect = event.currentTarget.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width;
            const y = (event.clientY - rect.top) / rect.height;
            onPivotChange({ x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) });
          }}
          onMouseLeave={() => setDrag(null)}
        />
      </div>

      <p className="muted">
        Selection: {liveSelection ? `${liveSelection.width}×${liveSelection.height} at (${liveSelection.x}, ${liveSelection.y})` : 'Drag on canvas to select a frame rectangle'}
      </p>
      {isEditing ? (
        <p className="muted">Editing frame #{(editingFrameIndex ?? 0) + 1}. Drag on canvas to update selection.</p>
      ) : (
        <button
          type="button"
          className="button"
          onClick={() => liveSelection && onAddFrame(liveSelection)}
          disabled={!liveSelection}
        >
          Add Frame from Selection
        </button>
      )}
    </section>
  );
};
