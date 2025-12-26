'use client';

import { AimPosition, CrosshairStyle, WeaponSkin } from '@/types';
import { GAME_CONFIG, WEAPON_SKINS } from '@/constants/game';
import { settingsManager } from '@/lib/settingsManager';

interface CrosshairProps {
  position: AimPosition;
  isGunShape: boolean;
  isShooting: boolean;
  isReloading?: boolean;
  reloadProgress?: number;
  ammo?: number;
  maxAmmo?: number;
  playerId?: 1 | 2;
  overrideColor?: string;
}

export function Crosshair({
  position,
  isGunShape,
  isShooting,
  isReloading = false,
  reloadProgress = 0,
  ammo,
  maxAmmo,
  playerId,
  overrideColor,
}: CrosshairProps) {
  const size = GAME_CONFIG.CROSSHAIR_SIZE;
  const halfSize = size / 2;

  const settings = settingsManager.getAll();
  const skin = WEAPON_SKINS[settings.weaponSkin];
  const style = settings.crosshairStyle;

  // Use override color for multiplayer, otherwise use skin color
  const color = overrideColor || skin.crosshairColor;
  const activeOpacity = isGunShape ? 1 : 0.5;

  const renderCrosshair = () => {
    switch (style) {
      case 'dot':
        return (
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: isShooting ? 16 : 12,
              height: isShooting ? 16 : 12,
              backgroundColor: isShooting ? '#fbbf24' : color,
              opacity: activeOpacity,
            }}
          />
        );

      case 'circle':
        return (
          <>
            <div
              className="absolute inset-0 rounded-full border-2"
              style={{
                borderColor: color,
                opacity: activeOpacity,
                transform: isShooting ? 'scale(1.5)' : 'scale(1)',
                transition: 'transform 0.1s',
              }}
            />
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: 6,
                height: 6,
                backgroundColor: color,
                opacity: activeOpacity,
              }}
            />
          </>
        );

      case 'triangle':
        return (
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              width: 0,
              height: 0,
              borderLeft: '15px solid transparent',
              borderRight: '15px solid transparent',
              borderBottom: `26px solid ${color}`,
              opacity: activeOpacity,
              transform: isShooting ? 'scale(1.3)' : 'scale(1)',
              transition: 'transform 0.1s',
            }}
          />
        );

      case 'diamond':
        return (
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              width: 20,
              height: 20,
              backgroundColor: color,
              opacity: activeOpacity,
              transform: `rotate(45deg) ${isShooting ? 'scale(1.3)' : 'scale(1)'}`,
              transition: 'transform 0.1s',
            }}
          />
        );

      default: // 'default'
        return (
          <>
            {/* Outer ring */}
            <div
              className="absolute inset-0 rounded-full border-2 transition-all duration-100"
              style={{
                borderColor: isShooting ? '#fbbf24' : color,
                opacity: isShooting ? 0 : activeOpacity,
                transform: isShooting ? 'scale(1.5)' : 'scale(1)',
              }}
            />

            {/* Inner dot */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-100"
              style={{
                width: isShooting ? 16 : 12,
                height: isShooting ? 16 : 12,
                backgroundColor: isShooting ? '#fbbf24' : color,
              }}
            />

            {/* Crosshair lines */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-4"
              style={{ backgroundColor: color, opacity: activeOpacity }}
            />
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-4"
              style={{ backgroundColor: color, opacity: activeOpacity }}
            />
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-1"
              style={{ backgroundColor: color, opacity: activeOpacity }}
            />
            <div
              className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-1"
              style={{ backgroundColor: color, opacity: activeOpacity }}
            />
          </>
        );
    }
  };

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
      {renderCrosshair()}

      {/* Muzzle flash effect */}
      {isShooting && (
        <div className="absolute inset-0 animate-ping">
          <div
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: `${skin.muzzleFlashColor}80` }}
          />
        </div>
      )}

      {/* Laser trail (for laser skin) */}
      {skin.trailColor && isGunShape && (
        <div
          className="absolute top-1/2 left-1/2 w-1 h-32 origin-top"
          style={{
            backgroundColor: `${skin.trailColor}40`,
            transform: 'translateX(-50%)',
          }}
        />
      )}

      {/* Reload indicator */}
      {isReloading && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-16">
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-400 transition-all duration-100"
              style={{ width: `${reloadProgress * 100}%` }}
            />
          </div>
          <p className="text-yellow-400 text-xs text-center mt-1">RELOADING</p>
        </div>
      )}

      {/* Ammo counter */}
      {ammo !== undefined && maxAmmo !== undefined && !isReloading && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
          <p
            className="text-sm font-bold"
            style={{ color: ammo === 0 ? '#ef4444' : color }}
          >
            {ammo}/{maxAmmo}
          </p>
        </div>
      )}

      {/* Player indicator */}
      {playerId && (
        <div
          className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold px-2 py-0.5 rounded"
          style={{
            backgroundColor: color,
            color: 'white',
          }}
        >
          P{playerId}
        </div>
      )}
    </div>
  );
}
