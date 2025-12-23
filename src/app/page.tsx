'use client';

import { useState, useEffect, useCallback } from 'react';
import { GameCanvas } from '@/components/Game/GameCanvas';
import { ScoreBoard } from '@/components/UI/ScoreBoard';
import { StartScreen } from '@/components/UI/StartScreen';
import { GameOver } from '@/components/UI/GameOver';
import { Instructions } from '@/components/UI/Instructions';
import { GameState } from '@/types';
import { GAME_CONFIG } from '@/constants/game';
import { audioManager } from '@/lib/audio';

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
};

export default function Home() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [showInstructions, setShowInstructions] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  // Load high score from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('shootman-highscore');
    if (stored) {
      setHighScore(parseInt(stored, 10));
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

  const startGame = useCallback(() => {
    audioManager.initialize();
    setIsNewHighScore(false);
    setGameState({
      ...INITIAL_GAME_STATE,
      status: 'playing',
    });
  }, []);

  const handleGameOver = useCallback(() => {
    audioManager.play('gameOver');
    setGameState((prev) => ({
      ...prev,
      status: 'gameOver',
    }));
  }, []);

  const handleMainMenu = useCallback(() => {
    setGameState(INITIAL_GAME_STATE);
  }, []);

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

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-900">
      {/* Start Screen */}
      {gameState.status === 'idle' && (
        <StartScreen
          onStart={startGame}
          onShowInstructions={() => setShowInstructions(true)}
          highScore={highScore}
        />
      )}

      {/* Game Canvas */}
      {(gameState.status === 'playing' || gameState.status === 'gameOver') && (
        <GameCanvas
          gameState={gameState}
          onScoreChange={handleScoreChange}
          onLivesChange={handleLivesChange}
          onComboChange={handleComboChange}
          onWaveChange={handleWaveChange}
          onGameOver={handleGameOver}
          onTargetsChange={handleTargetsChange}
        />
      )}

      {/* Score Board */}
      {gameState.status === 'playing' && <ScoreBoard gameState={gameState} />}

      {/* Game Over Screen */}
      {gameState.status === 'gameOver' && (
        <GameOver
          score={gameState.score}
          wave={gameState.wave}
          highScore={highScore}
          isNewHighScore={isNewHighScore}
          onRestart={startGame}
          onMainMenu={handleMainMenu}
        />
      )}

      {/* Instructions Modal */}
      {showInstructions && (
        <Instructions onClose={() => setShowInstructions(false)} />
      )}
    </main>
  );
}
