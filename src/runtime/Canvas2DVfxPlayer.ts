export interface AtlasFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AtlasConfig {
  frames: AtlasFrame[];
}

export interface Canvas2DVfxPlayerOptions {
  loop?: boolean;
  frameDurationMs?: number;
}

/**
 * Lightweight runtime-only VFX sprite player for Canvas2D.
 * - No editor logic
 * - No trimming/alignment handling
 */
export class Canvas2DVfxPlayer {
  private readonly frames: AtlasFrame[];
  private readonly image: HTMLImageElement;
  private frameDurationMs: number;
  private elapsedMs = 0;
  private frameIndex = 0;
  private playing = false;

  public loop: boolean;

  constructor(
    atlas: AtlasConfig,
    image: HTMLImageElement,
    options: Canvas2DVfxPlayerOptions = {}
  ) {
    if (!atlas?.frames?.length) {
      throw new Error('Atlas config must include a non-empty frames array.');
    }

    this.frames = atlas.frames.map((frame, index) => {
      this.assertFrame(frame, index);
      return {
        x: frame.x,
        y: frame.y,
        width: frame.width,
        height: frame.height,
      };
    });

    this.image = image;
    this.loop = options.loop ?? true;
    this.frameDurationMs = options.frameDurationMs ?? 1000 / 30;
  }

  play(): void {
    this.playing = true;
  }

  stop(): void {
    this.playing = false;
    this.frameIndex = 0;
    this.elapsedMs = 0;
  }

  update(deltaTimeMs: number): void {
    if (!this.playing || this.frames.length <= 1) {
      return;
    }

    if (!Number.isFinite(deltaTimeMs) || deltaTimeMs <= 0) {
      return;
    }

    this.elapsedMs += deltaTimeMs;

    while (this.elapsedMs >= this.frameDurationMs) {
      this.elapsedMs -= this.frameDurationMs;

      if (this.frameIndex < this.frames.length - 1) {
        this.frameIndex += 1;
        continue;
      }

      if (this.loop) {
        this.frameIndex = 0;
      } else {
        this.frameIndex = this.frames.length - 1;
        this.playing = false;
        this.elapsedMs = 0;
        break;
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const frame = this.frames[this.frameIndex];
    ctx.drawImage(
      this.image,
      frame.x,
      frame.y,
      frame.width,
      frame.height,
      x,
      y,
      frame.width,
      frame.height
    );
  }

  setFrameDuration(frameDurationMs: number): void {
    if (!Number.isFinite(frameDurationMs) || frameDurationMs <= 0) {
      throw new Error('frameDurationMs must be a positive number.');
    }
    this.frameDurationMs = frameDurationMs;
  }

  getCurrentFrameIndex(): number {
    return this.frameIndex;
  }

  isPlaying(): boolean {
    return this.playing;
  }

  private assertFrame(frame: AtlasFrame, index: number): void {
    const values = [frame.x, frame.y, frame.width, frame.height];
    if (values.some((value) => !Number.isFinite(value))) {
      throw new Error(`Frame ${index} has non-finite values.`);
    }
    if (frame.width <= 0 || frame.height <= 0) {
      throw new Error(`Frame ${index} must have positive width and height.`);
    }
  }
}
