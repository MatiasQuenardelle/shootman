'use client';

import { useState, useEffect, useCallback } from 'react';
import { GameCanvas } from '@/components/Game/GameCanvas';
import { ScoreBoard } from '@/components/UI/ScoreBoard';
import { StartScreen } from '@/components/UI/StartScreen';
import { GameOver } from '@/components/UI/GameOver';
import { Instructions } from '@/components/UI/Instructions';
import { LevelSelect } from '@/components/UI/LevelSelect';
import { LevelComplete } from '@/components/UI/LevelComplete';
import { LevelFailed } from '@/components/UI/LevelFailed';
import { Settings } from '@/components/UI/Settings';
import { GameState, LevelConfig, PowerUp, ActivePowerUp, Obstacle } from '@/types';
import { GAME_CONFIG, LEVELS } from '@/constants/game';
import { audioManager, setupAudioUnlock } from '@/lib/audio';
import { musicManager } from '@/lib/musicManager';
import { achievementsManager } from '@/lib/achievementsManager';

const INITIAL_GAME_STATE: GameState = {
  status: 'idle',
  score: 0,
  lives: GAME_CONFIG.STARTING_LIVES,
  wave: 1,
  combo: 0,
  targets: [],
  difficulty: 0,
  targetsDestroyed: 0,
  shotsFired: 0,
  currentLevel: 0,
  timeRemaining: 60,
  powerUps: [],
  activePowerUps: [],
  obstacles: [],
  globalTimeScale: 1,
  ammo: GAME_CONFIG.MAX_AMMO,
  maxAmmo: GAME_CONFIG.MAX_AMMO,
  isReloading: false,
  reloadProgress: 0,
  screenShake: 0,
  gameMode: 'single',
  players: undefined,
};

export default function Home() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  // Level progression state
  const [currentLevelConfig, setCurrentLevelConfig] = useState<LevelConfig | null>(null);
  const [unlockedLevels, setUnlockedLevels] = useState(1);
  const [levelStars, setLevelStars] = useState<Record<number, number>>({});
  const [levelScores, setLevelScores] = useState<Record<number, number>>({});
  const [failReason, setFailReason] = useState<'time' | 'lives'>('time');

  // Set up audio unlock for iOS Safari
  useEffect(() => {
    const cleanup = setupAudioUnlock();
    return cleanup;
  }, []);

  // Load saved progress from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('shootman-highscore');
    if (stored) {
      setHighScore(parseInt(stored, 10));
    }

    const storedUnlocked = localStorage.getItem('shootman-unlocked');
    if (storedUnlocked) {
      setUnlockedLevels(parseInt(storedUnlocked, 10));
    }

    const storedStars = localStorage.getItem('shootman-stars');
    if (storedStars) {
      setLevelStars(JSON.parse(storedStars));
    }

    const storedScores = localStorage.getItem('shootman-level-scores');
    if (storedScores) {
      setLevelScores(JSON.parse(storedScores));
    }
  }, []);

  // Save high score when game ends
  useEffect(() => {
    if (gameState.status === 'gameOver' && gameState.score > highScore) {
      setHighScore(gameState.score);
      setIsNewHighScore(true);
      localStorage.setItem('shootman-highscore', gameState.score.toString());
    }
  }, [gameState.status, gameState.score, highScore]);

  // Calculate stars based on score
  const calculateStars = useCallback((score: number, level: LevelConfig): number => {
    if (score >= level.threeStarScore) return 3;
    if (score >= level.passScore + (level.threeStarScore - level.passScore) / 2) return 2;
    if (score >= level.passScore) return 1;
    return 0;
  }, []);

  // Start endless mode
  const startEndlessMode = useCallback(() => {
    audioManager.initialize();
    musicManager.initialize().then(() => musicManager.start());
    setIsNewHighScore(false);
    setCurrentLevelConfig(null);
    setGameState({
      ...INITIAL_GAME_STATE,
      status: 'playing',
      gameMode: 'single',
    });
  }, []);

  // Start co-op mode (two players)
  const startCoopMode = useCallback(() => {
    audioManager.initialize();
    musicManager.initialize().then(() => musicManager.start());
    setIsNewHighScore(false);
    setCurrentLevelConfig(null);
    setGameState({
      ...INITIAL_GAME_STATE,
      status: 'playing',
      gameMode: 'coop',
      players: [
        {
          id: 1,
          score: 0,
          lives: GAME_CONFIG.STARTING_LIVES,
          combo: 0,
          ammo: GAME_CONFIG.MAX_AMMO,
          maxAmmo: GAME_CONFIG.MAX_AMMO,
          isReloading: false,
          reloadProgress: 0,
          gestureState: { isGunShape: false, isShooting: false, isReloading: false, isFist: false, aimPosition: null, confidence: 0 },
          color: GAME_CONFIG.PLAYER_COLORS[1],
          activePowerUps: [],
        },
        {
          id: 2,
          score: 0,
          lives: GAME_CONFIG.STARTING_LIVES,
          combo: 0,
          ammo: GAME_CONFIG.MAX_AMMO,
          maxAmmo: GAME_CONFIG.MAX_AMMO,
          isReloading: false,
          reloadProgress: 0,
          gestureState: { isGunShape: false, isShooting: false, isReloading: false, isFist: false, aimPosition: null, confidence: 0 },
          color: GAME_CONFIG.PLAYER_COLORS[2],
          activePowerUps: [],
        },
      ],
    });
  }, []);

  // Start versus mode (two players competitive)
  const startVersusMode = useCallback(() => {
    audioManager.initialize();
    musicManager.initialize().then(() => musicManager.start());
    setIsNewHighScore(false);
    setCurrentLevelConfig(null);
    setGameState({
      ...INITIAL_GAME_STATE,
      status: 'playing',
      gameMode: 'versus',
      players: [
        {
          id: 1,
          score: 0,
          lives: GAME_CONFIG.STARTING_LIVES,
          combo: 0,
          ammo: GAME_CONFIG.MAX_AMMO,
          maxAmmo: GAME_CONFIG.MAX_AMMO,
          isReloading: false,
          reloadProgress: 0,
          gestureState: { isGunShape: false, isShooting: false, isReloading: false, isFist: false, aimPosition: null, confidence: 0 },
          color: GAME_CONFIG.PLAYER_COLORS[1],
          activePowerUps: [],
        },
        {
          id: 2,
          score: 0,
          lives: GAME_CONFIG.STARTING_LIVES,
          combo: 0,
          ammo: GAME_CONFIG.MAX_AMMO,
          maxAmmo: GAME_CONFIG.MAX_AMMO,
          isReloading: false,
          reloadProgress: 0,
          gestureState: { isGunShape: false, isShooting: false, isReloading: false, isFist: false, aimPosition: null, confidence: 0 },
          color: GAME_CONFIG.PLAYER_COLORS[2],
          activePowerUps: [],
        },
      ],
    });
  }, []);

  // Start a specific level
  const startLevel = useCallback((level: LevelConfig) => {
    audioManager.initialize();
    musicManager.initialize().then(() => musicManager.start());
    setCurrentLevelConfig(level);
    setShowLevelSelect(false);
    setGameState({
      ...INITIAL_GAME_STATE,
      status: 'playing',
      currentLevel: level.id,
      timeRemaining: level.duration,
      gameMode: 'single',
    });
  }, []);

  // Handle level completion
  const handleLevelComplete = useCallback(() => {
    if (!currentLevelConfig) return;

    audioManager.play('levelUp');
    musicManager.stop();
    achievementsManager.recordLevelComplete();

    const stars = calculateStars(gameState.score, currentLevelConfig);
    const levelId = currentLevelConfig.id;

    setLevelStars((prev) => {
      const newStars = { ...prev };
      if (!newStars[levelId] || stars > newStars[levelId]) {
        newStars[levelId] = stars;
        localStorage.setItem('shootman-stars', JSON.stringify(newStars));
      }
      return newStars;
    });

    setLevelScores((prev) => {
      const newScores = { ...prev };
      if (!newScores[levelId] || gameState.score > newScores[levelId]) {
        newScores[levelId] = gameState.score;
        localStorage.setItem('shootman-level-scores', JSON.stringify(newScores));
      }
      return newScores;
    });

    if (levelId >= unlockedLevels && levelId < LEVELS.length) {
      setUnlockedLevels(levelId + 1);
      localStorage.setItem('shootman-unlocked', (levelId + 1).toString());
    }

    setGameState((prev) => ({
      ...prev,
      status: 'levelComplete',
    }));
  }, [currentLevelConfig, gameState.score, unlockedLevels, calculateStars]);

  // Handle level failure
  const handleLevelFailed = useCallback(() => {
    audioManager.play('gameOver');
    musicManager.stop();
    setFailReason(gameState.lives <= 0 ? 'lives' : 'time');
    setGameState((prev) => ({
      ...prev,
      status: 'levelFailed',
    }));
  }, [gameState.lives]);

  const handleGameOver = useCallback(() => {
    audioManager.play('gameOver');
    musicManager.stop();

    // Check for co-op win achievement
    if (gameState.gameMode === 'coop' && gameState.score > 5000) {
      achievementsManager.recordCoopWin();
    }

    setGameState((prev) => ({
      ...prev,
      status: 'gameOver',
    }));
  }, [gameState.gameMode, gameState.score]);

  const handleMainMenu = useCallback(() => {
    musicManager.stop();
    setGameState(INITIAL_GAME_STATE);
    setCurrentLevelConfig(null);
    setShowLevelSelect(false);
  }, []);

  const handleNextLevel = useCallback(() => {
    if (!currentLevelConfig) return;
    const nextLevelIndex = LEVELS.findIndex((l) => l.id === currentLevelConfig.id) + 1;
    if (nextLevelIndex < LEVELS.length) {
      startLevel(LEVELS[nextLevelIndex] as unknown as LevelConfig);
    }
  }, [currentLevelConfig, startLevel]);

  const handleRetryLevel = useCallback(() => {
    if (currentLevelConfig) {
      startLevel(currentLevelConfig);
    }
  }, [currentLevelConfig, startLevel]);

  const handleScoreChange = useCallback((score: number) => {
    setGameState((prev) => ({ ...prev, score }));
    achievementsManager.recordScore(score);
  }, []);

  const handleLivesChange = useCallback((lives: number) => {
    setGameState((prev) => ({ ...prev, lives }));
  }, []);

  const handleComboChange = useCallback((combo: number) => {
    setGameState((prev) => ({ ...prev, combo }));
    achievementsManager.recordCombo(combo);
    musicManager.setIntensity(combo, false);
  }, []);

  const handleWaveChange = useCallback((wave: number) => {
    setGameState((prev) => ({
      ...prev,
      wave,
      difficulty: Math.min(wave * GAME_CONFIG.DIFFICULTY_INCREASE_RATE, GAME_CONFIG.MAX_DIFFICULTY),
    }));
  }, []);

  const handleTargetsChange = useCallback((count: number) => {
    setGameState((prev) => ({ ...prev, targetsDestroyed: count }));
    achievementsManager.recordKill();
  }, []);

  const handleTimeChange = useCallback((time: number) => {
    setGameState((prev) => ({ ...prev, timeRemaining: time }));
  }, []);

  const handlePowerUpsChange = useCallback((powerUps: PowerUp[]) => {
    setGameState((prev) => ({ ...prev, powerUps }));
  }, []);

  const handleActivePowerUpsChange = useCallback((activePowerUps: ActivePowerUp[]) => {
    setGameState((prev) => ({ ...prev, activePowerUps }));
  }, []);

  const handleAmmoChange = useCallback((ammo: number) => {
    setGameState((prev) => ({ ...prev, ammo }));
  }, []);

  const handleReloadChange = useCallback((isReloading: boolean, progress: number) => {
    setGameState((prev) => ({ ...prev, isReloading, reloadProgress: progress }));
  }, []);

  const handleScreenShakeChange = useCallback((shake: number) => {
    setGameState((prev) => ({ ...prev, screenShake: shake }));
  }, []);

  // Calculate total stars
  const totalStars = Object.values(levelStars).reduce((sum, s) => sum + s, 0);

  // Check if there's a next level
  const hasNextLevel = currentLevelConfig
    ? LEVELS.findIndex((l) => l.id === currentLevelConfig.id) < LEVELS.length - 1
    : false;

  // Check if this is a new record for the level
  const isNewLevelRecord = currentLevelConfig
    ? gameState.score > (levelScores[currentLevelConfig.id] || 0)
    : false;

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-900">
      {/* Start Screen */}
      {gameState.status === 'idle' && !showLevelSelect && (
        <StartScreen
          onStart={startEndlessMode}
          onLevelSelect={() => setShowLevelSelect(true)}
          onShowInstructions={() => setShowInstructions(true)}
          onSettings={() => setShowSettings(true)}
          onCoop={startCoopMode}
          onVersus={startVersusMode}
          highScore={highScore}
          totalStars={totalStars}
        />
      )}

      {/* Level Select */}
      {showLevelSelect && gameState.status === 'idle' && (
        <LevelSelect
          unlockedLevels={unlockedLevels}
          levelStars={levelStars}
          onSelectLevel={startLevel}
          onBack={() => setShowLevelSelect(false)}
        />
      )}

      {/* Game Canvas */}
      {(gameState.status === 'playing' ||
        gameState.status === 'gameOver' ||
        gameState.status === 'levelComplete' ||
        gameState.status === 'levelFailed') && (
        <GameCanvas
          gameState={gameState}
          levelConfig={currentLevelConfig || undefined}
          onScoreChange={handleScoreChange}
          onLivesChange={handleLivesChange}
          onComboChange={handleComboChange}
          onWaveChange={handleWaveChange}
          onGameOver={handleGameOver}
          onTargetsChange={handleTargetsChange}
          onTimeChange={handleTimeChange}
          onLevelComplete={handleLevelComplete}
          onLevelFailed={handleLevelFailed}
          onPowerUpsChange={handlePowerUpsChange}
          onActivePowerUpsChange={handleActivePowerUpsChange}
          onAmmoChange={handleAmmoChange}
          onReloadChange={handleReloadChange}
          onScreenShakeChange={handleScreenShakeChange}
        />
      )}

      {/* Score Board */}
      {gameState.status === 'playing' && (
        <ScoreBoard gameState={gameState} levelConfig={currentLevelConfig || undefined} />
      )}

      {/* Game Over Screen (endless mode) */}
      {gameState.status === 'gameOver' && !currentLevelConfig && (
        <GameOver
          score={gameState.score}
          wave={gameState.wave}
          highScore={highScore}
          isNewHighScore={isNewHighScore}
          gameMode={gameState.gameMode}
          players={gameState.players}
          onRestart={gameState.gameMode === 'coop' ? startCoopMode : gameState.gameMode === 'versus' ? startVersusMode : startEndlessMode}
          onMainMenu={handleMainMenu}
        />
      )}

      {/* Level Complete Screen */}
      {gameState.status === 'levelComplete' && currentLevelConfig && (
        <LevelComplete
          level={currentLevelConfig}
          score={gameState.score}
          stars={calculateStars(gameState.score, currentLevelConfig)}
          isNewRecord={isNewLevelRecord}
          hasNextLevel={hasNextLevel}
          onNextLevel={handleNextLevel}
          onRetry={handleRetryLevel}
          onLevelSelect={() => {
            setGameState(INITIAL_GAME_STATE);
            setShowLevelSelect(true);
          }}
        />
      )}

      {/* Level Failed Screen */}
      {gameState.status === 'levelFailed' && currentLevelConfig && (
        <LevelFailed
          level={currentLevelConfig}
          score={gameState.score}
          reason={failReason}
          onRetry={handleRetryLevel}
          onLevelSelect={() => {
            setGameState(INITIAL_GAME_STATE);
            setShowLevelSelect(true);
          }}
        />
      )}

      {/* Instructions Modal */}
      {showInstructions && (
        <Instructions onClose={() => setShowInstructions(false)} />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <Settings onClose={() => setShowSettings(false)} />
      )}
    </main>
  );
}
