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

  return {
    trimOffsetX: startX,
    trimOffsetY: startY,
    trimWidth: Math.max(1, endX - startX + 1),
    trimHeight: Math.max(1, endY - startY + 1),
    margin: safeMargin,
    alphaThreshold: clamp(Math.floor(alphaThreshold), 0, 255),
  };
};

export const getDisplayViewport = (sprite: SpriteAsset, trim: TrimData) => ({
  x: clamp(Math.floor(trim.trimOffsetX), 0, Math.max(0, sprite.width - 1)),
  y: clamp(Math.floor(trim.trimOffsetY), 0, Math.max(0, sprite.height - 1)),
  width: clamp(Math.floor(trim.trimWidth), 1, sprite.width),
  height: clamp(Math.floor(trim.trimHeight), 1, sprite.height),
  originalWidth: sprite.width,
  originalHeight: sprite.height,
});
