'use client';

import { PowerUp as PowerUpType } from '@/types';
import { POWERUP_CONFIG } from '@/constants/game';

interface PowerUpProps {
  powerUp: PowerUpType;
}

export function PowerUp({ powerUp }: PowerUpProps) {
  const config = POWERUP_CONFIG[powerUp.type];
  const age = Date.now() - powerUp.spawnTime;
  const pulseScale = 1 + Math.sin(age * 0.005) * 0.1;
  const rotation = age * 0.05;

  // Fade out in last 2 seconds
  const opacity = age > 8000 ? Math.max(0, 1 - (age - 8000) / 2000) : 1;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: powerUp.x - powerUp.size / 2,
        top: powerUp.y - powerUp.size / 2,
        width: powerUp.size,
        height: powerUp.size,
        opacity,
      }}
    >
      {/* Glow effect */}
      <div
        className="absolute inset-0 rounded-full blur-md"
        style={{
          backgroundColor: config.color,
          opacity: 0.5,
          transform: `scale(${pulseScale * 1.3})`,
        }}
      />

      {/* Main circle */}
      <div
        className="absolute inset-0 rounded-full border-2 flex items-center justify-center"
        style={{
          backgroundColor: `${config.color}33`,
          borderColor: config.color,
          transform: `scale(${pulseScale}) rotate(${rotation}deg)`,
          boxShadow: `0 0 20px ${config.color}66`,
        }}
      >
        <span className="text-2xl">{config.icon}</span>
      </div>

      {/* Orbiting particles */}
      {[0, 120, 240].map((angle, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: config.color,
            left: '50%',
            top: '50%',
            transform: `rotate(${rotation + angle}deg) translateX(${powerUp.size * 0.4}px) translateY(-50%)`,
          }}
        />
      ))}
    </div>
  );
}
