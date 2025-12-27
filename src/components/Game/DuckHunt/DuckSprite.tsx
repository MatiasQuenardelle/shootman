'use client';

import { useEffect, useState } from 'react';
import { Duck } from '@/types';
import { DUCK_HUNT_CONFIG } from '@/constants/game';

interface DuckSpriteProps {
  duck: Duck;
}

export function DuckSprite({ duck }: DuckSpriteProps) {
  const [frame, setFrame] = useState(0);

  // Wing animation
  useEffect(() => {
    if (duck.state === 'flying' || duck.state === 'flyingAway') {
      const interval = setInterval(() => {
        setFrame((prev) => (prev + 1) % 3);
      }, DUCK_HUNT_CONFIG.WING_FLAP_SPEED);
      return () => clearInterval(interval);
    }
  }, [duck.state]);

  // Get duck colors based on type
  const getColors = () => {
    switch (duck.color) {
      case 'blue':
        return DUCK_HUNT_CONFIG.DUCK_BLUE;
      case 'red':
        return DUCK_HUNT_CONFIG.DUCK_RED;
      default:
        return DUCK_HUNT_CONFIG.DUCK_BLACK;
    }
  };

  const colors = getColors();
  const size = DUCK_HUNT_CONFIG.DUCK_SIZE;

  // Determine if duck is facing left or right based on velocity
  const facingLeft = duck.vx < 0;
  const rotation = duck.state === 'falling' ? 180 : 0;

  // Hit state shows duck with X eyes
  if (duck.state === 'hit') {
    return (
      <div
        className="absolute transition-none"
        style={{
          left: duck.x - size / 2,
          top: duck.y - size / 2,
          width: size,
          height: size,
          transform: `scaleX(${facingLeft ? -1 : 1})`,
        }}
      >
        <svg viewBox="0 0 60 60" width={size} height={size}>
          {/* Body */}
          <ellipse cx="30" cy="35" rx="18" ry="15" fill={colors.body} />
          {/* Head */}
          <circle cx="45" cy="25" r="12" fill={colors.head} />
          {/* X Eyes */}
          <text x="42" y="28" fontSize="12" fill="white" fontWeight="bold">X</text>
          {/* Beak */}
          <polygon points="55,25 65,23 55,28" fill={colors.beak} />
        </svg>
      </div>
    );
  }

  // Falling state
  if (duck.state === 'falling') {
    return (
      <div
        className="absolute transition-none"
        style={{
          left: duck.x - size / 2,
          top: duck.y - size / 2,
          width: size,
          height: size,
          transform: `rotate(${rotation}deg)`,
        }}
      >
        <svg viewBox="0 0 60 60" width={size} height={size}>
          {/* Body */}
          <ellipse cx="30" cy="35" rx="18" ry="15" fill={colors.body} />
          {/* Head */}
          <circle cx="30" cy="20" r="12" fill={colors.head} />
          {/* Closed eyes */}
          <line x1="25" y1="18" x2="30" y2="18" stroke="white" strokeWidth="2" />
          <line x1="30" y1="18" x2="35" y2="18" stroke="white" strokeWidth="2" />
          {/* Beak */}
          <polygon points="30,25 25,35 35,35" fill={colors.beak} />
          {/* Feet pointing up */}
          <line x1="25" y1="50" x2="20" y2="60" stroke={colors.feet} strokeWidth="3" />
          <line x1="35" y1="50" x2="40" y2="60" stroke={colors.feet} strokeWidth="3" />
        </svg>
      </div>
    );
  }

  // Flying state with wing animation
  const wingPositions = [
    // Frame 0: Wings up
    'M12,35 Q5,20 15,15',
    // Frame 1: Wings middle
    'M12,35 Q5,35 15,35',
    // Frame 2: Wings down
    'M12,35 Q5,50 15,50',
  ];

  return (
    <div
      className="absolute transition-none"
      style={{
        left: duck.x - size / 2,
        top: duck.y - size / 2,
        width: size,
        height: size,
        transform: `scaleX(${facingLeft ? -1 : 1})`,
        imageRendering: 'pixelated',
      }}
    >
      <svg viewBox="0 0 60 60" width={size} height={size}>
        {/* Wing (behind body) */}
        <path
          d={wingPositions[frame]}
          stroke={colors.wing}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
        />

        {/* Body */}
        <ellipse cx="25" cy="35" rx="18" ry="12" fill={colors.body} />

        {/* Head */}
        <circle cx="45" cy="28" r="10" fill={colors.head} />

        {/* Eye */}
        <circle cx="48" cy="26" r="4" fill="white" />
        <circle cx="49" cy="26" r="2" fill="black" />

        {/* Beak */}
        <polygon points="54,28 62,26 54,32" fill={colors.beak} />

        {/* Feet */}
        <line x1="20" y1="45" x2="15" y2="55" stroke={colors.feet} strokeWidth="3" />
        <line x1="30" y1="45" x2="35" y2="55" stroke={colors.feet} strokeWidth="3" />

        {/* Tail feathers */}
        <polygon points="8,30 2,25 2,35 8,40" fill={colors.body} />
      </svg>
    </div>
  );
}
