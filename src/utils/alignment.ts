import type { AnimationFrame, DisplayViewport, SpriteAsset } from '../types';

export type AlignmentMode = 'average' | 'first-frame';

export interface FrameCentroid {
  x: number;
  y: number;
}

export interface FrameCentroidResult {
  centroid: FrameCentroid | null;
  cacheKey: string;
}

const createCacheKey = (frame: AnimationFrame, viewport: DisplayViewport, alphaThreshold: number) => (
  [
    frame.id,
    frame.selection.x,
    frame.selection.y,
    frame.selection.width,
    frame.selection.height,
    viewport.x,
    viewport.y,
    alphaThreshold,
  ].join('|')
);

const createSamplerCanvas = (sprite: SpriteAsset) => {
  const canvas = document.createElement('canvas');
  canvas.width = sprite.width;
  canvas.height = sprite.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(sprite.image, 0, 0);
  return ctx;
};

const readCentroid = (
  sampler: CanvasRenderingContext2D,
  frame: AnimationFrame,
  viewport: DisplayViewport,
  alphaThreshold: number,
): FrameCentroid | null => {
  const sourceX = frame.selection.x + viewport.x;
  const sourceY = frame.selection.y + viewport.y;
  const { width, height } = frame.selection;

  if (width <= 0 || height <= 0) return null;

  const imageData = sampler.getImageData(sourceX, sourceY, width, height);
  const pixels = imageData.data;

  let sumX = 0;
  let sumY = 0;
  let totalAlpha = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const alpha = pixels[index + 3];
      if (alpha <= alphaThreshold) continue;
      sumX += x * alpha;
      sumY += y * alpha;
      totalAlpha += alpha;
    }
  }

  if (totalAlpha === 0) return null;

  return {
    x: sumX / totalAlpha,
    y: sumY / totalAlpha,
  };
};

export const calculateFrameCentroids = (
  sprite: SpriteAsset | null,
  frames: AnimationFrame[],
  viewport: DisplayViewport | null,
  alphaThreshold: number,
  cache: Map<string, FrameCentroidResult>,
): Map<string, FrameCentroid | null> => {
  const centroids = new Map<string, FrameCentroid | null>();
  if (!sprite || !viewport) return centroids;

  const sampler = createSamplerCanvas(sprite);
  if (!sampler) return centroids;

  for (const frame of frames) {
    const cacheKey = createCacheKey(frame, viewport, alphaThreshold);
    const cached = cache.get(frame.id);
    if (cached && cached.cacheKey === cacheKey) {
      centroids.set(frame.id, cached.centroid);
      continue;
    }

    const centroid = readCentroid(sampler, frame, viewport, alphaThreshold);
    cache.set(frame.id, { centroid, cacheKey });
    centroids.set(frame.id, centroid);
  }

  for (const existingId of Array.from(cache.keys())) {
    if (!frames.some((frame) => frame.id === existingId)) {
      cache.delete(existingId);
    }
  }

  return centroids;
};

export const applyAlignmentOffsets = (
  frames: AnimationFrame[],
  centroids: Map<string, FrameCentroid | null>,
  mode: AlignmentMode,
): AnimationFrame[] => {
  if (frames.length === 0) return frames;

  const valid = frames
    .map((frame) => ({ frame, centroid: centroids.get(frame.id) ?? null }))
    .filter((item): item is { frame: AnimationFrame; centroid: FrameCentroid } => item.centroid !== null);

  if (valid.length === 0) return frames;

  const target = mode === 'first-frame'
    ? centroids.get(frames[0].id) ?? null
    : {
      x: valid.reduce((acc, item) => acc + item.centroid.x, 0) / valid.length,
      y: valid.reduce((acc, item) => acc + item.centroid.y, 0) / valid.length,
    };

  if (!target) return frames;

  return frames.map((frame) => {
    const centroid = centroids.get(frame.id);
    if (!centroid) return frame;

    return {
      ...frame,
      offsetX: target.x - centroid.x,
      offsetY: target.y - centroid.y,
    };
  });
};

export const resetAlignmentOffsets = (frames: AnimationFrame[]): AnimationFrame[] => (
  frames.map((frame) => {
    if (frame.offsetX === undefined && frame.offsetY === undefined) return frame;
    return {
      ...frame,
      offsetX: 0,
      offsetY: 0,
    };
  })
);
