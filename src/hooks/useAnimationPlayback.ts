import { useEffect, useRef } from 'react';

interface PlaybackArgs {
  isPlaying: boolean;
  fps: number;
  totalFrames: number;
  loop: boolean;
  onFrameChange: (nextFrame: number) => void;
}

export const useAnimationPlayback = ({
  isPlaying,
  fps,
  totalFrames,
  loop,
  onFrameChange,
}: PlaybackArgs) => {
  const rafRef = useRef<number>(0);
  const lastTickRef = useRef(0);
  const frameDuration = 1000 / Math.max(1, fps);

  useEffect(() => {
    if (!isPlaying || totalFrames <= 0) return;

    const tick = (time: number) => {
      if (!lastTickRef.current) {
        lastTickRef.current = time;
      }

      if (time - lastTickRef.current >= frameDuration) {
        lastTickRef.current = time;
        onFrameChange(loop ? -1 : -2);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      lastTickRef.current = 0;
    };
  }, [frameDuration, isPlaying, loop, onFrameChange, totalFrames]);
};
