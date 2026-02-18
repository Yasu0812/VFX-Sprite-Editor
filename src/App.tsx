import { useCallback, useMemo, useState } from 'react';
import './App.css';
import { SpriteLoader } from './components/SpriteLoader';
import { GridOverlay } from './components/GridOverlay';
import { PreviewCanvas } from './components/PreviewCanvas';
import { ControlsPanel } from './components/ControlsPanel';
import { useAnimationPlayback } from './hooks/useAnimationPlayback';
import type { AnimationFrame, ExportConfig, GridSettings, PlaybackSettings, PivotPoint, PlaybackState, RenderSettings, SpriteAsset } from './types';

const defaultGrid: GridSettings = {
  frameWidth: 64,
  frameHeight: 64,
  columns: 4,
  rows: 4,
};

const defaultPlayback: PlaybackSettings = {
  fps: 12,
  loop: true,
  isPlaying: true,
  currentFrame: 0,
};

const defaultRender: RenderSettings = {
  blendMode: 'normal',
  opacity: 1,
  scale: 1,
  onionSkin: false,
};

const defaultPivot: PivotPoint = { x: 0.5, y: 0.5 };

const fallbackDuration = (fps: number) => Math.max(16, Math.round(1000 / Math.max(1, fps)));

function App() {
  const [sprite, setSprite] = useState<SpriteAsset | null>(null);
  const [grid, setGrid] = useState<GridSettings>(defaultGrid);
  const [playback, setPlayback] = useState<PlaybackSettings>(defaultPlayback);
  const [render, setRender] = useState<RenderSettings>(defaultRender);
  const [pivot, setPivot] = useState<PivotPoint>(defaultPivot);
  const [frames, setFrames] = useState<AnimationFrame[]>([]);
  const [playhead, setPlayhead] = useState<PlaybackState>({ frameIndex: 0, tweenStep: 0, tweenProgress: 0 });

  const totalFrames = useMemo(() => frames.length, [frames.length]);

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
    const data: ExportConfig & { frames: AnimationFrame[] } = {
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
      frames,
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
          }} />
          <GridOverlay
            sprite={sprite}
            grid={grid}
            pivot={pivot}
            onPivotChange={setPivot}
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
          />
          <ControlsPanel
            spriteSize={sprite ? { width: sprite.width, height: sprite.height } : null}
            grid={grid}
            playback={playback}
            render={render}
            pivot={pivot}
            frames={frames}
            onGridChange={setGrid}
            onPlaybackChange={setPlayback}
            onRenderChange={setRender}
            onFrameChange={(index, frame) => {
              setFrames((prev) => prev.map((item, itemIndex) => (itemIndex === index ? frame : item)));
            }}
            onMoveFrame={onMoveFrame}
            onRemoveFrame={(index) => {
              setFrames((prev) => prev.filter((_, frameIndex) => frameIndex !== index));
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
