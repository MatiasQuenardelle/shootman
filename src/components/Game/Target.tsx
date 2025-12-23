'use client';

import { Target as TargetType } from '@/types';
import { getTargetColor } from '@/lib/targetManager';

interface TargetProps {
  target: TargetType;
  isHit?: boolean;
}

export function Target({ target, isHit = false }: TargetProps) {
  const color = getTargetColor(target.type);
  const halfSize = target.size / 2;

  return (
    <div
      className={`absolute rounded-full flex items-center justify-center transition-transform ${
        isHit ? 'scale-150 opacity-0' : ''
      }`}
      style={{
        left: target.x - halfSize,
        top: target.y - halfSize,
        width: target.size,
        height: target.size,
        backgroundColor: color,
        boxShadow: `0 0 ${target.size / 4}px ${color}, 0 0 ${target.size / 2}px ${color}40`,
        transition: isHit ? 'all 0.2s ease-out' : 'none',
      }}
    >
      {/* Inner rings for visual depth */}
      <div
        className="absolute rounded-full"
        style={{
          width: target.size * 0.7,
          height: target.size * 0.7,
          border: `2px solid rgba(255, 255, 255, 0.3)`,
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: target.size * 0.4,
          height: target.size * 0.4,
          border: `2px solid rgba(255, 255, 255, 0.5)`,
        }}
      />
      <div
        className="absolute rounded-full bg-white/30"
        style={{
          width: target.size * 0.15,
          height: target.size * 0.15,
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
