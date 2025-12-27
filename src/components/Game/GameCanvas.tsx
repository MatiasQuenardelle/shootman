'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Camera } from './Camera';
import { Crosshair } from './Crosshair';
import { Target } from './Target';
import { PowerUp as PowerUpComponent } from './PowerUp';
import { useCamera } from '@/hooks/useCamera';
import { useHandTracking } from '@/hooks/useHandTracking';
import { useGestureDetection } from '@/hooks/useGestureDetection';
import { useGameLoop } from '@/hooks/useGameLoop';
import { GameState, Target as TargetType, HitEffect, LevelConfig, PowerUp, ActivePowerUp } from '@/types';
import { createTarget, updateTarget, isTargetOffScreen, createSplitTargets, createBossTarget, getTargetsInExplosionRadius } from '@/lib/targetManager';
import { createPowerUp, isPowerUpExpired, checkPowerUpCollision, activatePowerUp, cleanupExpiredPowerUps, hasPowerUp } from '@/lib/powerUpManager';
import { findClosestHitTarget } from '@/lib/collision';
import { audioManager } from '@/lib/audio';
import { achievementsManager } from '@/lib/achievementsManager';
import { settingsManager } from '@/lib/settingsManager';
import { GAME_CONFIG, POWERUP_CONFIG } from '@/constants/game';

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
  onPowerUpsChange: (powerUps: PowerUp[]) => void;
  onActivePowerUpsChange: (activePowerUps: ActivePowerUp[]) => void;
  onAmmoChange: (ammo: number) => void;
  onReloadChange: (isReloading: boolean, progress: number) => void;
  onScreenShakeChange: (shake: number) => void;
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
  onPowerUpsChange,
  onActivePowerUpsChange,
  onAmmoChange,
  onReloadChange,
  onScreenShakeChange,
}: GameCanvasProps) {
  const { videoRef, hasPermission, requestPermission, error: cameraError } = useCamera();
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const { handLandmarks, isInitialized, startTracking, stopTracking, error: trackingError } =
    useHandTracking(videoElement);

  const [screenDimensions, setScreenDimensions] = useState({ width: 0, height: 0 });
  const { gestureState } = useGestureDetection(handLandmarks, screenDimensions);

  // Sync video element when ref is ready
  useEffect(() => {
    const checkVideoRef = () => {
      if (videoRef.current && !videoElement) {
        setVideoElement(videoRef.current);
      }
    };

    // Check immediately
    checkVideoRef();

    // Also check periodically in case ref updates after permission is granted
    const interval = setInterval(checkVideoRef, 100);
    return () => clearInterval(interval);
  }, [videoRef, videoElement, hasPermission]);

  const [targets, setTargets] = useState<TargetType[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [activePowerUps, setActivePowerUps] = useState<ActivePowerUp[]>([]);
  const [hitEffects, setHitEffects] = useState<HitEffect[]>([]);
  const [ammo, setAmmo] = useState<number>(GAME_CONFIG.MAX_AMMO);
  const [isReloading, setIsReloading] = useState(false);
  const [reloadProgress, setReloadProgress] = useState(0);
  const [screenShake, setScreenShake] = useState(0);
  const [frozenTime, setFrozenTime] = useState(0);

  const lastSpawnTimeRef = useRef<number>(0);
  const lastPowerUpSpawnTimeRef = useRef<number>(0);
  const gameTimeRef = useRef<number>(0);
  const targetsDestroyedInWaveRef = useRef<number>(0);
  const lastShotProcessedRef = useRef<boolean>(false);
  const levelStartTimeRef = useRef<number>(0);
  const bonusTimeRef = useRef<number>(0);
  const reloadStartTimeRef = useRef<number>(0);
  const bossSpawnedRef = useRef<boolean>(false);

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

  // Handle reload gesture (only when limited ammo is enabled)
  useEffect(() => {
    const limitedAmmoEnabled = settingsManager.get('limitedAmmoEnabled');
    if (limitedAmmoEnabled && gestureState.isReloading && !isReloading && ammo < GAME_CONFIG.MAX_AMMO) {
      setIsReloading(true);
      reloadStartTimeRef.current = Date.now();
    }
  }, [gestureState.isReloading, isReloading, ammo]);

  // Reload progress
  useEffect(() => {
    if (isReloading) {
      const interval = setInterval(() => {
        const elapsed = Date.now() - reloadStartTimeRef.current;
        const progress = Math.min(1, elapsed / GAME_CONFIG.RELOAD_TIME);
        setReloadProgress(progress);
        onReloadChange(true, progress);

        if (progress >= 1) {
          setAmmo(GAME_CONFIG.MAX_AMMO);
          setIsReloading(false);
          setReloadProgress(0);
          onReloadChange(false, 0);
          onAmmoChange(GAME_CONFIG.MAX_AMMO);
          audioManager.play('levelUp');
        }
      }, 50);

      return () => clearInterval(interval);
    }
  }, [isReloading, onReloadChange, onAmmoChange]);

  // Handle shooting
  useEffect(() => {
    const limitedAmmoEnabled = settingsManager.get('limitedAmmoEnabled');

    if (
      gameState.status !== 'playing' ||
      !gestureState.isShooting ||
      !gestureState.aimPosition ||
      lastShotProcessedRef.current ||
      isReloading
    ) {
      if (!gestureState.isShooting) {
        lastShotProcessedRef.current = false;
      }
      return;
    }

    // Check ammo (only when limited ammo is enabled)
    if (limitedAmmoEnabled && ammo <= 0) {
      audioManager.play('miss');
      lastShotProcessedRef.current = true;
      return;
    }

    lastShotProcessedRef.current = true;
    audioManager.play('shoot');

    // Decrease ammo (only when limited ammo is enabled)
    if (limitedAmmoEnabled) {
      const newAmmo = ammo - 1;
      setAmmo(newAmmo);
      onAmmoChange(newAmmo);
    }

    // Add screen shake
    setScreenShake(GAME_CONFIG.SCREEN_SHAKE_MAX);
    onScreenShakeChange(GAME_CONFIG.SCREEN_SHAKE_MAX);

    // Check for power-up collection
    const collectedPowerUp = powerUps.find((p) =>
      checkPowerUpCollision(gestureState.aimPosition!.x, gestureState.aimPosition!.y, p)
    );

    if (collectedPowerUp) {
      const active = activatePowerUp(collectedPowerUp);
      setActivePowerUps((prev) => [...prev, active]);
      onActivePowerUpsChange([...activePowerUps, active]);
      setPowerUps((prev) => prev.filter((p) => p.id !== collectedPowerUp.id));
      audioManager.play('levelUp');
      achievementsManager.recordPowerUpCollected();
      return;
    }

    const hitTarget = findClosestHitTarget(gestureState.aimPosition, targets);

    if (hitTarget) {
      // Check if it's a decoy
      if (hitTarget.isDecoy) {
        audioManager.play('miss');
        onScoreChange(Math.max(0, gameState.score + hitTarget.points)); // negative points
        onComboChange(0);
        return;
      }

      // Hit!
      audioManager.play('hit');

      // Reduce health
      const newHealth = hitTarget.health - 1;

      if (newHealth <= 0) {
        // Target destroyed
        const hasDoublePoints = hasPowerUp(activePowerUps, 'doublepoints');
        const newCombo = gameState.combo + 1;
        const comboMultiplier = 1 + (newCombo - 1) * (GAME_CONFIG.COMBO_MULTIPLIER - 1);
        const points = Math.round(hitTarget.points * comboMultiplier * (hasDoublePoints ? 2 : 1));

        onScoreChange(gameState.score + points);
        onComboChange(newCombo);

        if (newCombo > 1) {
          audioManager.play('combo');
        }

        // Bonus time if level has bonusTimePerHit
        if (levelConfig?.specialRules?.bonusTimePerHit) {
          bonusTimeRef.current += levelConfig.specialRules.bonusTimePerHit;
        }

        // Handle special target effects
        let effectType: 'normal' | 'explosive' | 'critical' | 'split' = 'normal';

        // Explosive target
        if (hitTarget.explosionRadius) {
          effectType = 'explosive';
          setScreenShake(GAME_CONFIG.SCREEN_SHAKE_MAX * 2);
          const nearbyTargets = getTargetsInExplosionRadius(
            hitTarget.x,
            hitTarget.y,
            hitTarget.explosionRadius,
            targets.filter((t) => t.id !== hitTarget.id)
          );
          nearbyTargets.forEach((t) => {
            if (!t.isDecoy) {
              onScoreChange(gameState.score + t.points);
            }
          });
          setTargets((prev) =>
            prev.filter((t) => t.id !== hitTarget.id && !nearbyTargets.some((nt) => nt.id === t.id))
          );
        }

        // Split target
        if (hitTarget.splitOnDestroy) {
          effectType = 'split';
          const splitTargets = createSplitTargets(hitTarget);
          setTargets((prev) => [...prev.filter((t) => t.id !== hitTarget.id), ...splitTargets]);
        } else if (!hitTarget.explosionRadius) {
          setTargets((prev) => prev.filter((t) => t.id !== hitTarget.id));
        }

        // Time freeze target
        if (hitTarget.freezeOnHit) {
          setFrozenTime(Date.now() + 3000);
        }

        // Boss defeated
        if (hitTarget.isBoss) {
          achievementsManager.recordBossDefeated();
          audioManager.play('levelUp');
        }

        // Add hit effect
        setHitEffects((prev) => [
          ...prev,
          {
            id: `hit-${Date.now()}`,
            x: hitTarget.x,
            y: hitTarget.y,
            timestamp: Date.now(),
            type: effectType,
          },
        ]);

        targetsDestroyedInWaveRef.current += 1;
        onTargetsChange(targetsDestroyedInWaveRef.current);

        // Check wave completion (only in endless mode)
        if (!levelConfig && targetsDestroyedInWaveRef.current >= GAME_CONFIG.WAVE_TARGET_COUNT) {
          targetsDestroyedInWaveRef.current = 0;
          onWaveChange(gameState.wave + 1);
          audioManager.play('levelUp');
        }
      } else {
        // Target damaged but not destroyed
        setTargets((prev) =>
          prev.map((t) => (t.id === hitTarget.id ? { ...t, health: newHealth, shieldActive: false } : t))
        );
      }
    } else {
      // Miss
      if (gameState.combo > 0) {
        audioManager.play('miss');
      }
      // Check for shield power-up
      if (!hasPowerUp(activePowerUps, 'shield')) {
        onComboChange(0);
      }
    }
  }, [
    gestureState.isShooting,
    gestureState.aimPosition,
    targets,
    powerUps,
    activePowerUps,
    ammo,
    isReloading,
    gameState.status,
    gameState.score,
    gameState.combo,
    gameState.wave,
    levelConfig,
    onScoreChange,
    onComboChange,
    onWaveChange,
    onTargetsChange,
    onAmmoChange,
    onActivePowerUpsChange,
    onScreenShakeChange,
  ]);

  // Game loop
  const gameLoop = useCallback(
    (deltaTime: number) => {
      if (gameState.status !== 'playing') return;

      // Apply slow-mo
      const hasSlowMo = hasPowerUp(activePowerUps, 'slowmo');
      const timeScale = hasSlowMo ? GAME_CONFIG.SLOWMO_SCALE : 1;
      const scaledDelta = deltaTime * timeScale;

      // Check if time is frozen
      const isFrozen = Date.now() < frozenTime;
      if (isFrozen) return;

      gameTimeRef.current += scaledDelta;
      const currentTime = gameTimeRef.current;

      // Decay screen shake
      if (screenShake > 0) {
        const newShake = screenShake * GAME_CONFIG.SCREEN_SHAKE_DECAY;
        setScreenShake(newShake < 0.5 ? 0 : newShake);
        onScreenShakeChange(newShake < 0.5 ? 0 : newShake);
      }

      // Calculate time remaining for level mode
      if (levelConfig) {
        const elapsedSeconds = (Date.now() - levelStartTimeRef.current) / 1000;
        const totalTime = levelConfig.duration + bonusTimeRef.current;
        const remaining = Math.max(0, totalTime - elapsedSeconds);
        onTimeChange(remaining);

        if (remaining <= 0) {
          if (gameState.score >= levelConfig.passScore) {
            onLevelComplete();
          } else {
            onLevelFailed();
          }
          return;
        }

        // Spawn boss near the end
        if (levelConfig.specialRules?.hasBoss && !bossSpawnedRef.current && remaining < 20) {
          const boss = createBossTarget(screenDimensions.width, screenDimensions.height);
          setTargets((prev) => [...prev, boss]);
          bossSpawnedRef.current = true;
        }
      }

      // Spawn settings
      const spawnInterval = levelConfig?.spawnInterval || GAME_CONFIG.SPAWN_INTERVAL / (1 + gameState.difficulty * 0.2);
      const maxTargets = levelConfig?.maxTargets || GAME_CONFIG.MAX_TARGETS;
      const difficulty = levelConfig?.difficulty ?? gameState.difficulty;

      // Spawn new targets
      if (currentTime - lastSpawnTimeRef.current > spawnInterval && targets.length < maxTargets) {
        const newTarget = createTarget(screenDimensions.width, screenDimensions.height, difficulty, levelConfig);
        setTargets((prev) => [...prev, newTarget]);
        lastSpawnTimeRef.current = currentTime;
      }

      // Spawn power-ups
      const powerUpInterval = levelConfig?.specialRules?.powerUpFrequency || GAME_CONFIG.POWERUP_SPAWN_INTERVAL;
      if (currentTime - lastPowerUpSpawnTimeRef.current > powerUpInterval && powerUps.length < 2) {
        const newPowerUp = createPowerUp(screenDimensions.width, screenDimensions.height);
        setPowerUps((prev) => [...prev, newPowerUp]);
        onPowerUpsChange([...powerUps, newPowerUp]);
        lastPowerUpSpawnTimeRef.current = currentTime;
      }

      // Speed ramp multiplier
      let speedMultiplier = 1;
      if (levelConfig?.specialRules?.speedRamp) {
        const elapsedSeconds = (Date.now() - levelStartTimeRef.current) / 1000;
        const progress = elapsedSeconds / levelConfig.duration;
        speedMultiplier = 1 + progress * 1.5;
      }

      // Check for magnet power-up
      const hasMagnet = hasPowerUp(activePowerUps, 'magnet');
      const magnetPosition = hasMagnet && gestureState.aimPosition ? gestureState.aimPosition : undefined;

      // Update targets
      let escapedCount = 0;
      setTargets((prev) => {
        const updated: TargetType[] = [];

        for (const target of prev) {
          const modifiedTarget = speedMultiplier > 1 ? { ...target, speed: target.speed * speedMultiplier } : target;
          const newTarget = updateTarget(modifiedTarget, scaledDelta, currentTime, hasMagnet, magnetPosition);

          if (isTargetOffScreen(newTarget, screenDimensions.width, screenDimensions.height)) {
            escapedCount += 1;
          } else {
            updated.push({ ...newTarget, speed: target.speed });
          }
        }

        return updated;
      });

      // Penalize for escaped targets
      if (escapedCount > 0 && !levelConfig?.specialRules?.noLivesLoss) {
        // Check for shield power-up
        if (hasPowerUp(activePowerUps, 'shield')) {
          // Remove shield power-up
          setActivePowerUps((prev) => prev.filter((p) => p.type !== 'shield'));
        } else {
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
      }

      // Clean up expired power-ups
      setPowerUps((prev) => prev.filter((p) => !isPowerUpExpired(p)));
      const cleanedActivePowerUps = cleanupExpiredPowerUps(activePowerUps);
      if (cleanedActivePowerUps.length !== activePowerUps.length) {
        setActivePowerUps(cleanedActivePowerUps);
        onActivePowerUpsChange(cleanedActivePowerUps);
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
      gameState.wave,
      screenDimensions,
      targets.length,
      powerUps,
      activePowerUps,
      levelConfig,
      screenShake,
      frozenTime,
      gestureState.aimPosition,
      onLivesChange,
      onGameOver,
      onTimeChange,
      onLevelComplete,
      onLevelFailed,
      onPowerUpsChange,
      onActivePowerUpsChange,
      onScreenShakeChange,
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
      setPowerUps([]);
      setActivePowerUps([]);
      setHitEffects([]);
      setAmmo(GAME_CONFIG.MAX_AMMO);
      setIsReloading(false);
      setReloadProgress(0);
      setScreenShake(0);
      setFrozenTime(0);
      targetsDestroyedInWaveRef.current = 0;
      lastSpawnTimeRef.current = 0;
      lastPowerUpSpawnTimeRef.current = 0;
      gameTimeRef.current = 0;
      levelStartTimeRef.current = Date.now();
      bonusTimeRef.current = 0;
      bossSpawnedRef.current = false;
    }
  }, [gameState.status, gameState.score]);

  const error = cameraError || trackingError;

  // Calculate screen shake offset
  const shakeX = screenShake > 0 ? (Math.random() - 0.5) * screenShake : 0;
  const shakeY = screenShake > 0 ? (Math.random() - 0.5) * screenShake : 0;

  return (
    <div
      className="fixed inset-0 overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900"
      style={{ transform: `translate(${shakeX}px, ${shakeY}px)` }}
    >
      {/* Game background */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(2px 2px at 20px 30px, white, transparent),
                             radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
                             radial-gradient(1px 1px at 90px 40px, white, transparent),
                             radial-gradient(2px 2px at 130px 80px, rgba(255,255,255,0.6), transparent),
                             radial-gradient(1px 1px at 160px 120px, white, transparent)`,
            backgroundSize: '200px 200px',
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-1/3 opacity-20"
          style={{
            background: 'linear-gradient(to bottom, transparent, rgba(59, 130, 246, 0.3))',
            backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            transform: 'perspective(500px) rotateX(60deg)',
            transformOrigin: 'bottom',
          }}
        />
      </div>

      {/* Slow-mo overlay */}
      {hasPowerUp(activePowerUps, 'slowmo') && (
        <div className="absolute inset-0 bg-purple-900/20 pointer-events-none" />
      )}

      {/* Time freeze overlay */}
      {Date.now() < frozenTime && (
        <div className="absolute inset-0 bg-cyan-500/30 pointer-events-none animate-pulse" />
      )}

      {/* Hidden camera for hand tracking */}
      <Camera ref={videoRef} className="opacity-0 pointer-events-none" />

      {/* Targets */}
      {targets.map((target) => {
        const shrinkProgress = levelConfig?.specialRules?.shrinkingTargets
          ? Math.min(1, (Date.now() - target.spawnTime) / 8000)
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

      {/* Power-ups */}
      {powerUps.map((powerUp) => (
        <PowerUpComponent key={powerUp.id} powerUp={powerUp} />
      ))}

      {/* Hit effects */}
      {hitEffects.map((effect) => (
        <div
          key={effect.id}
          className="absolute pointer-events-none"
          style={{
            left: effect.x - 25,
            top: effect.y - 25,
            width: effect.type === 'explosive' ? 100 : 50,
            height: effect.type === 'explosive' ? 100 : 50,
          }}
        >
          <div
            className={`absolute inset-0 rounded-full animate-ping ${
              effect.type === 'explosive' ? 'bg-orange-400/50' : 'bg-yellow-400/50'
            }`}
          />
          <div
            className={`absolute inset-2 rounded-full animate-pulse ${
              effect.type === 'explosive' ? 'bg-orange-400/70' : 'bg-yellow-400/70'
            }`}
          />
        </div>
      ))}

      {/* Crosshair */}
      {gestureState.aimPosition && (
        <Crosshair
          position={gestureState.aimPosition}
          isGunShape={gestureState.isGunShape}
          isShooting={gestureState.isShooting}
          isReloading={settingsManager.get('limitedAmmoEnabled') ? isReloading : false}
          reloadProgress={settingsManager.get('limitedAmmoEnabled') ? reloadProgress : 0}
          ammo={settingsManager.get('limitedAmmoEnabled') ? ammo : undefined}
          maxAmmo={settingsManager.get('limitedAmmoEnabled') ? GAME_CONFIG.MAX_AMMO : undefined}
        />
      )}

      {/* Active power-ups display */}
      {activePowerUps.length > 0 && (
        <div className="absolute top-20 right-4 flex flex-col gap-2">
          {activePowerUps.map((ap, i) => {
            const remaining = Math.max(0, ap.endTime - Date.now());
            const config = POWERUP_CONFIG[ap.type];
            return (
              <div
                key={`${ap.type}-${i}`}
                className="flex items-center gap-2 bg-black/50 rounded-lg px-3 py-1"
              >
                <span>{config.icon}</span>
                <span className="text-white text-sm">{Math.ceil(remaining / 1000)}s</span>
              </div>
            );
          })}
        </div>
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
          <p className="text-sm">Forma una pistola con tu mano</p>
        </div>
      )}

      {/* Reload hint (only when limited ammo is enabled) */}
      {settingsManager.get('limitedAmmoEnabled') && ammo === 0 && !isReloading && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 bg-red-500/80 text-white px-4 py-2 rounded-full animate-pulse">
          <p className="text-sm">Cierra el puño para recargar</p>
        </div>
      )}
    </div>
  );
}
