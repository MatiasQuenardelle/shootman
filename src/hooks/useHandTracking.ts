'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { HandLandmarks } from '@/types';
import { GAME_CONFIG } from '@/constants/game';

// MediaPipe types
interface MediaPipeHands {
  setOptions(options: {
    maxNumHands: number;
    modelComplexity: number;
    minDetectionConfidence: number;
    minTrackingConfidence: number;
  }): void;
  onResults(callback: (results: MediaPipeResults) => void): void;
  send(input: { image: HTMLVideoElement }): Promise<void>;
  close(): void;
}

interface MediaPipeResults {
  multiHandLandmarks?: Array<Array<{ x: number; y: number; z: number }>>;
  multiHandedness?: Array<{ label: string; score: number }>;
}

interface UseHandTrackingReturn {
  handLandmarks: HandLandmarks | null;
  isInitialized: boolean;
  isTracking: boolean;
  error: string | null;
  startTracking: () => void;
  stopTracking: () => void;
}

export function useHandTracking(
  videoElement: HTMLVideoElement | null
): UseHandTrackingReturn {
  const handsRef = useRef<MediaPipeHands | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [handLandmarks, setHandLandmarks] = useState<HandLandmarks | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize MediaPipe Hands
  useEffect(() => {
    if (!videoElement) return;

    const initializeHands = async () => {
      try {
        // Dynamically import MediaPipe to avoid SSR issues
        const { Hands } = await import('@mediapipe/hands');

        const hands = new Hands({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
          },
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: GAME_CONFIG.HAND_DETECTION_CONFIDENCE,
          minTrackingConfidence: GAME_CONFIG.HAND_DETECTION_CONFIDENCE,
        });

        hands.onResults((results: MediaPipeResults) => {
          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            setHandLandmarks({
              landmarks: results.multiHandLandmarks[0],
            });
          } else {
            setHandLandmarks(null);
          }
        });

        handsRef.current = hands as MediaPipeHands;
        setIsInitialized(true);
        setError(null);
      } catch (err) {
        console.error('Failed to initialize MediaPipe Hands:', err);
        setError('Failed to initialize hand tracking. Please refresh and try again.');
      }
    };

    initializeHands();

    return () => {
      if (handsRef.current) {
        handsRef.current.close();
        handsRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [videoElement]);

  const processFrame = useCallback(async () => {
    if (!handsRef.current || !videoElement || !isTracking) return;

    if (videoElement.readyState >= 2) {
      try {
        await handsRef.current.send({ image: videoElement });
      } catch (err) {
        console.error('Error processing frame:', err);
      }
    }

    animationFrameRef.current = requestAnimationFrame(processFrame);
  }, [videoElement, isTracking]);

  const startTracking = useCallback(() => {
    if (!isInitialized) return;
    setIsTracking(true);
  }, [isInitialized]);

  const stopTracking = useCallback(() => {
    setIsTracking(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setHandLandmarks(null);
  }, []);

  // Start/stop frame processing based on tracking state
  useEffect(() => {
    if (isTracking && isInitialized) {
      processFrame();
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isTracking, isInitialized, processFrame]);

  return {
    handLandmarks,
    isInitialized,
    isTracking,
    error,
    startTracking,
    stopTracking,
  };
}
