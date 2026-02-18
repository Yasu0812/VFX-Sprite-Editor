export const drawCheckerBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  const tile = 16;
  ctx.fillStyle = '#23262f';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#1a1c22';

  for (let y = 0; y < height; y += tile) {
    for (let x = (y / tile) % 2 === 0 ? tile : 0; x < width; x += tile * 2) {
      ctx.fillRect(x, y, tile, tile);
    }
  }
};

export const clampFrame = (frame: number, totalFrames: number) => {
  if (totalFrames <= 0) return 0;
  return Math.max(0, Math.min(frame, totalFrames - 1));
};
