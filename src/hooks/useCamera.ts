'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { GAME_CONFIG } from '@/constants/game';

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isLoading: boolean;
  error: string | null;
  hasPermission: boolean;
  requestPermission: () => Promise<void>;
}

export function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isRequestingRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const requestPermission = useCallback(async () => {
    // Prevent multiple simultaneous requests
    if (isRequestingRef.current) return;
    isRequestingRef.current = true;

    setIsLoading(true);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: GAME_CONFIG.CAMERA_WIDTH },
          height: { ideal: GAME_CONFIG.CAMERA_HEIGHT },
          facingMode: 'user',
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          // Ignore AbortError - this happens when play() is interrupted by autoPlay
          // or when the component unmounts during playback initialization
          if (playErr instanceof Error && playErr.name !== 'AbortError') {
            throw playErr;
          }
        }
      }

      setHasPermission(true);
      setIsLoading(false);
      isRequestingRef.current = false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';

      if (errorMessage.includes('Permission denied') || errorMessage.includes('NotAllowed')) {
        setError('Camera permission denied. Please allow camera access to play.');
      } else if (errorMessage.includes('NotFound') || errorMessage.includes('DevicesNotFound')) {
        setError('No camera found. Please connect a camera to play.');
      } else {
        setError(`Camera error: ${errorMessage}`);
      }

      setHasPermission(false);
      setIsLoading(false);
      isRequestingRef.current = false;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);

  return {
    videoRef,
    isLoading,
    error,
    hasPermission,
    requestPermission,
  };
}
