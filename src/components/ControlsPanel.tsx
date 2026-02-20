import type { AlignmentMode } from '../utils/alignment';
import type { AnimationFrame, BlendMode, GridSettings, PlaybackSettings, PivotPoint, RenderSettings, TrimData } from '../types';

interface ControlsPanelProps {
  spriteSize: { width: number; height: number } | null;
  viewportSize: { width: number; height: number } | null;
  grid: GridSettings;
  playback: PlaybackSettings;
  render: RenderSettings;
  pivot: PivotPoint;
  frames: AnimationFrame[];
  trim: TrimData;
  showOriginalBounds: boolean;
  onShowOriginalBoundsChange: (next: boolean) => void;
  onGridChange: (grid: GridSettings) => void;
  onPlaybackChange: (next: PlaybackSettings) => void;
  onRenderChange: (next: RenderSettings) => void;
  onTrimChange: (trim: TrimData) => void;
  onAutoTrim: () => void;
  onResetTrim: () => void;
  alignmentMode: AlignmentMode;
  onAlignmentModeChange: (mode: AlignmentMode) => void;
  onAutoCenterAlign: () => void;
  onResetAlignment: () => void;
  onFrameChange: (index: number, frame: AnimationFrame) => void;
  onMoveFrame: (index: number, direction: 'up' | 'down') => void;
  onRemoveFrame: (index: number) => void;
  onSelectFrame: (index: number) => void;
  editingFrameIndex: number | null;
  onToggleEditFrameSelection: (index: number | null) => void;
  onJumpFrame: (kind: 'first' | 'last') => void;
  onExport: () => void;
}

const blendModes: BlendMode[] = ['normal', 'screen', 'additive', 'multiply'];

export const ControlsPanel = ({
  spriteSize,
  viewportSize,
  grid,
  playback,
  render,
  pivot,
  frames,
  trim,
  showOriginalBounds,
  onShowOriginalBoundsChange,
  onGridChange,
  onPlaybackChange,
  onRenderChange,
  onTrimChange,
  onAutoTrim,
  onResetTrim,
  alignmentMode,
  onAlignmentModeChange,
  onAutoCenterAlign,
  onResetAlignment,
  onFrameChange,
  onMoveFrame,
  onRemoveFrame,
  onSelectFrame,
  editingFrameIndex,
  onToggleEditFrameSelection,
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
      </div>

      <p className="muted">Frames in Sequence: <strong>{frames.length}</strong></p>
      <p className="muted">Sprite Size: <strong>{spriteSize ? `${spriteSize.width}×${spriteSize.height}` : 'No sprite loaded'}</strong></p>
      <p className="muted">Viewport Size: <strong>{viewportSize ? `${viewportSize.width}×${viewportSize.height}` : 'No viewport'}</strong></p>

      <div className="control-grid">
        <label>
          Viewport X
          <input
            type="number"
            min={0}
            value={trim.trimOffsetX}
            onChange={(e) => onTrimChange({ ...trim, trimOffsetX: Number(e.target.value) || 0 })}
          />
        </label>
        <label>
          Viewport Y
          <input
            type="number"
            min={0}
            value={trim.trimOffsetY}
            onChange={(e) => onTrimChange({ ...trim, trimOffsetY: Number(e.target.value) || 0 })}
          />
        </label>
        <label>
          Viewport Width
          <input
            type="number"
            min={1}
            value={trim.trimWidth}
            onChange={(e) => onTrimChange({ ...trim, trimWidth: Number(e.target.value) || 1 })}
          />
        </label>
        <label>
          Viewport Height
          <input
            type="number"
            min={1}
            value={trim.trimHeight}
            onChange={(e) => onTrimChange({ ...trim, trimHeight: Number(e.target.value) || 1 })}
          />
        </label>
      </div>

      <div className="control-grid">
        <label>
          Trim Margin (px)
          <input
            type="number"
            min={0}
            value={trim.margin}
            onChange={(e) => onTrimChange({ ...trim, margin: Math.max(0, Math.floor(Number(e.target.value) || 0)) })}
          />
        </label>
        <label>
          Alpha Threshold (0-255)
          <input
            type="number"
            min={0}
            max={255}
            value={trim.alphaThreshold}
            onChange={(e) => onTrimChange({ ...trim, alphaThreshold: Math.max(0, Math.min(255, Math.floor(Number(e.target.value) || 0))) })}
          />
        </label>
      </div>

      <div className="playback-row">
        <button type="button" className="button secondary" onClick={onAutoTrim}>Auto Trim Transparent Area</button>
        <button type="button" className="button secondary" onClick={onResetTrim}>Reset Trim</button>
      </div>

      <label>
        Alignment Mode
        <select value={alignmentMode} onChange={(e) => onAlignmentModeChange(e.target.value as AlignmentMode)}>
          <option value="average">Average Center</option>
          <option value="first-frame">Use First Frame as Reference</option>
        </select>
      </label>

      <div className="playback-row">
        <button type="button" className="button secondary" onClick={onAutoCenterAlign}>Auto Center Align</button>
        <button type="button" className="button secondary" onClick={onResetAlignment}>Reset Alignment</button>
      </div>

      <label className="checkbox">
        <input
          type="checkbox"
          checked={showOriginalBounds}
          onChange={(e) => onShowOriginalBoundsChange(e.target.checked)}
        />
        Show original image bounds
      </label>

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
        Fallback FPS: {playback.fps}
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

      <label className="checkbox">
        <input
          type="checkbox"
          checked={render.showPivot}
          onChange={(e) => onRenderChange({ ...render, showPivot: e.target.checked })}
        />
        Show Pivot
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
        Global Opacity: {render.opacity.toFixed(2)}
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
        Global Scale: {render.scale.toFixed(2)}
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

      <div className="frames-list">
        <h3>Frame Sequence</h3>
        {frames.length === 0 && <p className="muted">No frames yet. Add one from selection.</p>}
        {frames.map((frame, index) => (
          <article
            key={frame.id}
            className={`frame-card ${playback.currentFrame === index ? 'active' : ''}`}
            onClick={() => onSelectFrame(index)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectFrame(index);
              }
            }}
          >
            <p className="muted">#{index + 1} {frame.selection.width}×{frame.selection.height} @ {frame.selection.x},{frame.selection.y}</p>
            <div className="playback-row">
              <button
                type="button"
                className="button secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  if (editingFrameIndex === index) {
                    onToggleEditFrameSelection(null);
                  } else {
                    onToggleEditFrameSelection(index);
                  }
                }}
              >
                {editingFrameIndex === index ? '座標編集を終了' : '座標を編集'}
              </button>
            </div>
            <div className="control-grid">
              <label>
                Duration (ms)
                <input
                  type="number"
                  min={16}
                  value={frame.durationMs}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onFrameChange(index, { ...frame, durationMs: Math.max(16, Number(e.target.value) || 16) })}
                />
              </label>
              <label>
                Tween Frames
                <input
                  type="number"
                  min={0}
                  value={frame.tween?.tweenFrames ?? 0}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onFrameChange(index, {
                    ...frame,
                    tween: { ...(frame.tween ?? { tweenFrames: 0 }), tweenFrames: Math.max(0, Number(e.target.value) || 0) },
                  })}
                />
              </label>
              <label>
                Scale
                <input
                  type="number"
                  step={0.1}
                  min={0.1}
                  value={frame.scale}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onFrameChange(index, { ...frame, scale: Math.max(0.1, Number(e.target.value) || 1) })}
                />
              </label>
              <label>
                Scale To
                <input
                  type="number"
                  step={0.1}
                  min={0.1}
                  value={frame.tween?.scaleTo ?? frame.scale}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onFrameChange(index, {
                    ...frame,
                    tween: { ...(frame.tween ?? { tweenFrames: 0 }), scaleTo: Math.max(0.1, Number(e.target.value) || frame.scale) },
                  })}
                />
              </label>
              <label>
                Rotation (deg)
                <input
                  type="number"
                  step={1}
                  value={frame.rotation}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onFrameChange(index, { ...frame, rotation: Number(e.target.value) || 0 })}
                />
              </label>
              <label>
                Rotation To
                <input
                  type="number"
                  step={1}
                  value={frame.tween?.rotationTo ?? frame.rotation}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onFrameChange(index, {
                    ...frame,
                    tween: { ...(frame.tween ?? { tweenFrames: 0 }), rotationTo: Number(e.target.value) || 0 },
                  })}
                />
              </label>
              <label>
                Alpha
                <input
                  type="number"
                  min={0}
                  max={1}
                  step={0.01}
                  value={frame.alpha}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onFrameChange(index, { ...frame, alpha: Math.max(0, Math.min(1, Number(e.target.value) || 0)) })}
                />
              </label>
              <label>
                Alpha To
                <input
                  type="number"
                  min={0}
                  max={1}
                  step={0.01}
                  value={frame.tween?.alphaTo ?? frame.alpha}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onFrameChange(index, {
                    ...frame,
                    tween: { ...(frame.tween ?? { tweenFrames: 0 }), alphaTo: Math.max(0, Math.min(1, Number(e.target.value) || 0)) },
                  })}
                />
              </label>
            </div>
            <div className="playback-row">
              <button type="button" className="button secondary" onClick={(e) => { e.stopPropagation(); onMoveFrame(index, 'up'); }} disabled={index === 0}>Up</button>
              <button type="button" className="button secondary" onClick={(e) => { e.stopPropagation(); onMoveFrame(index, 'down'); }} disabled={index === frames.length - 1}>Down</button>
            </div>
            <button type="button" className="button secondary" onClick={(e) => { e.stopPropagation(); onRemoveFrame(index); }}>Remove</button>
          </article>
        ))}
      </div>

      <button type="button" className="button export" onClick={onExport}>Export JSON</button>
    </section>
  );
};
