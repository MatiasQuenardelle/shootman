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
    <div className="fixed inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Animated background stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[15%] w-1 h-1 bg-white rounded-full opacity-60 animate-pulse" />
        <div className="absolute top-[20%] right-[20%] w-1.5 h-1.5 bg-white rounded-full opacity-40 animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-[35%] left-[8%] w-1 h-1 bg-white rounded-full opacity-50 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[15%] right-[35%] w-1 h-1 bg-blue-300 rounded-full opacity-60 animate-pulse" style={{ animationDelay: '0.3s' }} />
        <div className="absolute bottom-[30%] left-[25%] w-1 h-1 bg-white rounded-full opacity-40 animate-pulse" style={{ animationDelay: '0.7s' }} />
        <div className="absolute bottom-[25%] right-[10%] w-1.5 h-1.5 bg-red-300 rounded-full opacity-50 animate-pulse" style={{ animationDelay: '1.2s' }} />
        <div className="absolute top-[50%] left-[5%] w-1 h-1 bg-white rounded-full opacity-30 animate-pulse" style={{ animationDelay: '0.9s' }} />
        <div className="absolute top-[45%] right-[8%] w-1 h-1 bg-yellow-300 rounded-full opacity-50 animate-pulse" style={{ animationDelay: '0.4s' }} />
      </div>

      {/* Title */}
      <div className="text-center mb-8 md:mb-12 relative z-10">
        <div className="mb-4">
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tight">
            <span className="text-red-500 animate-glow-pulse">SHOOT</span>
            <span className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">MAN</span>
          </h1>
        </div>
        <div className="relative">
          <p className="text-slate-400 text-base md:text-lg tracking-widest uppercase">
            Dispara con tus manos
          </p>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
        </div>
        <div className="text-3xl md:text-4xl mt-6 flex justify-center gap-3 animate-float">
          <span className="hover:scale-125 transition-transform cursor-default">🛸</span>
          <span className="hover:scale-125 transition-transform cursor-default" style={{ animationDelay: '0.1s' }}>👽</span>
          <span className="hover:scale-125 transition-transform cursor-default" style={{ animationDelay: '0.2s' }}>☄️</span>
          <span className="hover:scale-125 transition-transform cursor-default" style={{ animationDelay: '0.3s' }}>🪐</span>
        </div>
      </div>

      {/* Gun gesture illustration */}
      <div className="mb-8 md:mb-12 text-center relative z-10">
        <div className="relative inline-block">
          <div className="text-7xl md:text-8xl animate-pulse-scale">
            <span role="img" aria-label="mano apuntando">👉</span>
          </div>
          <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-yellow-400/20 rounded-full animate-ping" />
        </div>
        <p className="text-slate-400 mt-4 text-sm md:text-base">
          Forma una pistola con tu mano para apuntar
        </p>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-3 md:gap-4 w-full max-w-xs relative z-10">
        <button
          onClick={onLevelSelect}
          className="group relative bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold py-4 px-8 rounded-xl text-xl transition-all duration-300 shadow-lg shadow-red-500/40 hover:shadow-red-500/60 hover:scale-105 active:scale-95 overflow-hidden"
        >
          <span className="relative z-10">NIVELES</span>
          <div className="absolute inset-0 animate-shimmer" />
        </button>
        <button
          onClick={onStart}
          className="group bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 active:scale-95"
        >
          MODO INFINITO
        </button>
        <button
          onClick={onShowInstructions}
          className="bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 border border-slate-700 hover:border-slate-600"
        >
          Cómo Jugar
        </button>
      </div>

      {/* Stats */}
      {(highScore > 0 || totalStars > 0) && (
        <div className="mt-8 flex gap-6 md:gap-10 text-center relative z-10">
          {highScore > 0 && (
            <div className="bg-slate-800/50 rounded-xl px-5 py-3 border border-slate-700/50">
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Récord</p>
              <p className="text-yellow-400 text-2xl font-bold">{highScore.toLocaleString()}</p>
            </div>
          )}
          {totalStars > 0 && (
            <div className="bg-slate-800/50 rounded-xl px-5 py-3 border border-slate-700/50">
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Estrellas</p>
              <p className="text-yellow-400 text-2xl font-bold flex items-center justify-center gap-1">
                {totalStars} <span className="text-lg">/ 30</span> <span className="text-yellow-300">★</span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Requirements notice */}
      <div className="absolute bottom-4 left-4 right-4 text-center text-slate-600 text-xs md:text-sm">
        <p className="flex items-center justify-center gap-2">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Requiere acceso a la cámara y buena iluminación
        </p>
      </div>
    </div>
  );
}
