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
import { GameState, LevelConfig } from '@/types';
import { GAME_CONFIG, LEVELS } from '@/constants/game';
import { audioManager, setupAudioUnlock } from '@/lib/audio';

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
};

export default function Home() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  // Level progression state
  const [currentLevelConfig, setCurrentLevelConfig] = useState<LevelConfig | null>(null);
  const [unlockedLevels, setUnlockedLevels] = useState(1);
  const [levelStars, setLevelStars] = useState<Record<number, number>>({});
  const [levelScores, setLevelScores] = useState<Record<number, number>>({});
  const [failReason, setFailReason] = useState<'time' | 'lives'>('time');

  // Set up audio unlock for iOS Safari (must happen on user interaction)
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
    setIsNewHighScore(false);
    setCurrentLevelConfig(null);
    setGameState({
      ...INITIAL_GAME_STATE,
      status: 'playing',
    });
  }, []);

  // Start a specific level
  const startLevel = useCallback((level: LevelConfig) => {
    audioManager.initialize();
    setCurrentLevelConfig(level);
    setShowLevelSelect(false);
    setGameState({
      ...INITIAL_GAME_STATE,
      status: 'playing',
      currentLevel: level.id,
      timeRemaining: level.duration,
    });
  }, []);

  // Handle level completion
  const handleLevelComplete = useCallback(() => {
    if (!currentLevelConfig) return;

    audioManager.play('levelUp');

    const stars = calculateStars(gameState.score, currentLevelConfig);
    const levelId = currentLevelConfig.id;

    // Update stars if better
    setLevelStars((prev) => {
      const newStars = { ...prev };
      if (!newStars[levelId] || stars > newStars[levelId]) {
        newStars[levelId] = stars;
        localStorage.setItem('shootman-stars', JSON.stringify(newStars));
      }
      return newStars;
    });

    // Update level score if better
    setLevelScores((prev) => {
      const newScores = { ...prev };
      if (!newScores[levelId] || gameState.score > newScores[levelId]) {
        newScores[levelId] = gameState.score;
        localStorage.setItem('shootman-level-scores', JSON.stringify(newScores));
      }
      return newScores;
    });

    // Unlock next level
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
    setFailReason(gameState.lives <= 0 ? 'lives' : 'time');
    setGameState((prev) => ({
      ...prev,
      status: 'levelFailed',
    }));
  }, [gameState.lives]);

  const handleGameOver = useCallback(() => {
    audioManager.play('gameOver');
    setGameState((prev) => ({
      ...prev,
      status: 'gameOver',
    }));
  }, []);

  const handleMainMenu = useCallback(() => {
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
  }, []);

  const handleLivesChange = useCallback((lives: number) => {
    setGameState((prev) => ({ ...prev, lives }));
  }, []);

  const handleComboChange = useCallback((combo: number) => {
    setGameState((prev) => ({ ...prev, combo }));
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
  }, []);

  const handleTimeChange = useCallback((time: number) => {
    setGameState((prev) => ({ ...prev, timeRemaining: time }));
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
          onRestart={startEndlessMode}
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
    </main>
  );
}
