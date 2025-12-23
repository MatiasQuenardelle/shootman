'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Camera } from './Camera';
import { Crosshair } from './Crosshair';
import { Target } from './Target';
import { useCamera } from '@/hooks/useCamera';
import { useHandTracking } from '@/hooks/useHandTracking';
import { useGestureDetection } from '@/hooks/useGestureDetection';
import { useGameLoop } from '@/hooks/useGameLoop';
import { GameState, Target as TargetType, HitEffect, LevelConfig } from '@/types';
import { createTarget, updateTarget, isTargetOffScreen } from '@/lib/targetManager';
import { findClosestHitTarget } from '@/lib/collision';
import { audioManager } from '@/lib/audio';
import { GAME_CONFIG } from '@/constants/game';

interface GameCanvasProps {
  gameState: GameState;
  levelConfig?: LevelConfig;
  onScoreChange: (score: number) => void;
  onLivesChange: (lives: number) => void;
  onComboChange: (combo: number) => void;
  onWaveChange: (wave: number) => void;
  onGameOver: () => void;
  onTargetsChange: (count: number) => void;
  onTimeChange: (time: number) => void;
  onLevelComplete: () => void;
  onLevelFailed: () => void;
}

export function GameCanvas({
  gameState,
  levelConfig,
  onScoreChange,
  onLivesChange,
  onComboChange,
  onWaveChange,
  onGameOver,
  onTargetsChange,
  onTimeChange,
  onLevelComplete,
  onLevelFailed,
}: GameCanvasProps) {
  const { videoRef, hasPermission, requestPermission, error: cameraError } = useCamera();
  const { handLandmarks, isInitialized, startTracking, stopTracking, error: trackingError } =
    useHandTracking(videoRef.current);

  const [screenDimensions, setScreenDimensions] = useState({ width: 0, height: 0 });
  const { gestureState } = useGestureDetection(handLandmarks, screenDimensions);

  const [targets, setTargets] = useState<TargetType[]>([]);
  const [hitEffects, setHitEffects] = useState<HitEffect[]>([]);
  const lastSpawnTimeRef = useRef<number>(0);
  const gameTimeRef = useRef<number>(0);
  const targetsDestroyedInWaveRef = useRef<number>(0);
  const lastShotProcessedRef = useRef<boolean>(false);
  const levelStartTimeRef = useRef<number>(0);
  const bonusTimeRef = useRef<number>(0); // accumulated bonus time from hits

  // Update screen dimensions
  useEffect(() => {
    const updateDimensions = () => {
      setScreenDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Initialize audio and camera on game start
  useEffect(() => {
    if (gameState.status === 'playing') {
      audioManager.initialize();
      if (!hasPermission) {
        requestPermission();
      }
    }
  }, [gameState.status, hasPermission, requestPermission]);

  // Start/stop tracking based on game status
  useEffect(() => {
    if (gameState.status === 'playing' && isInitialized && hasPermission) {
      startTracking();
    } else {
      stopTracking();
    }
  }, [gameState.status, isInitialized, hasPermission, startTracking, stopTracking]);

  // Handle shooting
  useEffect(() => {
    if (
      gameState.status !== 'playing' ||
      !gestureState.isShooting ||
      !gestureState.aimPosition ||
      lastShotProcessedRef.current
    ) {
      if (!gestureState.isShooting) {
        lastShotProcessedRef.current = false;
      }
      return;
    }

    lastShotProcessedRef.current = true;
    audioManager.play('shoot');

    const hitTarget = findClosestHitTarget(gestureState.aimPosition, targets);

    if (hitTarget) {
      // Hit!
      audioManager.play('hit');
      const newCombo = gameState.combo + 1;
      const comboMultiplier = 1 + (newCombo - 1) * (GAME_CONFIG.COMBO_MULTIPLIER - 1);
      const points = Math.round(hitTarget.points * comboMultiplier);

      onScoreChange(gameState.score + points);
      onComboChange(newCombo);

      if (newCombo > 1) {
        audioManager.play('combo');
      }

      // Add bonus time if level has bonusTimePerHit
      if (levelConfig?.specialRules?.bonusTimePerHit) {
        bonusTimeRef.current += levelConfig.specialRules.bonusTimePerHit;
      }

      // Add hit effect
      setHitEffects((prev) => [
        ...prev,
        {
          id: `hit-${Date.now()}`,
          x: hitTarget.x,
          y: hitTarget.y,
          timestamp: Date.now(),
        },
      ]);

      // Remove hit target
      setTargets((prev) => prev.filter((t) => t.id !== hitTarget.id));
      targetsDestroyedInWaveRef.current += 1;
      onTargetsChange(targetsDestroyedInWaveRef.current);

      // Check wave completion (only in endless mode without level config)
      if (!levelConfig && targetsDestroyedInWaveRef.current >= GAME_CONFIG.WAVE_TARGET_COUNT) {
        targetsDestroyedInWaveRef.current = 0;
        onWaveChange(gameState.wave + 1);
        audioManager.play('levelUp');
      }
    } else {
      // Miss - reset combo
      if (gameState.combo > 0) {
        audioManager.play('miss');
      }
      onComboChange(0);
    }
  }, [
    gestureState.isShooting,
    gestureState.aimPosition,
    targets,
    gameState.status,
    gameState.score,
    gameState.combo,
    gameState.wave,
    onScoreChange,
    onComboChange,
    onWaveChange,
    onTargetsChange,
  ]);

  // Game loop
  const gameLoop = useCallback(
    (deltaTime: number) => {
      if (gameState.status !== 'playing') return;

      gameTimeRef.current += deltaTime;
      const currentTime = gameTimeRef.current;

      // Calculate and update time remaining for level mode
      if (levelConfig) {
        const elapsedSeconds = (Date.now() - levelStartTimeRef.current) / 1000;
        const totalTime = levelConfig.duration + bonusTimeRef.current;
        const remaining = Math.max(0, totalTime - elapsedSeconds);
        onTimeChange(remaining);

        // Check if time ran out
        if (remaining <= 0) {
          if (gameState.score >= levelConfig.passScore) {
            onLevelComplete();
          } else {
            onLevelFailed();
          }
          return;
        }
      }

      // Get spawn settings from level config or defaults
      const spawnInterval = levelConfig?.spawnInterval || GAME_CONFIG.SPAWN_INTERVAL / (1 + gameState.difficulty * 0.2);
      const maxTargets = levelConfig?.maxTargets || GAME_CONFIG.MAX_TARGETS;
      const difficulty = levelConfig?.difficulty ?? gameState.difficulty;

      // Spawn new targets
      if (
        currentTime - lastSpawnTimeRef.current > spawnInterval &&
        targets.length < maxTargets
      ) {
        const newTarget = createTarget(
          screenDimensions.width,
          screenDimensions.height,
          difficulty,
          levelConfig
        );
        setTargets((prev) => [...prev, newTarget]);
        lastSpawnTimeRef.current = currentTime;
      }

      // Calculate speed ramp multiplier if enabled
      let speedMultiplier = 1;
      if (levelConfig?.specialRules?.speedRamp) {
        const elapsedSeconds = (Date.now() - levelStartTimeRef.current) / 1000;
        const progress = elapsedSeconds / levelConfig.duration;
        speedMultiplier = 1 + progress * 1.5; // up to 2.5x speed at end
      }

      // Update targets
      let escapedCount = 0;
      setTargets((prev) => {
        const updated: TargetType[] = [];

        for (const target of prev) {
          // Apply speed ramp to target
          const modifiedTarget = speedMultiplier > 1
            ? { ...target, speed: target.speed * speedMultiplier }
            : target;

          const newTarget = updateTarget(modifiedTarget, deltaTime, currentTime);
          if (isTargetOffScreen(newTarget, screenDimensions.width, screenDimensions.height)) {
            escapedCount += 1;
          } else {
            updated.push({ ...newTarget, speed: target.speed }); // restore original speed for next frame
          }
        }

        return updated;
      });

      // Penalize for escaped targets (unless noLivesLoss is enabled)
      if (escapedCount > 0 && !levelConfig?.specialRules?.noLivesLoss) {
        const newLives = gameState.lives - escapedCount * GAME_CONFIG.MISSED_TARGET_PENALTY;
        if (newLives <= 0) {
          if (levelConfig) {
            onLevelFailed();
          } else {
            onGameOver();
          }
        } else {
          onLivesChange(newLives);
        }
      }

      // Clean up old hit effects
      setHitEffects((prev) =>
        prev.filter((effect) => Date.now() - effect.timestamp < GAME_CONFIG.HIT_EFFECT_DURATION)
      );
    },
    [
      gameState.status,
      gameState.difficulty,
      gameState.lives,
      gameState.score,
      screenDimensions,
      targets.length,
      levelConfig,
      onLivesChange,
      onGameOver,
      onTimeChange,
      onLevelComplete,
      onLevelFailed,
    ]
  );

  const { start: startGameLoop, stop: stopGameLoop } = useGameLoop(gameLoop, 60);

  useEffect(() => {
    if (gameState.status === 'playing') {
      startGameLoop();
    } else {
      stopGameLoop();
    }
  }, [gameState.status, startGameLoop, stopGameLoop]);

  // Reset game state when starting new game/level
  useEffect(() => {
    if (gameState.status === 'playing' && gameState.score === 0) {
      setTargets([]);
      setHitEffects([]);
      targetsDestroyedInWaveRef.current = 0;
      lastSpawnTimeRef.current = 0;
      gameTimeRef.current = 0;
      levelStartTimeRef.current = Date.now();
      bonusTimeRef.current = 0;
    }
  }, [gameState.status, gameState.score]);

  const error = cameraError || trackingError;

  return (
    <div className="fixed inset-0 overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Game background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Stars */}
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(2px 2px at 20px 30px, white, transparent),
                           radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
                           radial-gradient(1px 1px at 90px 40px, white, transparent),
                           radial-gradient(2px 2px at 130px 80px, rgba(255,255,255,0.6), transparent),
                           radial-gradient(1px 1px at 160px 120px, white, transparent)`,
          backgroundSize: '200px 200px'
        }} />
        {/* Grid floor effect */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 opacity-20"
          style={{
            background: 'linear-gradient(to bottom, transparent, rgba(59, 130, 246, 0.3))',
            backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            transform: 'perspective(500px) rotateX(60deg)',
            transformOrigin: 'bottom'
          }}
        />
      </div>

      {/* Hidden camera for hand tracking */}
      <Camera ref={videoRef} className="opacity-0 pointer-events-none" />

      {/* Targets */}
      {targets.map((target) => {
        // Calculate shrink progress if shrinking targets enabled
        const shrinkProgress = levelConfig?.specialRules?.shrinkingTargets
          ? Math.min(1, (Date.now() - target.spawnTime) / 8000) // shrink over 8 seconds
          : 0;

        return (
          <Target
            key={target.id}
            target={target}
            isGhost={levelConfig?.specialRules?.invisibleTargets}
            shrinkProgress={shrinkProgress}
          />
        );
      })}

      {/* Hit effects */}
      {hitEffects.map((effect) => (
        <div
          key={effect.id}
          className="absolute pointer-events-none"
          style={{
            left: effect.x - 25,
            top: effect.y - 25,
            width: 50,
            height: 50,
          }}
        >
          <div className="absolute inset-0 rounded-full bg-yellow-400/50 animate-ping" />
          <div className="absolute inset-2 rounded-full bg-yellow-400/70 animate-pulse" />
        </div>
      ))}

      {/* Crosshair */}
      {gestureState.aimPosition && (
        <Crosshair
          position={gestureState.aimPosition}
          isGunShape={gestureState.isGunShape}
          isShooting={gestureState.isShooting}
        />
      )}

      {/* Error display */}
      {error && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-900/90 text-white p-6 rounded-lg max-w-md text-center">
          <p className="text-lg font-semibold mb-2">Error</p>
          <p>{error}</p>
        </div>
      )}

      {/* Hand not detected indicator */}
      {gameState.status === 'playing' && hasPermission && !gestureState.aimPosition && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full">
          <p className="text-sm">Make a gun gesture with your hand</p>
        </div>
      )}
    </div>
  );
}
