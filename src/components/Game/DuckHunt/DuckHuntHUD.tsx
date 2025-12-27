'use client';

import { DuckHuntState } from '@/types';
import { DUCK_HUNT_CONFIG } from '@/constants/game';

interface DuckHuntHUDProps {
  state: DuckHuntState;
  score: number;
}

export function DuckHuntHUD({ state, score }: DuckHuntHUDProps) {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 h-24 bg-black flex items-center justify-between px-4"
      style={{ fontFamily: '"Press Start 2P", monospace', imageRendering: 'pixelated' }}
    >
      {/* Round and Shots */}
      <div className="flex flex-col gap-2">
        {/* Round indicator */}
        <div className="flex items-center gap-2">
          <span className="text-white text-xs">R=</span>
          <span className="text-green-400 text-sm font-bold">{state.round}</span>
        </div>

        {/* Shots remaining */}
        <div className="flex items-center gap-1">
          <span className="text-white text-[10px]">SHOT</span>
          <div className="flex gap-1 ml-2">
            {Array.from({ length: DUCK_HUNT_CONFIG.SHOTS_PER_ROUND }).map((_, i) => (
              <div
                key={i}
                className={`w-4 h-6 rounded-sm ${
                  i < state.shotsRemaining ? 'bg-red-500' : 'bg-gray-700'
                }`}
                style={{
                  boxShadow: i < state.shotsRemaining ? '0 0 4px #ef4444' : 'none',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Hit counter */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-white text-xs">HIT</span>
        <div className="flex gap-1">
          {state.ducksShotThisRound.map((hit, i) => (
            <div
              key={i}
              className={`w-4 h-4 ${hit ? 'bg-red-500' : 'bg-white'}`}
              style={{
                clipPath: 'polygon(50% 0%, 100% 50%, 80% 100%, 20% 100%, 0% 50%)',
              }}
            />
          ))}
        </div>
        {/* Progress bar */}
        <div className="w-48 h-2 bg-gray-700 rounded">
          <div
            className="h-full bg-cyan-400 rounded transition-all duration-300"
            style={{
              width: `${(state.ducksHit / DUCK_HUNT_CONFIG.DUCKS_TO_PASS) * 100}%`,
              maxWidth: '100%',
            }}
          />
        </div>
      </div>

      {/* Score */}
      <div className="flex flex-col items-end gap-1">
        <span className="text-white text-2xl font-bold tracking-wider">
          {score.toString().padStart(6, '0')}
        </span>
        <span className="text-white text-[10px]">SCORE</span>
      </div>
    </div>
  );
}
