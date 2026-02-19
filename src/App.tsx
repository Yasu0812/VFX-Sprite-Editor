import { useCallback, useMemo, useState } from 'react';
import './App.css';
import { SpriteLoader } from './components/SpriteLoader';
import { GridOverlay } from './components/GridOverlay';
import { PreviewCanvas } from './components/PreviewCanvas';
import { ControlsPanel } from './components/ControlsPanel';
import { useAnimationPlayback } from './hooks/useAnimationPlayback';
import { createFullTrim, detectTrimBounds, getDisplayViewport } from './utils/trimLogic';
import type { AnimationFrame, ExportConfig, GridSettings, PlaybackSettings, PivotPoint, PlaybackState, RenderSettings, SpriteAsset, TrimData } from './types';

const defaultGrid: GridSettings = {
  frameWidth: 64,
  frameHeight: 64,
  columns: 4,
  rows: 4,
};

const defaultPlayback: PlaybackSettings = {
  fps: 12,
  loop: true,
  isPlaying: false,
  currentFrame: 0,
};

const defaultRender: RenderSettings = {
  blendMode: 'normal',
  opacity: 1,
  scale: 1,
  onionSkin: false,
};

const defaultPivot: PivotPoint = { x: 0.5, y: 0.5 };
const defaultTrim: TrimData = {
  trimOffsetX: 0,
  trimOffsetY: 0,
  trimWidth: 0,
  trimHeight: 0,
  margin: 10,
  alphaThreshold: 0,
};

const fallbackDuration = (fps: number) => Math.max(16, Math.round(1000 / Math.max(1, fps)));

function App() {
  const [sprite, setSprite] = useState<SpriteAsset | null>(null);
  const [grid, setGrid] = useState<GridSettings>(defaultGrid);
  const [playback, setPlayback] = useState<PlaybackSettings>(defaultPlayback);
  const [render, setRender] = useState<RenderSettings>(defaultRender);
  const [pivot, setPivot] = useState<PivotPoint>(defaultPivot);
  const [frames, setFrames] = useState<AnimationFrame[]>([]);
  const [editingFrameIndex, setEditingFrameIndex] = useState<number | null>(null);
  const [playhead, setPlayhead] = useState<PlaybackState>({ frameIndex: 0, tweenStep: 0, tweenProgress: 0 });
  const [trim, setTrim] = useState<TrimData>(defaultTrim);
  const [showOriginalBounds, setShowOriginalBounds] = useState<boolean>(true);

  const totalFrames = useMemo(() => frames.length, [frames.length]);

  const displayViewport = useMemo(() => {
    if (!sprite) return null;
    if (trim.trimWidth <= 0 || trim.trimHeight <= 0) return getDisplayViewport(sprite, createFullTrim(sprite, trim.margin, trim.alphaThreshold));
    return getDisplayViewport(sprite, trim);
  }, [sprite, trim]);

  useAnimationPlayback({
    isPlaying: playback.isPlaying,
    loop: playback.loop,
    frames,
    onStateChange: (next) => {
      setPlayhead(next);
      setPlayback((prev) => ({ ...prev, currentFrame: next.frameIndex }));
    },
  });

  const handleExport = () => {
    if (!sprite || !displayViewport) return;

    const exportFrames = frames.map((frame) => ({
      ...frame,
      selection: {
        ...frame.selection,
        x: frame.selection.x + displayViewport.x,
        y: frame.selection.y + displayViewport.y,
      },
    }));

    const data: ExportConfig & {
      frames: Array<{ x: number; y: number; width: number; height: number }>;
      trim: { offsetX: number; offsetY: number; width: number; height: number; margin: number };
      rawFrames: AnimationFrame[];
    } = {
      frameWidth: grid.frameWidth,
      frameHeight: grid.frameHeight,
      cols: grid.columns,
      rows: grid.rows,
      fps: playback.fps,
      loop: playback.loop,
      pivotX: pivot.x,
      pivotY: pivot.y,
      blendMode: render.blendMode,
      opacity: render.opacity,
      scale: render.scale,
      frames: exportFrames.map((frame) => ({
        x: frame.selection.x,
        y: frame.selection.y,
        width: frame.selection.width,
        height: frame.selection.height,
      })),
      trim: {
        offsetX: displayViewport.x,
        offsetY: displayViewport.y,
        width: displayViewport.width,
        height: displayViewport.height,
        margin: trim.margin,
      },
      rawFrames: exportFrames,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sprite?.name.replace(/\.png$/i, '') ?? 'sprite'}-config.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onMoveFrame = useCallback((index: number, direction: 'up' | 'down') => {
    setFrames((prev) => {
      const next = [...prev];
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }, []);

  return (
    <main className="app-shell">
      <header className="app-header">
        <h1>VFX Sprite Editor</h1>
        <p>Quickly preview, tune, and export 2D sprite animation metadata.</p>
      </header>

      <div className="layout">
        <section className="left-column">
          <SpriteLoader onLoad={(asset) => {
            setSprite(asset);
            setFrames([]);
            setEditingFrameIndex(null);
            setTrim(createFullTrim(asset, defaultTrim.margin, defaultTrim.alphaThreshold));
          }} />
          <GridOverlay
            sprite={sprite}
            grid={grid}
            pivot={pivot}
            frames={frames}
            activeFrameIndex={playback.currentFrame}
            editingFrameIndex={editingFrameIndex}
            displayViewport={displayViewport}
            showOriginalBounds={showOriginalBounds}
            onPivotChange={setPivot}
            onEditFrameSelection={(index, selection) => {
              setFrames((prev) => prev.map((item, itemIndex) => (itemIndex === index ? { ...item, selection } : item)));
            }}
            onSelectionApplied={() => setEditingFrameIndex(null)}
            onAddFrame={(selection) => {
              setFrames((prev) => ([
                ...prev,
                {
                  id: crypto.randomUUID(),
                  selection,
                  durationMs: fallbackDuration(playback.fps),
                  scale: 1,
                  rotation: 0,
                  alpha: 1,
                  tween: { tweenFrames: 0 },
                },
              ]));
            }}
          />
        </section>

        <section className="right-column">
          <PreviewCanvas
            sprite={sprite}
            frames={frames}
            playhead={playhead}
            renderSettings={render}
            pivot={pivot}
            displayViewport={displayViewport}
          />
          <ControlsPanel
            spriteSize={sprite ? { width: sprite.width, height: sprite.height } : null}
            viewportSize={displayViewport ? { width: displayViewport.width, height: displayViewport.height } : null}
            grid={grid}
            playback={playback}
            render={render}
            pivot={pivot}
            frames={frames}
            trim={trim}
            showOriginalBounds={showOriginalBounds}
            onShowOriginalBoundsChange={setShowOriginalBounds}
            onGridChange={setGrid}
            onPlaybackChange={setPlayback}
            onRenderChange={setRender}
            onTrimChange={setTrim}
            onAutoTrim={() => {
              if (!sprite) return;
              setTrim(detectTrimBounds(sprite, trim.margin, trim.alphaThreshold));
            }}
            onResetTrim={() => {
              if (!sprite) return;
              setTrim(createFullTrim(sprite, trim.margin, trim.alphaThreshold));
            }}
            onFrameChange={(index, frame) => {
              setFrames((prev) => prev.map((item, itemIndex) => (itemIndex === index ? frame : item)));
            }}
            onMoveFrame={onMoveFrame}
            onRemoveFrame={(index) => {
              setFrames((prev) => prev.filter((_, frameIndex) => frameIndex !== index));
              setEditingFrameIndex((prev) => {
                if (prev === null) return null;
                if (prev === index) return null;
                return prev > index ? prev - 1 : prev;
              });
            }}
            editingFrameIndex={editingFrameIndex}
            onToggleEditFrameSelection={setEditingFrameIndex}
            onSelectFrame={(index) => {
              const target = Math.max(0, Math.min(index, Math.max(0, totalFrames - 1)));
              setPlayhead({ frameIndex: target, tweenStep: 0, tweenProgress: 0 });
              setPlayback((prev) => ({ ...prev, currentFrame: target }));
            }}
            onJumpFrame={(kind) => {
              const target = kind === 'first' ? 0 : Math.max(0, totalFrames - 1);
              setPlayhead({ frameIndex: target, tweenStep: 0, tweenProgress: 0 });
              setPlayback((prev) => ({ ...prev, currentFrame: target }));
            }}
            onExport={handleExport}
          />
        </section>
      </div>
    </main>
  );
}

export default App;
