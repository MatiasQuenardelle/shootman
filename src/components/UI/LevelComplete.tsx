'use client';

import { LevelConfig } from '@/types';

interface LevelCompleteProps {
  level: LevelConfig;
  score: number;
  stars: number;
  isNewRecord: boolean;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onRetry: () => void;
  onLevelSelect: () => void;
}

export function LevelComplete({
  level,
  score,
  stars,
  isNewRecord,
  hasNextLevel,
  onNextLevel,
  onRetry,
  onLevelSelect,
}: LevelCompleteProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full text-center">
        {/* Success header */}
        <h2 className="text-4xl font-bold text-green-500 mb-2">LEVEL COMPLETE!</h2>
        <p className="text-slate-400 mb-6">{level.name}</p>

        {/* Stars */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3].map((star) => (
            <span
              key={star}
              className={`text-5xl transition-all ${
                star <= stars
                  ? 'text-yellow-400 animate-bounce'
                  : 'text-slate-600'
              }`}
              style={{ animationDelay: `${star * 0.2}s` }}
            >
              ★
            </span>
          ))}
        </div>

        {/* Score */}
        <div className="mb-6">
          <p className="text-slate-400 text-sm">FINAL SCORE</p>
          <p className="text-4xl font-bold text-white">{score.toLocaleString()}</p>
          {isNewRecord && (
            <p className="text-yellow-400 text-sm font-semibold animate-pulse mt-1">
              NEW RECORD!
            </p>
          )}
        </div>

        {/* Score breakdown */}
        <div className="bg-slate-700/50 rounded-lg p-4 mb-6 text-left">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Pass Score</span>
            <span className="text-white">{level.passScore.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-slate-400">3-Star Score</span>
            <span className="text-white">{level.threeStarScore.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-slate-400">Your Score</span>
            <span className={score >= level.threeStarScore ? 'text-yellow-400' : 'text-green-400'}>
              {score.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          {hasNextLevel && (
            <button
              onClick={onNextLevel}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              NEXT LEVEL
            </button>
          )}
          <button
            onClick={onRetry}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            RETRY
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
