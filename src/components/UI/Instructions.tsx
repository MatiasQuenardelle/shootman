'use client';

interface InstructionsProps {
  onClose: () => void;
}

export function Instructions({ onClose }: InstructionsProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">How to Play</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-2xl"
          >
            &times;
          </button>
        </div>

        {/* Instructions */}
        <div className="space-y-6">
          {/* Gun gesture */}
          <div className="flex items-start gap-4">
            <div className="text-4xl flex-shrink-0">👉</div>
            <div>
              <h3 className="text-white font-semibold mb-1">Make a Gun Shape</h3>
              <p className="text-slate-400 text-sm">
                Extend your index and middle fingers while curling your ring and pinky fingers.
                Like making a &ldquo;finger gun&rdquo; gesture.
              </p>
            </div>
          </div>

          {/* Aiming */}
          <div className="flex items-start gap-4">
            <div className="text-4xl flex-shrink-0">🎯</div>
            <div>
              <h3 className="text-white font-semibold mb-1">Aim at Targets</h3>
              <p className="text-slate-400 text-sm">
                Point your &ldquo;finger gun&rdquo; at the targets on screen. A crosshair will follow
                your aim when the gun gesture is detected.
              </p>
            </div>
          </div>

          {/* Shooting */}
          <div className="flex items-start gap-4">
            <div className="text-4xl flex-shrink-0">💥</div>
            <div>
              <h3 className="text-white font-semibold mb-1">Shoot!</h3>
              <p className="text-slate-400 text-sm">
                Move your thumb quickly towards your index finger (like pulling a trigger)
                to fire. Time your shots carefully!
              </p>
            </div>
          </div>

          {/* Combos */}
          <div className="flex items-start gap-4">
            <div className="text-4xl flex-shrink-0">🔥</div>
            <div>
              <h3 className="text-white font-semibold mb-1">Build Combos</h3>
              <p className="text-slate-400 text-sm">
                Hit targets consecutively without missing to build your combo multiplier.
                Higher combos mean more points!
              </p>
            </div>
          </div>

          {/* Target types */}
          <div className="border-t border-slate-700 pt-4">
            <h3 className="text-white font-semibold mb-3">Target Types</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500" />
                <span className="text-slate-400 text-sm">Normal (100 pts)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-orange-500" />
                <span className="text-slate-400 text-sm">Fast (150 pts)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-500" />
                <span className="text-slate-400 text-sm">Small (200 pts)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500" />
                <span className="text-slate-400 text-sm">Bonus (500 pts)</span>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <h3 className="text-yellow-400 font-semibold mb-2">Tips</h3>
            <ul className="text-slate-400 text-sm space-y-1 list-disc list-inside">
              <li>Good lighting helps with hand detection</li>
              <li>Keep your hand visible to the camera</li>
              <li>Don&apos;t let targets escape off screen - you&apos;ll lose a life!</li>
              <li>Prioritize bonus (green) targets for big points</li>
            </ul>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full mt-6 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}
