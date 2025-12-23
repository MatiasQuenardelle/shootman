'use client';

import { Target as TargetType } from '@/types';
import { getTargetColor } from '@/lib/targetManager';

interface TargetProps {
  target: TargetType;
  isHit?: boolean;
  isGhost?: boolean; // for Ghost Hunt level
  shrinkProgress?: number; // 0-1 for shrinking targets
}

export function Target({ target, isHit = false, isGhost = false, shrinkProgress = 0 }: TargetProps) {
  const color = getTargetColor(target.type);

  // Calculate actual size if shrinking
  const actualSize = shrinkProgress > 0
    ? Math.max(target.baseSize * (1 - shrinkProgress * 0.7), 15) // shrink to min 15px
    : target.size;
  const halfSize = actualSize / 2;

  // Calculate ghost opacity (pulsing between 0.2 and 1.0)
  const ghostOpacity = isGhost
    ? 0.3 + 0.7 * Math.abs(Math.sin((Date.now() - target.spawnTime) / 800))
    : 1;

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

      {/* Type indicator for special targets */}
      {target.type === 'bonus' && (
        <span className="absolute text-white font-bold text-xs">$</span>
      )}
      {target.type === 'fast' && (
        <span className="absolute text-white font-bold text-xs">F</span>
      )}
    </div>
  );
}
