'use client';

import { DUCK_HUNT_CONFIG } from '@/constants/game';

export function DuckHuntBackground() {
  const colors = DUCK_HUNT_CONFIG;

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ imageRendering: 'pixelated' }}>
      {/* Sky */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: colors.SKY_COLOR }}
      />

      {/* Tree on the left */}
      <svg
        className="absolute left-[5%] bottom-[25%]"
        width="180"
        height="400"
        viewBox="0 0 180 400"
        style={{ imageRendering: 'pixelated' }}
      >
        {/* Tree trunk */}
        <rect x="70" y="150" width="40" height="250" fill={colors.TREE_TRUNK} />
        <rect x="50" y="200" width="20" height="80" fill={colors.TREE_TRUNK} />
        <rect x="110" y="180" width="20" height="60" fill={colors.TREE_TRUNK} />

        {/* Tree foliage clusters (pixel-style circles) */}
        {/* Main top cluster */}
        <circle cx="90" cy="60" r="50" fill={colors.TREE_FOLIAGE} />
        <circle cx="60" cy="80" r="40" fill={colors.TREE_FOLIAGE} />
        <circle cx="120" cy="80" r="40" fill={colors.TREE_FOLIAGE} />

        {/* Left branch foliage */}
        <circle cx="35" cy="180" r="35" fill={colors.TREE_FOLIAGE} />
        <circle cx="55" cy="150" r="30" fill={colors.TREE_FOLIAGE} />

        {/* Right branch foliage */}
        <circle cx="140" cy="160" r="35" fill={colors.TREE_FOLIAGE} />
        <circle cx="130" cy="130" r="30" fill={colors.TREE_FOLIAGE} />

        {/* Middle foliage */}
        <circle cx="90" cy="120" r="35" fill={colors.TREE_FOLIAGE} />
      </svg>

      {/* Small bush on the right */}
      <svg
        className="absolute right-[15%] bottom-[25%]"
        width="120"
        height="80"
        viewBox="0 0 120 80"
        style={{ imageRendering: 'pixelated' }}
      >
        <circle cx="30" cy="50" r="30" fill={colors.TREE_FOLIAGE} />
        <circle cx="60" cy="40" r="35" fill={colors.TREE_FOLIAGE} />
        <circle cx="90" cy="50" r="30" fill={colors.TREE_FOLIAGE} />
      </svg>

      {/* Grass layer */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: '25%' }}>
        {/* Tall grass background */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: colors.GRASS_LIGHT }}
        />

        {/* Grass blades pattern */}
        <svg
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
          style={{ imageRendering: 'pixelated' }}
        >
          {/* Create repeating grass blade pattern */}
          <defs>
            <pattern id="grassPattern" patternUnits="userSpaceOnUse" width="20" height="40">
              <rect width="20" height="40" fill={colors.GRASS_LIGHT} />
              <rect x="0" y="0" width="4" height="25" fill={colors.GRASS_DARK} />
              <rect x="6" y="5" width="3" height="20" fill={colors.GRASS_DARK} />
              <rect x="12" y="2" width="4" height="23" fill={colors.GRASS_DARK} />
              <rect x="17" y="8" width="3" height="17" fill={colors.GRASS_DARK} />
            </pattern>
          </defs>
          <rect width="100%" height="60%" fill="url(#grassPattern)" />
        </svg>

        {/* Dirt layer at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: '40%',
            backgroundColor: colors.DIRT_COLOR,
          }}
        >
          {/* Dirt texture dots */}
          <svg className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <pattern id="dirtPattern" patternUnits="userSpaceOnUse" width="30" height="20">
                <rect width="30" height="20" fill={colors.DIRT_COLOR} />
                <circle cx="5" cy="5" r="2" fill="#8B4513" />
                <circle cx="15" cy="12" r="1.5" fill="#8B4513" />
                <circle cx="25" cy="7" r="2" fill="#8B4513" />
                <circle cx="10" cy="16" r="1" fill="#8B4513" />
                <circle cx="22" cy="3" r="1.5" fill="#8B4513" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dirtPattern)" />
          </svg>
        </div>
      </div>
    </div>
  );
}
