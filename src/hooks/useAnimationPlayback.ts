import { useEffect, useMemo, useRef } from 'react';
import type { AnimationFrame, PlaybackState } from '../types';

interface PlaybackArgs {
  isPlaying: boolean;
  loop: boolean;
  frames: AnimationFrame[];
  onStateChange: (next: PlaybackState) => void;
}

const getSegmentDuration = (frame: AnimationFrame) => {
  const segments = 1 + Math.max(0, frame.tween?.tweenFrames ?? 0);
  return Math.max(16, frame.durationMs / segments);
};

export const useAnimationPlayback = ({
  isPlaying,
  loop,
  frames,
  onStateChange,
}: PlaybackArgs) => {
  const rafRef = useRef<number>(0);
  const lastTickRef = useRef(0);
  const stateRef = useRef<PlaybackState>({ frameIndex: 0, tweenStep: 0, tweenProgress: 0 });

  const maxTweenByFrame = useMemo(() => frames.map((frame) => Math.max(0, frame.tween?.tweenFrames ?? 0)), [frames]);

  useEffect(() => {
    if (!isPlaying || frames.length <= 0) return;

    const tick = (time: number) => {
      const currentState = stateRef.current;
      const frame = frames[currentState.frameIndex];
      if (!frame) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (!lastTickRef.current) {
        lastTickRef.current = time;
      }

      const segmentDuration = getSegmentDuration(frame);
      const elapsed = time - lastTickRef.current;

      onStateChange({ ...currentState, tweenProgress: Math.min(1, elapsed / segmentDuration) });

      if (elapsed >= segmentDuration) {
        lastTickRef.current = time;

        const maxTween = maxTweenByFrame[currentState.frameIndex] ?? 0;
        if (currentState.tweenStep < maxTween) {
          stateRef.current = {
            frameIndex: currentState.frameIndex,
            tweenStep: currentState.tweenStep + 1,
            tweenProgress: 0,
          };
        } else {
          const nextFrame = currentState.frameIndex + 1;
          if (nextFrame >= frames.length) {
            if (loop) {
              stateRef.current = { frameIndex: 0, tweenStep: 0, tweenProgress: 0 };
            } else {
              stateRef.current = {
                frameIndex: Math.max(0, frames.length - 1),
                tweenStep: 0,
                tweenProgress: 0,
              };
            }
          } else {
            stateRef.current = { frameIndex: nextFrame, tweenStep: 0, tweenProgress: 0 };
          }
        }

        onStateChange(stateRef.current);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      lastTickRef.current = 0;
    };
  }, [frames, isPlaying, loop, maxTweenByFrame, onStateChange]);

  useEffect(() => {
    stateRef.current = { frameIndex: 0, tweenStep: 0, tweenProgress: 0 };
    onStateChange(stateRef.current);
    lastTickRef.current = 0;
  }, [frames, onStateChange]);
};
