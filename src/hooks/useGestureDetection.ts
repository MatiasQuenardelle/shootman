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
  const frozenAimRef = useRef<AimPosition | null>(null);
  const aimFreezeStartRef = useRef<number>(0);
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
    // Use multiple reference points for more reliable detection
    const thumbTip = landmarks[HAND_LANDMARKS.THUMB_TIP];
    const thumbIP = landmarks[HAND_LANDMARKS.THUMB_IP];
    const indexBase = landmarks[HAND_LANDMARKS.INDEX_MCP];
    const indexPIP = landmarks[HAND_LANDMARKS.INDEX_PIP];

    // Primary: thumb tip to index base
    const thumbToIndexBase = distance(thumbTip, indexBase);
    // Secondary: thumb tip to index PIP (middle of index finger)
    const thumbToIndexPIP = distance(thumbTip, indexPIP);
    // Use the minimum distance for better detection
    const currentThumbDistance = Math.min(thumbToIndexBase, thumbToIndexPIP);

    // Detect shooting (thumb moves toward index finger)
    const thumbMovement = lastThumbDistanceRef.current - currentThumbDistance;
    const canShoot = now - lastShootTimeRef.current > GAME_CONFIG.SHOOT_COOLDOWN;

    // Two shooting triggers for better sensitivity in low light:
    // 1. Movement-based: thumb moving toward index finger (original method)
    const movementTrigger = thumbMovement > GAME_CONFIG.SHOOT_THRESHOLD && lastThumbDistanceRef.current > 0;
    // 2. Absolute position: thumb is very close to index finger (works even with jittery tracking)
    const absoluteTrigger = currentThumbDistance < GAME_CONFIG.SHOOT_THRESHOLD_ABSOLUTE && lastThumbDistanceRef.current >= GAME_CONFIG.SHOOT_THRESHOLD_ABSOLUTE;

    const isShooting = isGunShape && canShoot && (movementTrigger || absoluteTrigger);

    if (isShooting) {
      lastShootTimeRef.current = now;
    }

    // Freeze aim when thumb starts moving toward index (prevents aim drift while shooting)
    const isThumbMovingToShoot = thumbMovement > GAME_CONFIG.AIM_FREEZE_THRESHOLD && lastThumbDistanceRef.current > 0;
    const timeSinceShot = now - lastShootTimeRef.current;
    const shouldFreezeAim = isThumbMovingToShoot || timeSinceShot < GAME_CONFIG.AIM_FREEZE_DURATION;

    if (shouldFreezeAim && !frozenAimRef.current && smoothedAimRef.current) {
      // Start freezing: capture current aim position
      frozenAimRef.current = { ...smoothedAimRef.current };
      aimFreezeStartRef.current = now;
    } else if (!shouldFreezeAim && frozenAimRef.current) {
      // Stop freezing: release frozen aim
      frozenAimRef.current = null;
    }

    lastThumbDistanceRef.current = currentThumbDistance;

    // Calculate aim position from index fingertip for precise aiming
    // MediaPipe coordinates are normalized (0-1)
    // Mirror X so hand movement matches crosshair movement
    // Show crosshair whenever hand is detected (not just gun shape)
    let aimPosition: AimPosition | null = null;
    if (handLandmarks) {
      // If aim is frozen (during shooting motion), use frozen position
      if (frozenAimRef.current) {
        aimPosition = frozenAimRef.current;
        // Still update smoothedAimRef in background so transition is smooth when unfreezing
        const indexTip = landmarks[HAND_LANDMARKS.INDEX_TIP];
        const indexMCP = landmarks[HAND_LANDMARKS.INDEX_MCP];
        const stableX = indexTip.x * 0.85 + indexMCP.x * 0.15;
        const stableY = indexTip.y * 0.85 + indexMCP.y * 0.15;
        const sensitivity = GAME_CONFIG.AIM_SENSITIVITY;
        const centerX = 0.5;
        const centerY = 0.5;
        const adjustedX = centerX + (centerX - stableX) * sensitivity;
        const adjustedY = centerY + (stableY - centerY) * sensitivity;
        const rawX = Math.max(0, Math.min(screenDimensions.width, adjustedX * screenDimensions.width));
        const rawY = Math.max(0, Math.min(screenDimensions.height, adjustedY * screenDimensions.height));
        // Use very light smoothing in background to prepare for unfreeze
        smoothedAimRef.current = {
          x: smoothedAimRef.current!.x + (rawX - smoothedAimRef.current!.x) * 0.1,
          y: smoothedAimRef.current!.y + (rawY - smoothedAimRef.current!.y) * 0.1,
        };
      } else {
        // Normal aim calculation
        // Use index fingertip as primary reference for precise finger-based aiming
        const indexTip = landmarks[HAND_LANDMARKS.INDEX_TIP];
        // Blend with index MCP (knuckle) for slight stability
        const indexMCP = landmarks[HAND_LANDMARKS.INDEX_MCP];
        const stableX = indexTip.x * 0.85 + indexMCP.x * 0.15;
        const stableY = indexTip.y * 0.85 + indexMCP.y * 0.15;

        const sensitivity = GAME_CONFIG.AIM_SENSITIVITY;
        const centerX = 0.5;
        const centerY = 0.5;

        // Apply sensitivity multiplier around center point
        // Mirror X: move hand right -> crosshair moves right
        const adjustedX = centerX + (centerX - stableX) * sensitivity;
        const adjustedY = centerY + (stableY - centerY) * sensitivity;

        // Convert to screen coordinates and clamp to screen bounds
        const rawX = Math.max(0, Math.min(screenDimensions.width, adjustedX * screenDimensions.width));
        const rawY = Math.max(0, Math.min(screenDimensions.height, adjustedY * screenDimensions.height));

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
