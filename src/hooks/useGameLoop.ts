'use client';

import { useEffect, useRef, useCallback } from 'react';

interface UseGameLoopReturn {
  isRunning: boolean;
  start: () => void;
  stop: () => void;
}

export function useGameLoop(
  callback: (deltaTime: number) => void,
  fps: number = 60
): UseGameLoopReturn {
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);
  const isRunningRef = useRef(false);
  const callbackRef = useRef(callback);

  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const frameInterval = 1000 / fps;

  const gameLoop = useCallback(
    (timestamp: number) => {
      if (!isRunningRef.current) return;

      if (previousTimeRef.current === null) {
        previousTimeRef.current = timestamp;
      }

      const deltaTime = timestamp - previousTimeRef.current;

      if (deltaTime >= frameInterval) {
        callbackRef.current(deltaTime);
        previousTimeRef.current = timestamp - (deltaTime % frameInterval);
      }

      requestRef.current = requestAnimationFrame(gameLoop);
    },
    [frameInterval]
  );

  const start = useCallback(() => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;
    previousTimeRef.current = null;
    requestRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop]);

  const stop = useCallback(() => {
    isRunningRef.current = false;
    if (requestRef.current !== null) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
    previousTimeRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    isRunning: isRunningRef.current,
    start,
    stop,
  };
}
