'use client';

import { LevelConfig } from '@/types';
import { LEVELS } from '@/constants/game';

interface LevelSelectProps {
  unlockedLevels: number;
  levelStars: Record<number, number>;
  onSelectLevel: (level: LevelConfig) => void;
  onBack: () => void;
}

export function LevelSelect({ unlockedLevels, levelStars, onSelectLevel, onBack }: LevelSelectProps) {
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-white">Select Level</h2>
          <button
            onClick={onBack}
            className="text-slate-400 hover:text-white transition-colors"
          >
            Back
          </button>
        </div>

        {/* Level grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {LEVELS.map((level) => {
            const isUnlocked = level.id <= unlockedLevels;
            const stars = levelStars[level.id] || 0;

            return (
              <button
                key={level.id}
                onClick={() => isUnlocked && onSelectLevel(level as unknown as LevelConfig)}
                disabled={!isUnlocked}
                className={`relative p-4 rounded-xl transition-all ${
                  isUnlocked
                    ? 'bg-slate-700 hover:bg-slate-600 cursor-pointer'
                    : 'bg-slate-800 cursor-not-allowed opacity-50'
                }`}
              >
                {/* Level number */}
                <div className={`text-4xl font-bold mb-2 ${
                  isUnlocked ? 'text-white' : 'text-slate-600'
                }`}>
                  {isUnlocked ? level.id : '?'}
                </div>

                {/* Level name */}
                <div className={`text-sm font-semibold mb-1 ${
                  isUnlocked ? 'text-white' : 'text-slate-600'
                }`}>
                  {isUnlocked ? level.name : 'Locked'}
                </div>

                {/* Stars */}
                {isUnlocked && (
                  <div className="flex justify-center gap-1 mt-2">
                    {[1, 2, 3].map((star) => (
                      <span
                        key={star}
                        className={`text-lg ${
                          star <= stars ? 'text-yellow-400' : 'text-slate-600'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                )}

                {/* Special rules indicator */}
                {isUnlocked && 'specialRules' in level && level.specialRules && (
                  <div className="absolute top-2 right-2">
                    <span className="text-xs bg-purple-500 text-white px-1.5 py-0.5 rounded">
                      Special
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-slate-700">
          <h3 className="text-sm font-semibold text-slate-400 mb-2">Special Rules Legend:</h3>
          <div className="flex flex-wrap gap-3 text-xs text-slate-400">
            <span>No Lives Loss - Targets won't take lives</span>
            <span>|</span>
            <span>Time Attack - Hits add time</span>
            <span>|</span>
            <span>Ghost - Targets fade in/out</span>
            <span>|</span>
            <span>Shrinking - Targets get smaller</span>
            <span>|</span>
            <span>Speed Ramp - Targets speed up</span>
          </div>
        </div>
      </div>
    </div>
  );
}
