'use client';

import { AimPosition } from '@/types';
import { GAME_CONFIG } from '@/constants/game';

interface CrosshairProps {
  position: AimPosition;
  isGunShape: boolean;
  isShooting: boolean;
}

export function Crosshair({ position, isGunShape, isShooting }: CrosshairProps) {
  const size = GAME_CONFIG.CROSSHAIR_SIZE;
  const halfSize = size / 2;

  return (
    <div
      className="absolute pointer-events-none transition-transform duration-75"
      style={{
        left: position.x - halfSize,
        top: position.y - halfSize,
        width: size,
        height: size,
      }}
    >
      {/* Outer ring */}
      <div
        className={`absolute inset-0 rounded-full border-2 transition-all duration-100 ${
          isShooting
            ? 'border-yellow-400 scale-150 opacity-0'
            : isGunShape
            ? 'border-red-500'
            : 'border-red-500/50'
        }`}
      />

      {/* Inner dot */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-100 ${
          isShooting ? 'w-4 h-4 bg-yellow-400' : 'w-3 h-3 bg-red-500'
        }`}
      />

      {/* Crosshair lines */}
      <div
        className={`absolute top-0 left-1/2 -translate-x-1/2 w-1 h-4 ${
          isGunShape ? 'bg-red-500' : 'bg-red-500/50'
        }`}
      />
      <div
        className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-4 ${
          isGunShape ? 'bg-red-500' : 'bg-red-500/50'
        }`}
      />
      <div
        className={`absolute left-0 top-1/2 -translate-y-1/2 w-4 h-1 ${
          isGunShape ? 'bg-red-500' : 'bg-red-500/50'
        }`}
      />
      <div
        className={`absolute right-0 top-1/2 -translate-y-1/2 w-4 h-1 ${
          isGunShape ? 'bg-red-500' : 'bg-red-500/50'
        }`}
      />

      {/* Muzzle flash effect */}
      {isShooting && (
        <div className="absolute inset-0 animate-ping">
          <div className="absolute inset-0 rounded-full bg-yellow-400/50" />
        </div>
      )}
    </div>
  );
}
