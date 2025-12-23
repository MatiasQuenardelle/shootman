'use client';

import { GameState } from '@/types';

interface ScoreBoardProps {
  gameState: GameState;
}

export function ScoreBoard({ gameState }: ScoreBoardProps) {
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
      </div>

      {/* Wave indicator */}
      <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 text-white text-center">
        <div className="text-sm text-slate-400">WAVE</div>
        <div className="text-2xl font-bold">{gameState.wave}</div>
      </div>

      {/* Lives */}
      <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 text-white">
        <div className="flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={`w-6 h-6 rounded-full ${
                i < gameState.lives ? 'bg-red-500' : 'bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
