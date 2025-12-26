'use client';

import { Target as TargetType } from '@/types';
import { getTargetColor, getTargetEmoji } from '@/lib/targetManager';

interface TargetProps {
  target: TargetType;
  isHit?: boolean;
  isGhost?: boolean;
  shrinkProgress?: number;
}

export function Target({ target, isHit = false, isGhost = false, shrinkProgress = 0 }: TargetProps) {
  const color = getTargetColor(target.type);
  const emoji = getTargetEmoji(target.type);

  // Calculate actual size if shrinking
  const actualSize = shrinkProgress > 0
    ? Math.max(target.baseSize * (1 - shrinkProgress * 0.7), 15)
    : target.size;
  const halfSize = actualSize / 2;

  // Calculate ghost opacity (pulsing between 0.2 and 1.0)
  const ghostOpacity = isGhost
    ? 0.3 + 0.7 * Math.abs(Math.sin((Date.now() - target.spawnTime) / 800))
    : 1;

  // Boss target
  if (target.isBoss) {
    const healthPercent = (target.health / target.maxHealth) * 100;
    return (
      <div
        className={`absolute transition-transform ${isHit ? 'scale-110 opacity-80' : ''}`}
        style={{
          left: target.x - halfSize,
          top: target.y - halfSize,
          width: actualSize,
          height: actualSize,
          transition: isHit ? 'all 0.1s ease-out' : 'none',
          opacity: isHit ? 0.8 : ghostOpacity,
        }}
      >
        {/* Boss body */}
        <div
          className="absolute inset-0 rounded-full border-4 border-orange-800"
          style={{
            background: `radial-gradient(circle at 30% 30%, #7c2d12, #431407)`,
            boxShadow: `0 0 ${actualSize / 3}px #dc2626, 0 0 ${actualSize}px #dc262640`,
          }}
        >
          {/* Boss face */}
          <div className="absolute inset-4 flex items-center justify-center text-6xl animate-pulse">
            👹
          </div>
        </div>
        {/* Health bar */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-3 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-200"
            style={{ width: `${healthPercent}%` }}
          />
        </div>
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-white font-bold">
          BOSS
        </div>
      </div>
    );
  }

  // Sprite-based targets
  const spriteMap: Record<string, string> = {
    ufo: '/sprite-ufo.png',
    alien: '/sprite-alien.png',
    meteor: '/sprite-rocket.png',
    planet: '/sprite-ufo.png',
  };

  const spriteTypes = ['ufo', 'alien', 'meteor', 'planet'];
  if (spriteTypes.includes(target.type)) {
    const spriteUrl = spriteMap[target.type];

    return (
      <div
        className={`absolute transition-transform ${isHit ? 'scale-150 opacity-0' : ''}`}
        style={{
          left: target.x - halfSize,
          top: target.y - halfSize,
          width: actualSize,
          height: actualSize,
          backgroundImage: `url(${spriteUrl})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated',
          transition: isHit ? 'all 0.2s ease-out' : 'none',
          opacity: isHit ? 0 : ghostOpacity,
          filter: `drop-shadow(0 0 ${actualSize / 6}px ${color})`,
        }}
      >
        {target.health > 1 && (
          <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
            {target.health}
          </div>
        )}
      </div>
    );
  }

  // New special target types with emojis
  const emojiTypes = ['explosive', 'split', 'shield', 'decoy', 'timefreeze'];
  if (emojiTypes.includes(target.type) && emoji) {
    return (
      <div
        className={`absolute transition-transform ${isHit ? 'scale-150 opacity-0' : ''}`}
        style={{
          left: target.x - halfSize,
          top: target.y - halfSize,
          width: actualSize,
          height: actualSize,
          transition: isHit ? 'all 0.2s ease-out' : 'none',
          opacity: isHit ? 0 : ghostOpacity,
        }}
      >
        {/* Background circle */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            backgroundColor: `${color}40`,
            border: `3px solid ${color}`,
            boxShadow: `0 0 ${actualSize / 4}px ${color}, 0 0 ${actualSize / 2}px ${color}40`,
          }}
        />
        {/* Shield indicator */}
        {target.shieldActive && (
          <div
            className="absolute inset-0 rounded-full border-4 border-cyan-400 animate-pulse"
            style={{ boxShadow: '0 0 15px #22d3ee' }}
          />
        )}
        {/* Emoji */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ fontSize: actualSize * 0.5 }}
        >
          {emoji}
        </div>
        {/* Health indicator */}
        {target.health > 1 && (
          <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
            {target.health}
          </div>
        )}
      </div>
    );
  }

  // Original circular targets for normal, fast, small, bonus
  return (
    <div
      className={`absolute rounded-full flex items-center justify-center transition-transform ${
        isHit ? 'scale-150 opacity-0' : ''
      }`}
      style={{
        left: target.x - halfSize,
        top: target.y - halfSize,
        width: actualSize,
        height: actualSize,
        backgroundColor: color,
        boxShadow: `0 0 ${actualSize / 4}px ${color}, 0 0 ${actualSize / 2}px ${color}40`,
        transition: isHit ? 'all 0.2s ease-out' : 'none',
        opacity: isHit ? 0 : ghostOpacity,
      }}
    >
      {/* Inner rings for visual depth */}
      <div
        className="absolute rounded-full"
        style={{
          width: actualSize * 0.7,
          height: actualSize * 0.7,
          border: `2px solid rgba(255, 255, 255, 0.3)`,
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: actualSize * 0.4,
          height: actualSize * 0.4,
          border: `2px solid rgba(255, 255, 255, 0.5)`,
        }}
      />
      <div
        className="absolute rounded-full bg-white/30"
        style={{
          width: actualSize * 0.15,
          height: actualSize * 0.15,
        }}
      />

      {/* Type indicator */}
      {target.type === 'bonus' && (
        <span className="absolute text-white font-bold text-xs">$</span>
      )}
      {target.type === 'fast' && (
        <span className="absolute text-white font-bold text-xs">F</span>
      )}
    </div>
  );
}
