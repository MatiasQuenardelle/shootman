'use client';

interface GameOverProps {
  score: number;
  wave: number;
  highScore: number;
  isNewHighScore: boolean;
  onRestart: () => void;
  onMainMenu: () => void;
}

export function GameOver({
  score,
  wave,
  highScore,
  isNewHighScore,
  onRestart,
  onMainMenu,
}: GameOverProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full text-center">
        {/* Game Over text */}
        <h2 className="text-4xl font-bold text-red-500 mb-6">GAME OVER</h2>

        {/* Score display */}
        <div className="mb-6">
          <p className="text-slate-400 text-sm">FINAL SCORE</p>
          <p className="text-5xl font-bold text-white mb-2">{score.toLocaleString()}</p>
          {isNewHighScore && (
            <p className="text-yellow-400 font-semibold animate-pulse">NEW HIGH SCORE!</p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-700/50 rounded-lg p-3">
            <p className="text-slate-400 text-sm">WAVE REACHED</p>
            <p className="text-2xl font-bold text-white">{wave}</p>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-3">
            <p className="text-slate-400 text-sm">HIGH SCORE</p>
            <p className="text-2xl font-bold text-yellow-400">{highScore.toLocaleString()}</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onRestart}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            PLAY AGAIN
          </button>
          <button
            onClick={onMainMenu}
            className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}
