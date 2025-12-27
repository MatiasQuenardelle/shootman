'use client';

import { Player } from '@/types';

interface GameOverProps {
  score: number;
  wave: number;
  highScore: number;
  isNewHighScore: boolean;
  gameMode?: 'single' | 'coop' | 'versus' | 'duckhunt';
  players?: Player[];
  onRestart: () => void;
  onMainMenu: () => void;
}

export function GameOver({
  score,
  wave,
  highScore,
  isNewHighScore,
  gameMode = 'single',
  players,
  onRestart,
  onMainMenu,
}: GameOverProps) {
  const isMultiplayer = gameMode === 'coop' || gameMode === 'versus';

  // Determine winner in versus mode
  const getWinner = () => {
    if (gameMode !== 'versus' || !players) return null;
    if (players[0].score > players[1].score) return 1;
    if (players[1].score > players[0].score) return 2;
    return 0; // tie
  };

  const winner = getWinner();

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full text-center">
        {/* Game Over text */}
        {gameMode === 'versus' && winner !== null ? (
          <div className="mb-6">
            {winner === 0 ? (
              <h2 className="text-4xl font-bold text-yellow-400 mb-2">EMPATE!</h2>
            ) : (
              <>
                <h2 className="text-4xl font-bold mb-2" style={{ color: players![winner - 1].color }}>
                  JUGADOR {winner} GANA!
                </h2>
              </>
            )}
          </div>
        ) : (
          <h2 className="text-4xl font-bold text-red-500 mb-6">GAME OVER</h2>
        )}

        {/* Multiplayer scores */}
        {isMultiplayer && players ? (
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="rounded-lg p-4"
                  style={{ backgroundColor: `${player.color}20`, borderColor: player.color, borderWidth: 2 }}
                >
                  <p className="text-sm font-semibold mb-1" style={{ color: player.color }}>
                    JUGADOR {player.id}
                  </p>
                  <p className="text-3xl font-bold text-white">{player.score.toLocaleString()}</p>
                  <p className="text-xs text-slate-400 mt-1">Combo máx: {player.combo}</p>
                </div>
              ))}
            </div>
            {gameMode === 'coop' && (
              <div className="bg-slate-700/50 rounded-lg p-3">
                <p className="text-slate-400 text-sm">PUNTUACIÓN TOTAL</p>
                <p className="text-3xl font-bold text-yellow-400">
                  {(players[0].score + players[1].score).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Single player score */
          <div className="mb-6">
            <p className="text-slate-400 text-sm">FINAL SCORE</p>
            <p className="text-5xl font-bold text-white mb-2">{score.toLocaleString()}</p>
            {isNewHighScore && (
              <p className="text-yellow-400 font-semibold animate-pulse">NEW HIGH SCORE!</p>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-700/50 rounded-lg p-3">
            <p className="text-slate-400 text-sm">{gameMode === 'duckhunt' ? 'ROUND REACHED' : 'WAVE REACHED'}</p>
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
            {isMultiplayer ? 'JUGAR DE NUEVO' : 'PLAY AGAIN'}
          </button>
          <button
            onClick={onMainMenu}
            className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Menú Principal
          </button>
        </div>
      </div>
    </div>
  );
}
