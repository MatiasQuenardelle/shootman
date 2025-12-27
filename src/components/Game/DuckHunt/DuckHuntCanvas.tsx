'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Camera } from '../Camera';
import { DuckHuntBackground } from './DuckHuntBackground';
import { DuckSprite } from './DuckSprite';
import { DuckHuntHUD } from './DuckHuntHUD';
import { useCamera } from '@/hooks/useCamera';
import { useHandTracking } from '@/hooks/useHandTracking';
import { useGestureDetection } from '@/hooks/useGestureDetection';
import { useGameLoop } from '@/hooks/useGameLoop';
import { Duck, DuckHuntState } from '@/types';
import { DUCK_HUNT_CONFIG, GAME_CONFIG } from '@/constants/game';
import { duckHuntAudio } from '@/lib/duckHuntAudio';

interface DuckHuntCanvasProps {
  onScoreChange: (score: number) => void;
  onGameOver: (finalScore: number) => void;
  isPlaying: boolean;
}

// Create a new duck
function createDuck(screenWidth: number, screenHeight: number, round: number): Duck {
  const colors: ('black' | 'blue' | 'red')[] = ['black', 'black', 'black', 'blue', 'red'];
  const color = colors[Math.floor(Math.random() * colors.length)];

  const speed = DUCK_HUNT_CONFIG.DUCK_BASE_SPEED + (round - 1) * DUCK_HUNT_CONFIG.DUCK_SPEED_INCREASE_PER_ROUND;

  // Start from bottom of play area (above grass)
  const playAreaHeight = screenHeight * 0.75 - 96; // 75% minus HUD height
  const startY = playAreaHeight;
  const startX = Math.random() * (screenWidth - 100) + 50;

  // Random upward angle
  const angle = -Math.PI / 2 + (Math.random() - 0.5) * (Math.PI / 3);

  return {
    id: `duck-${Date.now()}-${Math.random()}`,
    x: startX,
    y: startY,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    state: 'flying',
    color,
    animationFrame: 0,
    points: color === 'red' ? DUCK_HUNT_CONFIG.POINTS_SPECIAL :
            color === 'blue' ? DUCK_HUNT_CONFIG.POINTS_BONUS :
            DUCK_HUNT_CONFIG.POINTS_STANDARD,
    spawnTime: Date.now(),
  };
}

export function DuckHuntCanvas({ onScoreChange, onGameOver, isPlaying }: DuckHuntCanvasProps) {
  const { videoRef, hasPermission, requestPermission, error: cameraError } = useCamera();
  const { handLandmarks, isInitialized, startTracking, stopTracking, error: trackingError } =
    useHandTracking(videoRef.current);

  const [screenDimensions, setScreenDimensions] = useState({ width: 0, height: 0 });
  const [isPortrait, setIsPortrait] = useState(false);
  const { gestureState } = useGestureDetection(handLandmarks, screenDimensions);

  const [ducks, setDucks] = useState<Duck[]>([]);
  const [score, setScore] = useState(0);
  const [duckHuntState, setDuckHuntState] = useState<DuckHuntState>({
    round: 1,
    shotsRemaining: DUCK_HUNT_CONFIG.SHOTS_PER_ROUND,
    ducksHit: 0,
    ducksInRound: 0,
    ducksShotThisRound: Array(DUCK_HUNT_CONFIG.DUCKS_PER_ROUND).fill(false),
    roundPhase: 'playing',
    flyAwayTimer: null,
  });

  const lastShotProcessedRef = useRef<boolean>(false);
  const lastDirectionChangeRef = useRef<number>(0);
  const currentDuckIndexRef = useRef<number>(0);
  const duckSpawnedRef = useRef<boolean>(false);

  // Update screen dimensions and check orientation
  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setScreenDimensions({ width, height });
      // Check if mobile and in portrait mode
      const isMobile = width <= 768;
      setIsPortrait(isMobile && height > width);
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    window.addEventListener('orientationchange', updateDimensions);
    return () => {
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('orientationchange', updateDimensions);
    };
  }, []);

  // Initialize camera and tracking
  useEffect(() => {
    if (isPlaying) {
      duckHuntAudio.initialize();
      if (!hasPermission) {
        requestPermission();
      }
    }
  }, [isPlaying, hasPermission, requestPermission]);

  // Start/stop tracking based on game status
  useEffect(() => {
    if (isPlaying && isInitialized && hasPermission) {
      startTracking();
      duckHuntAudio.playMusic();
    } else {
      stopTracking();
      duckHuntAudio.stopMusic();
    }
    return () => {
      duckHuntAudio.stopMusic();
    };
  }, [isPlaying, isInitialized, hasPermission, startTracking, stopTracking]);

  // Reset game state when starting
  useEffect(() => {
    if (isPlaying) {
      setDucks([]);
      setScore(0);
      setDuckHuntState({
        round: 1,
        shotsRemaining: DUCK_HUNT_CONFIG.SHOTS_PER_ROUND,
        ducksHit: 0,
        ducksInRound: 0,
        ducksShotThisRound: Array(DUCK_HUNT_CONFIG.DUCKS_PER_ROUND).fill(false),
        roundPhase: 'playing',
        flyAwayTimer: null,
      });
      currentDuckIndexRef.current = 0;
      duckSpawnedRef.current = false;
    }
  }, [isPlaying]);

  // Handle shooting
  useEffect(() => {
    if (
      !isPlaying ||
      !gestureState.isShooting ||
      !gestureState.aimPosition ||
      lastShotProcessedRef.current ||
      duckHuntState.shotsRemaining <= 0 ||
      duckHuntState.roundPhase !== 'playing'
    ) {
      if (!gestureState.isShooting) {
        lastShotProcessedRef.current = false;
      }
      return;
    }

    lastShotProcessedRef.current = true;
    duckHuntAudio.playShoot();

    // Decrease shots
    setDuckHuntState((prev) => ({
      ...prev,
      shotsRemaining: prev.shotsRemaining - 1,
    }));

    // Check for duck hit
    const hitDuck = ducks.find((duck) => {
      if (duck.state !== 'flying') return false;
      const dx = duck.x - gestureState.aimPosition!.x;
      const dy = duck.y - gestureState.aimPosition!.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < DUCK_HUNT_CONFIG.DUCK_SIZE;
    });

    if (hitDuck) {
      duckHuntAudio.playHit();

      // Mark duck as hit
      setDucks((prev) =>
        prev.map((d) => (d.id === hitDuck.id ? { ...d, state: 'hit' as const } : d))
      );

      // Update score
      const newScore = score + hitDuck.points;
      setScore(newScore);
      onScoreChange(newScore);

      // Update hit counter
      setDuckHuntState((prev) => {
        const newDucksShotThisRound = [...prev.ducksShotThisRound];
        newDucksShotThisRound[currentDuckIndexRef.current] = true;
        return {
          ...prev,
          ducksHit: prev.ducksHit + 1,
          ducksShotThisRound: newDucksShotThisRound,
        };
      });

      // Start fall animation after hit delay
      setTimeout(() => {
        setDucks((prev) =>
          prev.map((d) => (d.id === hitDuck.id ? { ...d, state: 'falling' as const } : d))
        );
      }, DUCK_HUNT_CONFIG.HIT_ANIMATION_DURATION);
    }
  }, [
    gestureState.isShooting,
    gestureState.aimPosition,
    ducks,
    score,
    isPlaying,
    duckHuntState.shotsRemaining,
    duckHuntState.roundPhase,
    onScoreChange,
  ]);

  // Game loop
  const gameLoop = useCallback(
    (deltaTime: number) => {
      if (!isPlaying || duckHuntState.roundPhase === 'gameOver') return;

      const currentTime = Date.now();
      const playAreaHeight = screenDimensions.height * 0.75 - 96;

      // Spawn new duck if needed
      if (ducks.length === 0 && !duckSpawnedRef.current && duckHuntState.ducksInRound < DUCK_HUNT_CONFIG.DUCKS_PER_ROUND) {
        const newDuck = createDuck(screenDimensions.width, screenDimensions.height, duckHuntState.round);
        setDucks([newDuck]);
        duckSpawnedRef.current = true;
        setDuckHuntState((prev) => ({
          ...prev,
          shotsRemaining: DUCK_HUNT_CONFIG.SHOTS_PER_ROUND,
          flyAwayTimer: currentTime + DUCK_HUNT_CONFIG.FLY_AWAY_TIME,
        }));
      }

      // Update ducks
      setDucks((prev) => {
        const updated: Duck[] = [];

        for (const duck of prev) {
          if (duck.state === 'falling') {
            // Duck falling after being hit
            const newY = duck.y + DUCK_HUNT_CONFIG.DUCK_FALL_SPEED;

            // Check if duck has fallen below screen
            if (newY > screenDimensions.height) {
              // Duck has fallen, move to next duck
              duckSpawnedRef.current = false;
              currentDuckIndexRef.current++;
              setDuckHuntState((prev) => ({
                ...prev,
                ducksInRound: prev.ducksInRound + 1,
              }));
              continue;
            }

            updated.push({ ...duck, y: newY });
          } else if (duck.state === 'hit') {
            // Keep duck in place during hit animation
            updated.push(duck);
          } else if (duck.state === 'flyingAway') {
            // Duck flying away (escaped)
            const newY = duck.y - 5;

            if (newY < -DUCK_HUNT_CONFIG.DUCK_SIZE) {
              duckHuntAudio.playFlyAway();
              duckSpawnedRef.current = false;
              currentDuckIndexRef.current++;
              setDuckHuntState((prev) => ({
                ...prev,
                ducksInRound: prev.ducksInRound + 1,
              }));
              continue;
            }

            updated.push({ ...duck, y: newY, vx: 0, vy: -5 });
          } else {
            // Flying duck
            let newVx = duck.vx;
            let newVy = duck.vy;

            // Check if should fly away (out of shots or time expired)
            const shouldFlyAway =
              duckHuntState.shotsRemaining <= 0 ||
              (duckHuntState.flyAwayTimer && currentTime > duckHuntState.flyAwayTimer);

            if (shouldFlyAway) {
              updated.push({ ...duck, state: 'flyingAway' });
              continue;
            }

            // Random direction changes
            if (currentTime - lastDirectionChangeRef.current > DUCK_HUNT_CONFIG.DUCK_DIRECTION_CHANGE_INTERVAL) {
              const speed = Math.sqrt(duck.vx * duck.vx + duck.vy * duck.vy);
              const angle = Math.random() * Math.PI * 2;
              newVx = Math.cos(angle) * speed;
              newVy = Math.sin(angle) * speed;
              lastDirectionChangeRef.current = currentTime;
            }

            // Calculate new position
            let newX = duck.x + newVx;
            let newY = duck.y + newVy;

            // Bounce off walls
            if (newX < DUCK_HUNT_CONFIG.DUCK_SIZE / 2) {
              newX = DUCK_HUNT_CONFIG.DUCK_SIZE / 2;
              newVx = Math.abs(newVx);
            } else if (newX > screenDimensions.width - DUCK_HUNT_CONFIG.DUCK_SIZE / 2) {
              newX = screenDimensions.width - DUCK_HUNT_CONFIG.DUCK_SIZE / 2;
              newVx = -Math.abs(newVx);
            }

            if (newY < DUCK_HUNT_CONFIG.DUCK_SIZE / 2) {
              newY = DUCK_HUNT_CONFIG.DUCK_SIZE / 2;
              newVy = Math.abs(newVy);
            } else if (newY > playAreaHeight - DUCK_HUNT_CONFIG.DUCK_SIZE / 2) {
              newY = playAreaHeight - DUCK_HUNT_CONFIG.DUCK_SIZE / 2;
              newVy = -Math.abs(newVy);
            }

            updated.push({ ...duck, x: newX, y: newY, vx: newVx, vy: newVy });
          }
        }

        return updated;
      });

      // Check for round completion
      if (duckHuntState.ducksInRound >= DUCK_HUNT_CONFIG.DUCKS_PER_ROUND && ducks.length === 0) {
        // Round complete
        if (duckHuntState.ducksHit >= DUCK_HUNT_CONFIG.DUCKS_TO_PASS) {
          // Passed! Check for perfect
          const isPerfect = duckHuntState.ducksHit === DUCK_HUNT_CONFIG.DUCKS_PER_ROUND;

          if (isPerfect) {
            const perfectBonus = DUCK_HUNT_CONFIG.PERFECT_ROUND_BONUS;
            const newScore = score + perfectBonus;
            setScore(newScore);
            onScoreChange(newScore);
            duckHuntAudio.playPerfect();
          } else {
            duckHuntAudio.playRoundComplete();
          }

          // Start next round
          setTimeout(() => {
            setDuckHuntState({
              round: duckHuntState.round + 1,
              shotsRemaining: DUCK_HUNT_CONFIG.SHOTS_PER_ROUND,
              ducksHit: 0,
              ducksInRound: 0,
              ducksShotThisRound: Array(DUCK_HUNT_CONFIG.DUCKS_PER_ROUND).fill(false),
              roundPhase: 'playing',
              flyAwayTimer: null,
            });
            currentDuckIndexRef.current = 0;
            duckSpawnedRef.current = false;
          }, 2000);
        } else {
          // Failed - game over
          duckHuntAudio.playGameOver();
          setDuckHuntState((prev) => ({
            ...prev,
            roundPhase: 'gameOver',
          }));
          setTimeout(() => {
            onGameOver(score);
          }, 2000);
        }
      }
    },
    [
      isPlaying,
      ducks,
      duckHuntState,
      screenDimensions,
      score,
      onScoreChange,
      onGameOver,
    ]
  );

  const { start: startGameLoop, stop: stopGameLoop } = useGameLoop(gameLoop, 60);

  useEffect(() => {
    if (isPlaying) {
      startGameLoop();
    } else {
      stopGameLoop();
    }
  }, [isPlaying, startGameLoop, stopGameLoop]);

  const error = cameraError || trackingError;

  // Portrait mode overlay for mobile
  if (isPortrait) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ backgroundColor: DUCK_HUNT_CONFIG.SKY_COLOR }}
      >
        <div
          className="text-center p-8"
          style={{ fontFamily: '"Press Start 2P", monospace' }}
        >
          <div className="text-6xl mb-6 animate-bounce">📱</div>
          <div className="text-xl text-black mb-4" style={{ textShadow: '2px 2px 0px white' }}>
            ROTATE YOUR
          </div>
          <div className="text-xl text-black mb-6" style={{ textShadow: '2px 2px 0px white' }}>
            DEVICE
          </div>
          <div className="text-4xl">↻</div>
          <div className="text-sm text-black mt-6 opacity-70">
            Play in landscape mode
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ imageRendering: 'pixelated' }}
    >
      {/* Background */}
      <DuckHuntBackground />

      {/* Hidden camera for hand tracking */}
      <Camera ref={videoRef} className="opacity-0 pointer-events-none" />

      {/* Ducks */}
      {ducks.map((duck) => (
        <DuckSprite key={duck.id} duck={duck} />
      ))}

      {/* Classic crosshair */}
      {gestureState.aimPosition && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: gestureState.aimPosition.x - 15,
            top: gestureState.aimPosition.y - 15,
            width: 30,
            height: 30,
          }}
        >
          <svg viewBox="0 0 30 30" width={30} height={30}>
            {/* Crosshair lines */}
            <line x1="15" y1="0" x2="15" y2="10" stroke="white" strokeWidth="2" />
            <line x1="15" y1="20" x2="15" y2="30" stroke="white" strokeWidth="2" />
            <line x1="0" y1="15" x2="10" y2="15" stroke="white" strokeWidth="2" />
            <line x1="20" y1="15" x2="30" y2="15" stroke="white" strokeWidth="2" />
            {/* Center dot */}
            <circle cx="15" cy="15" r="2" fill="white" />
            {/* Black outline */}
            <line x1="15" y1="0" x2="15" y2="10" stroke="black" strokeWidth="4" style={{ opacity: 0.5 }} />
            <line x1="15" y1="20" x2="15" y2="30" stroke="black" strokeWidth="4" style={{ opacity: 0.5 }} />
            <line x1="0" y1="15" x2="10" y2="15" stroke="black" strokeWidth="4" style={{ opacity: 0.5 }} />
            <line x1="20" y1="15" x2="30" y2="15" stroke="black" strokeWidth="4" style={{ opacity: 0.5 }} />
          </svg>
        </div>
      )}

      {/* HUD */}
      <DuckHuntHUD state={duckHuntState} score={score} />

      {/* Round indicator */}
      {duckHuntState.roundPhase === 'playing' && duckHuntState.ducksInRound === 0 && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <div
            className="text-white text-4xl font-bold animate-pulse"
            style={{ fontFamily: '"Press Start 2P", monospace', textShadow: '4px 4px 0px black' }}
          >
            ROUND {duckHuntState.round}
          </div>
        </div>
      )}

      {/* Game Over overlay */}
      {duckHuntState.roundPhase === 'gameOver' && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
          <div className="text-center">
            <div
              className="text-red-500 text-5xl font-bold mb-4"
              style={{ fontFamily: '"Press Start 2P", monospace', textShadow: '4px 4px 0px black' }}
            >
              GAME OVER
            </div>
            <div
              className="text-white text-2xl"
              style={{ fontFamily: '"Press Start 2P", monospace' }}
            >
              FINAL SCORE: {score}
            </div>
          </div>
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
      {isPlaying && hasPermission && !gestureState.aimPosition && (
        <div
          className="absolute bottom-28 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded"
          style={{ fontFamily: '"Press Start 2P", monospace' }}
        >
          <p className="text-xs">FORMA UNA PISTOLA</p>
        </div>
      )}
    </div>
  );
}
