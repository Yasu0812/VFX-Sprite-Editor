import type { BlendMode, GridSettings, PlaybackSettings, PivotPoint, RenderSettings } from '../types';

interface ControlsPanelProps {
  spriteSize: { width: number; height: number } | null;
  grid: GridSettings;
  playback: PlaybackSettings;
  render: RenderSettings;
  pivot: PivotPoint;
  totalFrames: number;
  onGridChange: (grid: GridSettings) => void;
  onPlaybackChange: (next: PlaybackSettings) => void;
  onRenderChange: (next: RenderSettings) => void;
  onJumpFrame: (kind: 'first' | 'last') => void;
  onExport: () => void;
}

const blendModes: BlendMode[] = ['normal', 'screen', 'additive', 'multiply'];

export const ControlsPanel = ({
  spriteSize,
  grid,
  playback,
  render,
  pivot,
  totalFrames,
  onGridChange,
  onPlaybackChange,
  onRenderChange,
  onJumpFrame,
  onExport,
}: ControlsPanelProps) => {
  const updateGrid = (key: keyof GridSettings, value: number) => {
    onGridChange({ ...grid, [key]: Math.max(1, Math.floor(value)) });
  };

  return (
    <section className="panel controls-panel">
      <h2>Controls</h2>

      <div className="control-grid">
        <label>
          Frame Width
          <input type="number" min={1} value={grid.frameWidth} onChange={(e) => updateGrid('frameWidth', Number(e.target.value))} />
        </label>
        <label>
          Frame Height
          <input type="number" min={1} value={grid.frameHeight} onChange={(e) => updateGrid('frameHeight', Number(e.target.value))} />
        </label>
        <label>
          Columns
          <input type="number" min={1} value={grid.columns} onChange={(e) => updateGrid('columns', Number(e.target.value))} />
        </label>
        <label>
          Rows
          <input type="number" min={1} value={grid.rows} onChange={(e) => updateGrid('rows', Number(e.target.value))} />
        </label>
      </div>

      <p className="muted">Total Frames: <strong>{totalFrames}</strong></p>
      <p className="muted">Sprite Size: <strong>{spriteSize ? `${spriteSize.width}×${spriteSize.height}` : 'No sprite loaded'}</strong></p>

      <div className="playback-row">
        <button type="button" className="button" onClick={() => onPlaybackChange({ ...playback, isPlaying: !playback.isPlaying })}>
          {playback.isPlaying ? 'Pause' : 'Play'}
        </button>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={playback.loop}
            onChange={(e) => onPlaybackChange({ ...playback, loop: e.target.checked })}
          />
          Loop
        </label>
      </div>

      <label>
        FPS: {playback.fps}
        <input
          type="range"
          min={1}
          max={60}
          value={playback.fps}
          onChange={(e) => onPlaybackChange({ ...playback, fps: Number(e.target.value) })}
        />
      </label>

      <p className="muted">Current Frame: {playback.currentFrame}</p>

      <div className="playback-row">
        <button type="button" className="button secondary" onClick={() => onJumpFrame('first')}>Jump First</button>
        <button type="button" className="button secondary" onClick={() => onJumpFrame('last')}>Jump Last</button>
      </div>

      <label className="checkbox">
        <input
          type="checkbox"
          checked={render.onionSkin}
          onChange={(e) => onRenderChange({ ...render, onionSkin: e.target.checked })}
        />
        Onion-skin first frame on last frame
      </label>

      <label>
        Blend Mode
        <select value={render.blendMode} onChange={(e) => onRenderChange({ ...render, blendMode: e.target.value as BlendMode })}>
          {blendModes.map((mode) => (
            <option key={mode} value={mode}>{mode}</option>
          ))}
        </select>
      </label>

      <label>
        Opacity: {render.opacity.toFixed(2)}
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={render.opacity}
          onChange={(e) => onRenderChange({ ...render, opacity: Number(e.target.value) })}
        />
      </label>

      <label>
        Scale: {render.scale.toFixed(2)}
        <input
          type="range"
          min={0.1}
          max={3}
          step={0.1}
          value={render.scale}
          onChange={(e) => onRenderChange({ ...render, scale: Number(e.target.value) })}
        />
      </label>

      <p className="muted">
        Pivot (normalized): ({pivot.x.toFixed(3)}, {pivot.y.toFixed(3)})
      </p>

      <button type="button" className="button export" onClick={onExport}>Export JSON</button>
    </section>
  );
};
