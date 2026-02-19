import type { SpriteAsset, TrimData } from '../types';

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const createFullTrim = (sprite: SpriteAsset, margin = 10, alphaThreshold = 0): TrimData => ({
  trimOffsetX: 0,
  trimOffsetY: 0,
  trimWidth: sprite.width,
  trimHeight: sprite.height,
  margin,
  alphaThreshold,
});

export const normalizeTrimData = (sprite: SpriteAsset, trim: TrimData): TrimData => {
  const safeMargin = Math.max(0, Math.floor(trim.margin));
  const safeAlphaThreshold = clamp(Math.floor(trim.alphaThreshold), 0, 255);
  const maxOffsetX = Math.max(0, sprite.width - 1);
  const maxOffsetY = Math.max(0, sprite.height - 1);
  const trimOffsetX = clamp(Math.floor(trim.trimOffsetX), 0, maxOffsetX);
  const trimOffsetY = clamp(Math.floor(trim.trimOffsetY), 0, maxOffsetY);
  const maxTrimWidth = Math.max(1, sprite.width - trimOffsetX);
  const maxTrimHeight = Math.max(1, sprite.height - trimOffsetY);

  return {
    trimOffsetX,
    trimOffsetY,
    trimWidth: clamp(Math.floor(trim.trimWidth), 1, maxTrimWidth),
    trimHeight: clamp(Math.floor(trim.trimHeight), 1, maxTrimHeight),
    margin: safeMargin,
    alphaThreshold: safeAlphaThreshold,
  };
};

export const detectTrimBounds = (sprite: SpriteAsset, margin = 10, alphaThreshold = 0): TrimData => {
  const canvas = document.createElement('canvas');
  canvas.width = sprite.width;
  canvas.height = sprite.height;
  const context = canvas.getContext('2d');

  if (!context) {
    return createFullTrim(sprite, margin, alphaThreshold);
  }

  context.drawImage(sprite.image, 0, 0);
  const imageData = context.getImageData(0, 0, sprite.width, sprite.height);
  const { data, width, height } = imageData;

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > alphaThreshold) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    return createFullTrim(sprite, margin, alphaThreshold);
  }

  const safeMargin = Math.max(0, Math.floor(margin));
  const startX = clamp(minX - safeMargin, 0, width - 1);
  const startY = clamp(minY - safeMargin, 0, height - 1);
  const endX = clamp(maxX + safeMargin, 0, width - 1);
  const endY = clamp(maxY + safeMargin, 0, height - 1);

  return normalizeTrimData(sprite, {
    trimOffsetX: startX,
    trimOffsetY: startY,
    trimWidth: Math.max(1, endX - startX + 1),
    trimHeight: Math.max(1, endY - startY + 1),
    margin: safeMargin,
    alphaThreshold,
  });
};

export const getDisplayViewport = (sprite: SpriteAsset, trim: TrimData) => {
  const normalized = normalizeTrimData(sprite, trim);
  return {
    x: normalized.trimOffsetX,
    y: normalized.trimOffsetY,
    width: normalized.trimWidth,
    height: normalized.trimHeight,
    originalWidth: sprite.width,
    originalHeight: sprite.height,
  };
};
