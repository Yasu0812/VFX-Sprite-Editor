import { useCallback, useMemo, useState } from 'react';
import './App.css';
import { SpriteLoader } from './components/SpriteLoader';
import { GridOverlay } from './components/GridOverlay';
import { PreviewCanvas } from './components/PreviewCanvas';
import { ControlsPanel } from './components/ControlsPanel';
import { useAnimationPlayback } from './hooks/useAnimationPlayback';
import type { ExportConfig, GridSettings, PlaybackSettings, PivotPoint, RenderSettings, SpriteAsset } from './types';
import { clampFrame } from './utils/canvasRender';

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

function App() {
  const [sprite, setSprite] = useState<SpriteAsset | null>(null);
  const [grid, setGrid] = useState<GridSettings>(defaultGrid);
  const [playback, setPlayback] = useState<PlaybackSettings>(defaultPlayback);
  const [render, setRender] = useState<RenderSettings>(defaultRender);
  const [pivot, setPivot] = useState<PivotPoint>(defaultPivot);

  const totalFrames = useMemo(() => grid.columns * grid.rows, [grid.columns, grid.rows]);
  const safeCurrentFrame = clampFrame(playback.currentFrame, totalFrames);

  const stepFrame = useCallback((mode: 'looping' | 'non-looping') => {
    setPlayback((prev) => {
      const next = prev.currentFrame + 1;
      if (mode === 'looping') {
        return { ...prev, currentFrame: next % Math.max(1, totalFrames) };
      }

      if (next >= totalFrames) {
        return { ...prev, currentFrame: totalFrames - 1, isPlaying: false };
      }

      return { ...prev, currentFrame: next };
    });
  }, [totalFrames]);

  useAnimationPlayback({
    isPlaying: playback.isPlaying,
    fps: playback.fps,
    totalFrames,
    loop: playback.loop,
    onFrameChange: (token) => stepFrame(token === -1 ? 'looping' : 'non-looping'),
  });


  const handleExport = () => {
    const data: ExportConfig = {
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
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sprite?.name.replace(/\.png$/i, '') ?? 'sprite'}-config.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="app-shell">
      <header className="app-header">
        <h1>VFX Sprite Editor</h1>
        <p>Quickly preview, tune, and export 2D sprite animation metadata.</p>
      </header>

      <div className="layout">
        <section className="left-column">
          <SpriteLoader onLoad={setSprite} />
          <GridOverlay sprite={sprite} grid={grid} pivot={pivot} onPivotChange={setPivot} />
        </section>

        <section className="right-column">
          <PreviewCanvas
            sprite={sprite}
            grid={grid}
            currentFrame={safeCurrentFrame}
            totalFrames={totalFrames}
            renderSettings={render}
            pivot={pivot}
          />
          <ControlsPanel
            spriteSize={sprite ? { width: sprite.width, height: sprite.height } : null}
            grid={grid}
            playback={{ ...playback, currentFrame: safeCurrentFrame }}
            render={render}
            pivot={pivot}
            totalFrames={totalFrames}
            onGridChange={setGrid}
            onPlaybackChange={setPlayback}
            onRenderChange={setRender}
            onJumpFrame={(kind) =>
              setPlayback((prev) => ({
                ...prev,
                currentFrame: kind === 'first' ? 0 : Math.max(0, totalFrames - 1),
              }))
            }
            onExport={handleExport}
          />
        </section>
      </div>
    </main>
  );
}

export default App;
