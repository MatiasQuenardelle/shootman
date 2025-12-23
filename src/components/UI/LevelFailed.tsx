'use client';

import { LevelConfig } from '@/types';

interface LevelFailedProps {
  level: LevelConfig;
  score: number;
  reason: 'time' | 'lives';
  onRetry: () => void;
  onLevelSelect: () => void;
}

export function LevelFailed({
  level,
  score,
  reason,
  onRetry,
  onLevelSelect,
}: LevelFailedProps) {
  const failMessage = reason === 'time'
    ? "Time's up! You didn't reach the pass score."
    : "You ran out of lives!";

  const scoreNeeded = level.passScore - score;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full text-center">
        {/* Failure header */}
        <h2 className="text-4xl font-bold text-red-500 mb-2">LEVEL FAILED</h2>
        <p className="text-slate-400 mb-2">{level.name}</p>
        <p className="text-slate-500 text-sm mb-6">{failMessage}</p>

        {/* Score */}
        <div className="mb-6">
          <p className="text-slate-400 text-sm">YOUR SCORE</p>
          <p className="text-4xl font-bold text-white">{score.toLocaleString()}</p>
        </div>

        {/* Score breakdown */}
        <div className="bg-slate-700/50 rounded-lg p-4 mb-6 text-left">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Pass Score</span>
            <span className="text-white">{level.passScore.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-slate-400">Your Score</span>
            <span className="text-red-400">{score.toLocaleString()}</span>
          </div>
          {scoreNeeded > 0 && (
            <div className="flex justify-between text-sm mt-2 pt-2 border-t border-slate-600">
              <span className="text-slate-400">Needed</span>
              <span className="text-yellow-400">+{scoreNeeded.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="bg-slate-700/30 rounded-lg p-3 mb-6 text-left">
          <p className="text-xs text-slate-400 font-semibold mb-1">TIP:</p>
          <p className="text-xs text-slate-300">
            {level.specialRules?.bonusTimePerHit
              ? "Hit targets quickly to gain bonus time!"
              : level.specialRules?.invisibleTargets
              ? "Wait for targets to appear before shooting!"
              : level.specialRules?.shrinkingTargets
              ? "Hit targets before they shrink too small!"
              : "Build combos for higher scores! Don't miss!"}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onRetry}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            TRY AGAIN
          </button>
          <button
            onClick={onLevelSelect}
            className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Level Select
          </button>
        </div>
      </div>
    </div>
  );
}
