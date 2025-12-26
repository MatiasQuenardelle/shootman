'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { HandLandmarks, GestureState, AimPosition } from '@/types';
import { HAND_LANDMARKS, GAME_CONFIG } from '@/constants/game';
import { settingsManager } from '@/lib/settingsManager';

interface UseGestureDetectionReturn {
  gestureState: GestureState;
  debugInfo: {
    indexExtended: boolean;
    middleExtended: boolean;
    ringCurled: boolean;
    pinkyCurled: boolean;
    thumbDistance: number;
    isFist: boolean;
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

  const mcpToPip = distance(mcp, pip);
  const pipToDip = distance(pip, dip);
  const dipToTip = distance(dip, tip);
  const mcpToTip = distance(mcp, tip);

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

  const tipToWrist = distance(tip, wrist);
  const mcpToWrist = distance(mcp, wrist);

  return tipToWrist < mcpToWrist * 1.3;
}

// Check if all fingers are curled (fist gesture for reload)
function isFistGesture(landmarks: { x: number; y: number; z: number }[]): boolean {
  const indexCurled = isFingerCurled(landmarks, HAND_LANDMARKS.INDEX_MCP, HAND_LANDMARKS.INDEX_TIP, HAND_LANDMARKS.WRIST);
  const middleCurled = isFingerCurled(landmarks, HAND_LANDMARKS.MIDDLE_MCP, HAND_LANDMARKS.MIDDLE_TIP, HAND_LANDMARKS.WRIST);
  const ringCurled = isFingerCurled(landmarks, HAND_LANDMARKS.RING_MCP, HAND_LANDMARKS.RING_TIP, HAND_LANDMARKS.WRIST);
  const pinkyCurled = isFingerCurled(landmarks, HAND_LANDMARKS.PINKY_MCP, HAND_LANDMARKS.PINKY_TIP, HAND_LANDMARKS.WRIST);

  // Also check thumb is curled
  const thumbTip = landmarks[HAND_LANDMARKS.THUMB_TIP];
  const indexMCP = landmarks[HAND_LANDMARKS.INDEX_MCP];
  const thumbToIndex = distance(thumbTip, indexMCP);
  const thumbCurled = thumbToIndex < 0.1;

  return indexCurled && middleCurled && ringCurled && pinkyCurled && thumbCurled;
}

export function useGestureDetection(
  handLandmarks: HandLandmarks | null,
  screenDimensions: { width: number; height: number },
  playerId?: 1 | 2
): UseGestureDetectionReturn {
  const lastThumbDistanceRef = useRef<number>(0);
  const lastShootTimeRef = useRef<number>(0);
  const smoothedAimRef = useRef<AimPosition | null>(null);
  const lastDetectionTimeRef = useRef<number>(0);
  const frozenAimRef = useRef<AimPosition | null>(null);
  const aimFreezeStartRef = useRef<number>(0);
  const fistStartTimeRef = useRef<number>(0);
  const [gestureState, setGestureState] = useState<GestureState>({
    isGunShape: false,
    isShooting: false,
    isReloading: false,
    isFist: false,
    aimPosition: null,
    confidence: 0,
  });
  const [debugInfo, setDebugInfo] = useState<UseGestureDetectionReturn['debugInfo']>(null);

  const PERSISTENCE_DURATION = 500;
  const RELOAD_HOLD_TIME = 500; // Hold fist for 500ms to reload

  const detectGesture = useCallback(() => {
    const now = Date.now();
    const settings = settingsManager.getAll();
    const sensitivity = settings.sensitivity;
    const leftHandMode = settings.leftHandMode;

    if (!handLandmarks || handLandmarks.landmarks.length < 21) {
      const timeSinceLastDetection = now - lastDetectionTimeRef.current;
      if (smoothedAimRef.current && timeSinceLastDetection < PERSISTENCE_DURATION) {
        setGestureState({
          isGunShape: false,
          isShooting: false,
          isReloading: false,
          isFist: false,
          aimPosition: smoothedAimRef.current,
          confidence: 0.5,
        });
      } else {
        smoothedAimRef.current = null;
        fistStartTimeRef.current = 0;
        setGestureState({
          isGunShape: false,
          isShooting: false,
          isReloading: false,
          isFist: false,
          aimPosition: null,
          confidence: 0,
        });
      }
      setDebugInfo(null);
      return;
    }

    lastDetectionTimeRef.current = now;
    const landmarks = handLandmarks.landmarks;

    // Check for fist gesture (reload)
    const isFist = isFistGesture(landmarks);
    let isReloading = false;

    if (isFist) {
      if (fistStartTimeRef.current === 0) {
        fistStartTimeRef.current = now;
      } else if (now - fistStartTimeRef.current >= RELOAD_HOLD_TIME) {
        isReloading = true;
      }
    } else {
      fistStartTimeRef.current = 0;
    }

    // Check finger states
    const indexExtended = isFingerExtended(
      landmarks,
      HAND_LANDMARKS.INDEX_MCP,
      HAND_LANDMARKS.INDEX_PIP,
      HAND_LANDMARKS.INDEX_DIP,
      HAND_LANDMARKS.INDEX_TIP
    );

    const middleExtended = isFingerExtended(
      landmarks,
      HAND_LANDMARKS.MIDDLE_MCP,
      HAND_LANDMARKS.MIDDLE_PIP,
      HAND_LANDMARKS.MIDDLE_DIP,
      HAND_LANDMARKS.MIDDLE_TIP
    );

    const ringCurled = isFingerCurled(
      landmarks,
      HAND_LANDMARKS.RING_MCP,
      HAND_LANDMARKS.RING_TIP,
      HAND_LANDMARKS.WRIST
    );

    const pinkyCurled = isFingerCurled(
      landmarks,
      HAND_LANDMARKS.PINKY_MCP,
      HAND_LANDMARKS.PINKY_TIP,
      HAND_LANDMARKS.WRIST
    );

    const isFullGunShape = indexExtended && middleExtended && ringCurled && pinkyCurled;
    const isGunShape = (indexExtended || isFullGunShape) && !isFist;

    // Calculate thumb distance for shoot detection
    const thumbTip = landmarks[HAND_LANDMARKS.THUMB_TIP];
    const indexBase = landmarks[HAND_LANDMARKS.INDEX_MCP];
    const indexPIP = landmarks[HAND_LANDMARKS.INDEX_PIP];

    const thumbToIndexBase = distance(thumbTip, indexBase);
    const thumbToIndexPIP = distance(thumbTip, indexPIP);
    const currentThumbDistance = Math.min(thumbToIndexBase, thumbToIndexPIP);

    // Detect shooting
    const thumbMovement = lastThumbDistanceRef.current - currentThumbDistance;
    const canShoot = now - lastShootTimeRef.current > GAME_CONFIG.SHOOT_COOLDOWN;

    const movementTrigger = thumbMovement > GAME_CONFIG.SHOOT_THRESHOLD && lastThumbDistanceRef.current > 0;
    const absoluteTrigger = currentThumbDistance < GAME_CONFIG.SHOOT_THRESHOLD_ABSOLUTE && lastThumbDistanceRef.current >= GAME_CONFIG.SHOOT_THRESHOLD_ABSOLUTE;

    const isShooting = isGunShape && canShoot && (movementTrigger || absoluteTrigger) && !isReloading;

    if (isShooting) {
      lastShootTimeRef.current = now;
    }

    // Aim freeze during shooting
    const isThumbMovingToShoot = thumbMovement > GAME_CONFIG.AIM_FREEZE_THRESHOLD && lastThumbDistanceRef.current > 0;
    const timeSinceShot = now - lastShootTimeRef.current;
    const shouldFreezeAim = isThumbMovingToShoot || timeSinceShot < GAME_CONFIG.AIM_FREEZE_DURATION;

    if (shouldFreezeAim && !frozenAimRef.current && smoothedAimRef.current) {
      frozenAimRef.current = { ...smoothedAimRef.current };
      aimFreezeStartRef.current = now;
    } else if (!shouldFreezeAim && frozenAimRef.current) {
      frozenAimRef.current = null;
    }

    lastThumbDistanceRef.current = currentThumbDistance;

    // Calculate aim position
    let aimPosition: AimPosition | null = null;
    if (handLandmarks) {
      if (frozenAimRef.current) {
        aimPosition = frozenAimRef.current;
        const indexTip = landmarks[HAND_LANDMARKS.INDEX_TIP];
        const indexMCP = landmarks[HAND_LANDMARKS.INDEX_MCP];
        const stableX = indexTip.x * 0.85 + indexMCP.x * 0.15;
        const stableY = indexTip.y * 0.85 + indexMCP.y * 0.15;
        const appliedSensitivity = GAME_CONFIG.AIM_SENSITIVITY * sensitivity;
        const centerX = 0.5;
        const centerY = 0.5;

        // Apply left-hand mode (no mirror)
        let adjustedX: number;
        if (leftHandMode) {
          adjustedX = centerX + (stableX - centerX) * appliedSensitivity;
        } else {
          adjustedX = centerX + (centerX - stableX) * appliedSensitivity;
        }
        const adjustedY = centerY + (stableY - centerY) * appliedSensitivity;

        const rawX = Math.max(0, Math.min(screenDimensions.width, adjustedX * screenDimensions.width));
        const rawY = Math.max(0, Math.min(screenDimensions.height, adjustedY * screenDimensions.height));
        smoothedAimRef.current = {
          x: smoothedAimRef.current!.x + (rawX - smoothedAimRef.current!.x) * 0.1,
          y: smoothedAimRef.current!.y + (rawY - smoothedAimRef.current!.y) * 0.1,
        };
      } else {
        const indexTip = landmarks[HAND_LANDMARKS.INDEX_TIP];
        const indexMCP = landmarks[HAND_LANDMARKS.INDEX_MCP];
        const stableX = indexTip.x * 0.85 + indexMCP.x * 0.15;
        const stableY = indexTip.y * 0.85 + indexMCP.y * 0.15;

        const appliedSensitivity = GAME_CONFIG.AIM_SENSITIVITY * sensitivity;
        const centerX = 0.5;
        const centerY = 0.5;

        // Apply left-hand mode
        let adjustedX: number;
        if (leftHandMode) {
          adjustedX = centerX + (stableX - centerX) * appliedSensitivity;
        } else {
          adjustedX = centerX + (centerX - stableX) * appliedSensitivity;
        }
        const adjustedY = centerY + (stableY - centerY) * appliedSensitivity;

        const rawX = Math.max(0, Math.min(screenDimensions.width, adjustedX * screenDimensions.width));
        const rawY = Math.max(0, Math.min(screenDimensions.height, adjustedY * screenDimensions.height));

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

    const gestureScore =
      (indexExtended ? 0.25 : 0) +
      (middleExtended ? 0.25 : 0) +
      (ringCurled ? 0.25 : 0) +
      (pinkyCurled ? 0.25 : 0);

    setGestureState({
      isGunShape,
      isShooting,
      isReloading,
      isFist,
      aimPosition,
      confidence: gestureScore,
    });

    setDebugInfo({
      indexExtended,
      middleExtended,
      ringCurled,
      pinkyCurled,
      thumbDistance: currentThumbDistance,
      isFist,
    });
  }, [handLandmarks, screenDimensions, playerId]);

  useEffect(() => {
    detectGesture();
  }, [detectGesture]);

  return { gestureState, debugInfo };
}
