'use client';

interface StartScreenProps {
  onStart: () => void;
  onLevelSelect: () => void;
  onShowInstructions: () => void;
  highScore: number;
  totalStars: number;
}

export function StartScreen({ onStart, onLevelSelect, onShowInstructions, highScore, totalStars }: StartScreenProps) {
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col items-center justify-center p-4">
      {/* Title */}
      <div className="text-center mb-12">
        <h1 className="text-6xl md:text-8xl font-bold text-white mb-2 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]">
          <span className="text-red-500">SHOOT</span>MAN
        </h1>
        <p className="text-slate-400 text-lg">Hand Tracking Space Shooter</p>
        <div className="text-4xl mt-2">
          <span role="img" aria-label="space theme">🛸 👽 ☄️ 🪐</span>
        </div>
      </div>

      {/* Gun gesture illustration */}
      <div className="mb-12 text-center">
        <div className="text-8xl mb-4">
          <span role="img" aria-label="pointing hand">
            👉
          </span>
        </div>
        <p className="text-slate-400">Make a gun shape with your hand to aim</p>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          onClick={onLevelSelect}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors shadow-lg shadow-red-500/30"
        >
          LEVELS
        </button>
        <button
          onClick={onStart}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          ENDLESS MODE
        </button>
        <button
          onClick={onShowInstructions}
          className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          How to Play
        </button>
      </div>

      {/* Stats */}
      <div className="mt-8 flex gap-8 text-center">
        {highScore > 0 && (
          <div>
            <p className="text-slate-500 text-sm">HIGH SCORE</p>
            <p className="text-yellow-400 text-2xl font-bold">{highScore.toLocaleString()}</p>
          </div>
        )}
        {totalStars > 0 && (
          <div>
            <p className="text-slate-500 text-sm">TOTAL STARS</p>
            <p className="text-yellow-400 text-2xl font-bold">{totalStars} / 30 ★</p>
          </div>
        )}
      </div>

      {/* Requirements notice */}
      <div className="absolute bottom-4 left-4 right-4 text-center text-slate-500 text-sm">
        <p>Requires camera access and good lighting</p>
      </div>
    </div>
  );
}
