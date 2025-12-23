'use client';

import { GameState, LevelConfig } from '@/types';

interface ScoreBoardProps {
  gameState: GameState;
  levelConfig?: LevelConfig;
}

export function ScoreBoard({ gameState, levelConfig }: ScoreBoardProps) {
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress to pass score
  const passProgress = levelConfig
    ? Math.min(100, (gameState.score / levelConfig.passScore) * 100)
    : 0;

  return (
    <div className="absolute top-0 left-0 right-0 flex justify-between items-start p-4 pointer-events-none">
      {/* Score and combo */}
      <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 text-white">
        <div className="text-3xl font-bold tabular-nums">
          {gameState.score.toLocaleString()}
        </div>
        {gameState.combo > 1 && (
          <div className="text-yellow-400 text-sm font-semibold animate-pulse">
            {gameState.combo}x COMBO
          </div>
        )}
        {/* Progress to pass score */}
        {levelConfig && (
          <div className="mt-1">
            <div className="text-xs text-slate-400">
              Pass: {levelConfig.passScore.toLocaleString()}
            </div>
            <div className="w-full h-1.5 bg-slate-700 rounded-full mt-0.5">
              <div
                className={`h-full rounded-full transition-all ${
                  passProgress >= 100 ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${passProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Timer (level mode) or Wave indicator (endless mode) */}
      <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 text-white text-center">
        {levelConfig ? (
          <>
            <div className="text-sm text-slate-400">TIME</div>
            <div className={`text-2xl font-bold tabular-nums ${
              gameState.timeRemaining <= 10 ? 'text-red-500 animate-pulse' : ''
            }`}>
              {formatTime(gameState.timeRemaining)}
            </div>
            {levelConfig.specialRules?.bonusTimePerHit && (
              <div className="text-xs text-green-400">+{levelConfig.specialRules.bonusTimePerHit}s/hit</div>
            )}
          </>
        ) : (
          <>
            <div className="text-sm text-slate-400">WAVE</div>
            <div className="text-2xl font-bold">{gameState.wave}</div>
          </>
        )}
      </div>

      {/* Level name (if in level mode) or Lives */}
      <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 text-white">
        {levelConfig && (
          <div className="text-xs text-slate-400 mb-1 text-center">{levelConfig.name}</div>
        )}
        <div className="flex gap-1 justify-center">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={`w-6 h-6 rounded-full ${
                i < gameState.lives ? 'bg-red-500' : 'bg-slate-700'
              }`}
            />
          ))}
        </div>
        {levelConfig?.specialRules?.noLivesLoss && (
          <div className="text-xs text-green-400 mt-1 text-center">No life loss</div>
        )}
      </div>
    </div>
  );
}
