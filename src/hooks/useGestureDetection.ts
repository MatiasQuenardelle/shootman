'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { HandLandmarks, GestureState, AimPosition } from '@/types';
import { HAND_LANDMARKS, GAME_CONFIG } from '@/constants/game';

interface UseGestureDetectionReturn {
  gestureState: GestureState;
  debugInfo: {
    indexExtended: boolean;
    middleExtended: boolean;
    ringCurled: boolean;
    pinkyCurled: boolean;
    thumbDistance: number;
  } | null;
}

// Helper to calculate distance between two landmarks
function distance(
  a: { x: number; y: number; z: number },
  b: { x: number; y: number; z: number }
): number {
  return Math.sqrt(
    Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2) + Math.pow(a.z - b.z, 2)
  );
}

// Helper to check if a finger is extended
function isFingerExtended(
  landmarks: { x: number; y: number; z: number }[],
  mcpIndex: number,
  pipIndex: number,
  dipIndex: number,
  tipIndex: number
): boolean {
  const mcp = landmarks[mcpIndex];
  const pip = landmarks[pipIndex];
  const dip = landmarks[dipIndex];
  const tip = landmarks[tipIndex];

  // Finger is extended if tip is further from wrist than pip
  // and the finger is roughly straight
  const mcpToPip = distance(mcp, pip);
  const pipToDip = distance(pip, dip);
  const dipToTip = distance(dip, tip);
  const mcpToTip = distance(mcp, tip);

  // Check if finger is straight (total length ~ sum of segments)
  const totalSegments = mcpToPip + pipToDip + dipToTip;
  const straightness = mcpToTip / totalSegments;

  return straightness > 0.85;
}

// Helper to check if a finger is curled
function isFingerCurled(
  landmarks: { x: number; y: number; z: number }[],
  mcpIndex: number,
  tipIndex: number,
  wristIndex: number
): boolean {
  const mcp = landmarks[mcpIndex];
  const tip = landmarks[tipIndex];
  const wrist = landmarks[wristIndex];

  // Finger is curled if tip is close to palm/wrist area
  const tipToWrist = distance(tip, wrist);
  const mcpToWrist = distance(mcp, wrist);

  // If tip is closer to wrist than expected for an extended finger
  return tipToWrist < mcpToWrist * 1.3;
}

export function useGestureDetection(
  handLandmarks: HandLandmarks | null,
  screenDimensions: { width: number; height: number }
): UseGestureDetectionReturn {
  const lastThumbDistanceRef = useRef<number>(0);
  const lastShootTimeRef = useRef<number>(0);
  const smoothedAimRef = useRef<AimPosition | null>(null);
  const lastDetectionTimeRef = useRef<number>(0);
  const [gestureState, setGestureState] = useState<GestureState>({
    isGunShape: false,
    isShooting: false,
    aimPosition: null,
    confidence: 0,
  });
  const [debugInfo, setDebugInfo] = useState<UseGestureDetectionReturn['debugInfo']>(null);

  // Persistence duration in ms - keep showing crosshair briefly after detection drops
  const PERSISTENCE_DURATION = 500;

  const detectGesture = useCallback(() => {
    const now = Date.now();

    if (!handLandmarks || handLandmarks.landmarks.length < 21) {
      // Keep showing last position briefly for smoother experience
      const timeSinceLastDetection = now - lastDetectionTimeRef.current;
      if (smoothedAimRef.current && timeSinceLastDetection < PERSISTENCE_DURATION) {
        setGestureState({
          isGunShape: false,
          isShooting: false,
          aimPosition: smoothedAimRef.current,
          confidence: 0.5,
        });
      } else {
        smoothedAimRef.current = null;
        setGestureState({
          isGunShape: false,
          isShooting: false,
          aimPosition: null,
          confidence: 0,
        });
      }
      setDebugInfo(null);
      return;
    }

    // Update last detection time
    lastDetectionTimeRef.current = now;

    const landmarks = handLandmarks.landmarks;

    // Check if index finger is extended
    const indexExtended = isFingerExtended(
      landmarks,
      HAND_LANDMARKS.INDEX_MCP,
      HAND_LANDMARKS.INDEX_PIP,
      HAND_LANDMARKS.INDEX_DIP,
      HAND_LANDMARKS.INDEX_TIP
    );

    // Check if middle finger is extended
    const middleExtended = isFingerExtended(
      landmarks,
      HAND_LANDMARKS.MIDDLE_MCP,
      HAND_LANDMARKS.MIDDLE_PIP,
      HAND_LANDMARKS.MIDDLE_DIP,
      HAND_LANDMARKS.MIDDLE_TIP
    );

    // Check if ring finger is curled
    const ringCurled = isFingerCurled(
      landmarks,
      HAND_LANDMARKS.RING_MCP,
      HAND_LANDMARKS.RING_TIP,
      HAND_LANDMARKS.WRIST
    );

    // Check if pinky is curled
    const pinkyCurled = isFingerCurled(
      landmarks,
      HAND_LANDMARKS.PINKY_MCP,
      HAND_LANDMARKS.PINKY_TIP,
      HAND_LANDMARKS.WRIST
    );

    // Gun shape = index extended (more lenient - just need pointing finger)
    // Full gun shape for better accuracy: index and middle extended, ring and pinky curled
    const isFullGunShape = indexExtended && middleExtended && ringCurled && pinkyCurled;
    // Lenient: just index finger extended is enough
    const isGunShape = indexExtended || isFullGunShape;

    // Calculate thumb distance for shoot detection
    const thumbTip = landmarks[HAND_LANDMARKS.THUMB_TIP];
    const indexBase = landmarks[HAND_LANDMARKS.INDEX_MCP];
    const currentThumbDistance = distance(thumbTip, indexBase);

    // Detect shooting (thumb moves toward index base quickly)
    const thumbMovement = lastThumbDistanceRef.current - currentThumbDistance;
    const now = Date.now();
    const canShoot = now - lastShootTimeRef.current > GAME_CONFIG.SHOOT_COOLDOWN;
    const isShooting =
      isGunShape &&
      canShoot &&
      thumbMovement > GAME_CONFIG.SHOOT_THRESHOLD &&
      lastThumbDistanceRef.current > 0;

    if (isShooting) {
      lastShootTimeRef.current = now;
    }

    lastThumbDistanceRef.current = currentThumbDistance;

    // Calculate aim position from index finger tip
    // MediaPipe coordinates are normalized (0-1)
    // Mirror X so hand movement matches crosshair movement
    // Show crosshair whenever hand is detected (not just gun shape)
    let aimPosition: AimPosition | null = null;
    if (handLandmarks) {
      const indexTip = landmarks[HAND_LANDMARKS.INDEX_TIP];
      // Mirror X: move hand right -> crosshair moves right
      const rawX = (1 - indexTip.x) * screenDimensions.width;
      const rawY = indexTip.y * screenDimensions.height;

      // Apply smoothing
      if (smoothedAimRef.current) {
        const smoothing = GAME_CONFIG.AIM_SMOOTHING;
        aimPosition = {
          x: smoothedAimRef.current.x + (rawX - smoothedAimRef.current.x) * smoothing,
          y: smoothedAimRef.current.y + (rawY - smoothedAimRef.current.y) * smoothing,
        };
      } else {
        aimPosition = { x: rawX, y: rawY };
      }
      smoothedAimRef.current = aimPosition;
    }

    // Calculate confidence based on how well the gesture matches
    const gestureScore =
      (indexExtended ? 0.25 : 0) +
      (middleExtended ? 0.25 : 0) +
      (ringCurled ? 0.25 : 0) +
      (pinkyCurled ? 0.25 : 0);

    setGestureState({
      isGunShape,
      isShooting,
      aimPosition,
      confidence: gestureScore,
    });

    setDebugInfo({
      indexExtended,
      middleExtended,
      ringCurled,
      pinkyCurled,
      thumbDistance: currentThumbDistance,
    });
  }, [handLandmarks, screenDimensions]);

  useEffect(() => {
    detectGesture();
  }, [detectGesture]);

  return { gestureState, debugInfo };
}
