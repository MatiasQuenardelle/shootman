import { PowerUp, PowerUpType, ActivePowerUp } from '@/types';
import { GAME_CONFIG, POWERUP_CONFIG } from '@/constants/game';

let powerUpIdCounter = 0;

function generateId(): string {
  return `powerup-${++powerUpIdCounter}-${Date.now()}`;
}

const POWERUP_TYPES: PowerUpType[] = ['slowmo', 'rapidfire', 'spreadshot', 'magnet', 'shield', 'doublepoints'];

export function createPowerUp(
  screenWidth: number,
  screenHeight: number
): PowerUp {
  const type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
  const margin = 100;

  return {
    id: generateId(),
    type,
    x: margin + Math.random() * (screenWidth - margin * 2),
    y: margin + Math.random() * (screenHeight - margin * 2),
    size: GAME_CONFIG.POWERUP_SIZE,
    spawnTime: Date.now(),
    duration: GAME_CONFIG.POWERUP_DURATION[type],
  };
}

export function isPowerUpExpired(powerUp: PowerUp): boolean {
  // Power-ups disappear after 10 seconds if not collected
  return Date.now() - powerUp.spawnTime > 10000;
}

export function checkPowerUpCollision(
  aimX: number,
  aimY: number,
  powerUp: PowerUp
): boolean {
  const dx = aimX - powerUp.x;
  const dy = aimY - powerUp.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance <= powerUp.size / 2 + 30; // 30px pickup radius
}

export function activatePowerUp(
  powerUp: PowerUp,
  playerId?: 1 | 2
): ActivePowerUp {
  return {
    type: powerUp.type,
    endTime: Date.now() + powerUp.duration,
    playerId,
  };
}

export function isActivePowerUpExpired(activePowerUp: ActivePowerUp): boolean {
  return Date.now() >= activePowerUp.endTime;
}

export function hasPowerUp(
  activePowerUps: ActivePowerUp[],
  type: PowerUpType,
  playerId?: 1 | 2
): boolean {
  return activePowerUps.some(
    (p) => p.type === type && !isActivePowerUpExpired(p) && (playerId === undefined || p.playerId === playerId)
  );
}

export function getPowerUpRemainingTime(
  activePowerUps: ActivePowerUp[],
  type: PowerUpType,
  playerId?: 1 | 2
): number {
  const powerUp = activePowerUps.find(
    (p) => p.type === type && !isActivePowerUpExpired(p) && (playerId === undefined || p.playerId === playerId)
  );
  return powerUp ? Math.max(0, powerUp.endTime - Date.now()) : 0;
}

export function getPowerUpConfig(type: PowerUpType) {
  return POWERUP_CONFIG[type];
}

export function cleanupExpiredPowerUps(activePowerUps: ActivePowerUp[]): ActivePowerUp[] {
  return activePowerUps.filter((p) => !isActivePowerUpExpired(p));
}
